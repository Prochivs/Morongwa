import { Router } from "express";
import multer from "multer";
import { paymentProofMetadataSchema } from "@queuemate/shared";
import { prisma } from "../../config/prisma.js";
import { authenticate, requireCsrf } from "../../middleware/auth.js";
import { audit } from "../../services/audit.js";
import { notify, notifyAdmins } from "../../services/notifications.js";
import { getPrivateFile, putPrivateFile } from "../../services/storage.js";
import { AppError, asyncHandler, ok, parseBody } from "../../utils/http.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
router.use("/payments", authenticate);

router.get("/payments/bank-details", asyncHandler(async (_request, response) => {
  const setting = await prisma.systemSetting.findUnique({ where: { key: "bank.account" }, select: { value: true } });
  if (!setting) throw new AppError(503, "BANK_DETAILS_UNAVAILABLE", "Bank transfer details have not been configured");
  return ok(response, setting.value);
}));

router.post("/payments/:requestId/proof", requireCsrf, upload.single("proof"), asyncHandler(async (request, response) => {
  if (request.auth!.role !== "CUSTOMER") throw new AppError(403, "FORBIDDEN", "Only customers can upload payment proof");
  if (!request.file) throw new AppError(422, "FILE_REQUIRED", "Choose a payment proof file");
  const metadata = parseBody(paymentProofMetadataSchema, request.body);
  const serviceRequest = await prisma.serviceRequest.findFirst({ where: { id: request.params.requestId, customerId: request.auth!.userId }, include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!serviceRequest || !serviceRequest.payments[0]) throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment record not found");
  if (["VERIFIED", "REFUNDED"].includes(serviceRequest.paymentStatus)) throw new AppError(409, "PAYMENT_FINAL", "This payment has already been finalised");
  const stored = await putPrivateFile(`payments/${serviceRequest.reference}`, request.file);
  const payment = serviceRequest.payments[0];
  const updated = await prisma.$transaction(async (transaction) => {
    const changed = await transaction.payment.update({ where: { id: payment.id }, data: { amountSubmitted: metadata.amountSubmitted, paymentReference: metadata.paymentReference, status: "PROOF_UPLOADED", proofs: { create: { storageKey: stored.key, originalName: request.file!.originalname, mimeType: request.file!.mimetype, sizeBytes: request.file!.size, sha256: stored.sha256 } } }, include: { proofs: true } });
    await transaction.serviceRequest.update({ where: { id: serviceRequest.id }, data: { paymentStatus: "PROOF_UPLOADED", requestStatus: "PAYMENT_REVIEW" } });
    await transaction.auditLog.create({ data: { actorId: request.auth!.userId, action: "PAYMENT_PROOF_UPLOADED", entityType: "Payment", entityId: payment.id, after: { amountSubmitted: metadata.amountSubmitted, paymentReference: metadata.paymentReference } } });
    await notify({ userId: request.auth!.userId, requestId: serviceRequest.id, event: "PROOF_UPLOADED", title: "Payment proof received", message: `Proof for ${serviceRequest.reference} is awaiting manual verification.` }, transaction);
    await notifyAdmins({ requestId: serviceRequest.id, event: "PROOF_UPLOADED", title: "Payment proof needs review", message: `${serviceRequest.reference} has a new payment proof.` }, transaction);
    return changed;
  });
  return ok(response, updated, 201);
}));

router.get("/payments/:requestId", asyncHandler(async (request, response) => {
  const where = request.auth!.role === "CUSTOMER" ? { id: request.params.requestId, customerId: request.auth!.userId } : { id: request.params.requestId };
  const item = await prisma.serviceRequest.findFirst({ where, select: { id: true, reference: true, quotedAmount: true, currency: true, paymentStatus: true, payments: { select: { id: true, amountExpected: true, amountSubmitted: true, paymentReference: true, status: true, verificationNotes: true, verifiedAt: true, proofs: { select: { id: true, originalName: true, mimeType: true, uploadedAt: true } } } } } });
  if (!item || request.auth!.role === "AGENT") throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment record not found");
  return ok(response, item);
}));

router.get("/payments/proofs/:proofId/file", asyncHandler(async (request, response) => {
  const proof = await prisma.paymentProof.findUnique({ where: { id: request.params.proofId }, include: { payment: { include: { request: { select: { customerId: true } } } } } });
  if (!proof || (request.auth!.role === "CUSTOMER" && proof.payment.request.customerId !== request.auth!.userId) || request.auth!.role === "AGENT") throw new AppError(404, "PROOF_NOT_FOUND", "Payment proof not found");
  const object = await getPrivateFile(proof.storageKey);
  if (!object.Body) throw new AppError(404, "FILE_NOT_FOUND", "Stored file not found");
  const bytes = await object.Body.transformToByteArray();
  response.setHeader("Content-Type", proof.mimeType);
  response.setHeader("Content-Disposition", `inline; filename="${proof.originalName.replace(/[\"\\]/g, "")}"`);
  response.setHeader("Cache-Control", "private, no-store");
  return response.send(Buffer.from(bytes));
}));

export default router;
