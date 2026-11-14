import { Router } from "express";
import { Prisma } from "@prisma/client";
import { fromZonedTime } from "date-fns-tz";
import { cancellationSchema, createRequestSchema } from "@queuemate/shared";
import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { authenticate, authorise, requireCsrf } from "../../middleware/auth.js";
import { audit } from "../../services/audit.js";
import { notify, notifyAdmins } from "../../services/notifications.js";
import { AppError, asyncHandler, ok, pagination, parseBody } from "../../utils/http.js";

const router = Router();
router.use(["/customers", "/requests", "/notifications"], authenticate, authorise("CUSTOMER"));

router.get("/customers/profile", asyncHandler(async (request, response) => {
  const profile = await prisma.user.findUniqueOrThrow({
    where: { id: request.auth!.userId },
    select: { id: true, fullName: true, email: true, mobile: true, emailVerifiedAt: true, createdAt: true, customerProfile: true },
  });
  return ok(response, profile);
}));

router.patch("/customers/profile", requireCsrf, asyncHandler(async (request, response) => {
  const allowed = (({ fullName, mobile, altMobile, address }: Record<string, unknown>) => ({ fullName, mobile, altMobile, address }))(request.body);
  const profile = await prisma.user.update({
    where: { id: request.auth!.userId },
    data: {
      ...(typeof allowed.fullName === "string" ? { fullName: allowed.fullName.trim() } : {}),
      ...(typeof allowed.mobile === "string" ? { mobile: allowed.mobile.trim() } : {}),
      customerProfile: { update: { ...(typeof allowed.altMobile === "string" ? { altMobile: allowed.altMobile.trim() } : {}), ...(typeof allowed.address === "string" ? { address: allowed.address.trim() } : {}) } },
    },
    select: { id: true, fullName: true, email: true, mobile: true, customerProfile: true },
  });
  await audit(request, "CUSTOMER_PROFILE_UPDATED", "User", request.auth!.userId);
  return ok(response, profile);
}));

router.post("/requests", requireCsrf, asyncHandler(async (request, response) => {
  const input = parseBody(createRequestSchema, request.body);
  const institution = await prisma.institution.findFirst({
    where: { id: input.institutionId, active: true, OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }], permissions: { some: { serviceTypeId: input.serviceTypeId, permitted: true } } },
    include: { permissions: { where: { serviceTypeId: input.serviceTypeId }, take: 1 } },
  });
  if (!institution) throw new AppError(422, "INSTITUTION_NOT_ELIGIBLE", "This institution is not currently approved for the requested assistance");

  const requestedStart = fromZonedTime(`${input.requestedDate}T${input.preferredArrivalTime}:00`, env.BUSINESS_TIMEZONE);
  if (requestedStart <= new Date()) throw new AppError(422, "DATE_IN_PAST", "Choose a future date and time");
  const pricing = await prisma.pricingRule.findFirst({
    where: { serviceTypeId: input.serviceTypeId, active: true, effectiveFrom: { lte: requestedStart }, OR: [{ effectiveTo: null }, { effectiveTo: { isSet: false } }, { effectiveTo: { gte: requestedStart } }], type: "FIXED" },
    orderBy: { amount: "asc" },
  });
  if (!pricing?.amount) throw new AppError(422, "QUOTE_REQUIRED", "This request needs a custom quote. Please contact QueueMate");
  const quotedAmount = pricing.amount;

  const serviceRequest = await prisma.$transaction(async (transaction) => {
    const year = requestedStart.getUTCFullYear();
    const counter = await transaction.systemCounter.upsert({ where: { key: `request:${year}` }, create: { key: `request:${year}`, value: 1 }, update: { value: { increment: 1 } } });
    const reference = `QM-${year}-${String(counter.value).padStart(6, "0")}`;
    const created = await transaction.serviceRequest.create({
      data: {
        reference,
        customerId: request.auth!.userId,
        institutionId: input.institutionId,
        serviceTypeId: input.serviceTypeId,
        pricingRuleId: pricing.id,
        requestedDate: new Date(`${input.requestedDate}T00:00:00.000Z`),
        preferredArrivalTime: input.preferredArrivalTime,
        scheduledStartAt: requestedStart,
        estimatedDurationMinutes: institution.estimatedDurationMinutes,
        locationInstructions: input.locationInstructions,
        assistanceFor: input.assistanceFor,
        instructions: input.instructions,
        contactName: input.contactName,
        contactMobile: input.contactMobile,
        alternativeMobile: input.alternativeMobile || null,
        contactEmail: input.contactEmail,
        onSiteContact: input.onSiteContact,
        quotedAmount,
        currency: pricing.currency,
        termsAcceptedAt: new Date(),
        payments: { create: { amountExpected: quotedAmount, currency: pricing.currency } },
      },
      include: { institution: { select: { name: true } }, serviceType: { select: { name: true } }, payments: true },
    });
    await transaction.auditLog.create({ data: { actorId: request.auth!.userId, action: "REQUEST_CREATED", entityType: "ServiceRequest", entityId: created.id, after: { reference, status: created.requestStatus } } });
    await notify({ userId: request.auth!.userId, requestId: created.id, event: "REQUEST_SUBMITTED", title: "Request submitted", message: `${reference} has been created. Upload proof after making the bank transfer.` }, transaction);
    await notifyAdmins({ requestId: created.id, event: "REQUEST_SUBMITTED", title: "New queue request", message: `${reference} is awaiting payment.` }, transaction);
    return created;
  });
  return ok(response, serviceRequest, 201);
}));

router.get("/requests/my-requests", asyncHandler(async (request, response) => {
  const { page, pageSize, skip, take } = pagination(request.query);
  const where: Prisma.ServiceRequestWhereInput = { customerId: request.auth!.userId, OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] };
  const [items, total] = await prisma.$transaction([
    prisma.serviceRequest.findMany({ where, include: { institution: { select: { name: true, city: true } }, assignments: { where: { status: { notIn: ["CANCELLED", "FAILED"] } }, take: 1, include: { agent: { include: { user: { select: { fullName: true, mobile: true } } } } } } }, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.serviceRequest.count({ where }),
  ]);
  return ok(response, items, 200, { page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
}));

router.get("/requests/:id", asyncHandler(async (request, response) => {
  const item = await prisma.serviceRequest.findFirst({
    where: { id: request.params.id, customerId: request.auth!.userId, OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] },
    include: {
      institution: { select: { name: true, address: true, city: true, actualCustomerRequired: true, restrictions: true } },
      serviceType: { select: { name: true } }, payments: { include: { proofs: { select: { id: true, originalName: true, uploadedAt: true } } } },
      assignments: { orderBy: { createdAt: "desc" }, take: 1, include: { agent: { include: { user: { select: { fullName: true, mobile: true } } } } } },
      taskUpdates: { select: { status: true, publicNote: true, createdAt: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!item) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found");
  return ok(response, item);
}));

router.post("/requests/:id/cancel", requireCsrf, asyncHandler(async (request, response) => {
  const { reason } = parseBody(cancellationSchema, request.body);
  const item = await prisma.serviceRequest.findFirst({ where: { id: request.params.id, customerId: request.auth!.userId } });
  if (!item) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found");
  if (["EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED", "FAILED", "CANCELLED"].includes(item.requestStatus)) throw new AppError(409, "CANCELLATION_NOT_ALLOWED", "This request can no longer be cancelled online");
  const updated = await prisma.serviceRequest.update({ where: { id: item.id }, data: { requestStatus: "CANCELLED", cancellationReason: reason, refundEligible: item.paymentStatus === "VERIFIED" } });
  await audit(request, "REQUEST_CANCELLED_BY_CUSTOMER", "ServiceRequest", item.id, { status: item.requestStatus }, { status: updated.requestStatus, reason });
  await notifyAdmins({ requestId: item.id, event: "REQUEST_CANCELLED", title: "Customer cancelled request", message: `${item.reference} was cancelled by the customer.` });
  return ok(response, updated);
}));

router.get("/notifications", asyncHandler(async (request, response) => {
  const items = await prisma.notification.findMany({ where: { userId: request.auth!.userId, channel: "IN_APP" }, orderBy: { createdAt: "desc" }, take: 100 });
  return ok(response, items);
}));

router.patch("/notifications/:id/read", requireCsrf, asyncHandler(async (request, response) => {
  const result = await prisma.notification.updateMany({ where: { id: request.params.id, userId: request.auth!.userId }, data: { readAt: new Date() } });
  if (!result.count) throw new AppError(404, "NOTIFICATION_NOT_FOUND", "Notification not found");
  return ok(response, { read: true });
}));

export default router;
