import { Router } from "express";
import multer from "multer";
import { assignmentTransitionSchema, availabilitySchema, canTransition } from "@queuemate/shared";
import type { AssignmentStatus, RequestStatus } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { authenticate, authorise, requireCsrf } from "../../middleware/auth.js";
import { audit } from "../../services/audit.js";
import { notify, notifyAdmins } from "../../services/notifications.js";
import { putPrivateFile } from "../../services/storage.js";
import { AppError, asyncHandler, ok, parseBody } from "../../utils/http.js";
import { z } from "zod";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
router.use("/agent", authenticate, authorise("AGENT"));

async function getAgent(userId: string) {
  const agent = await prisma.agentProfile.findUnique({ where: { userId } });
  if (!agent) throw new AppError(403, "AGENT_PROFILE_REQUIRED", "Agent profile not found");
  return agent;
}

router.get("/agent/dashboard", asyncHandler(async (request, response) => {
  const agent = await getAgent(request.auth!.userId);
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const [today, upcoming, active, completed, cancelled, earnings] = await prisma.$transaction([
    prisma.agentAssignment.findMany({ where: { agentId: agent.id, scheduledStartAt: { gte: todayStart, lte: todayEnd } }, include: { request: { include: { institution: true } } }, orderBy: { scheduledStartAt: "asc" } }),
    prisma.agentAssignment.count({ where: { agentId: agent.id, scheduledStartAt: { gt: todayEnd }, status: { in: ["ASSIGNED", "ACCEPTED"] } } }),
    prisma.agentAssignment.count({ where: { agentId: agent.id, status: { in: ["ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"] } } }),
    prisma.agentAssignment.count({ where: { agentId: agent.id, status: "COMPLETED" } }),
    prisma.agentAssignment.count({ where: { agentId: agent.id, status: "CANCELLED" } }),
    prisma.agentEarning.aggregate({ where: { agentId: agent.id }, _sum: { amount: true } }),
  ]);
  return ok(response, { agent, metrics: { upcoming, active, completed, cancelled, earnings: earnings._sum.amount ?? 0 }, today });
}));

router.get("/agent/assignments", asyncHandler(async (request, response) => {
  const agent = await getAgent(request.auth!.userId);
  const items = await prisma.agentAssignment.findMany({ where: { agentId: agent.id, ...(request.query.status ? { status: String(request.query.status) as AssignmentStatus } : {}) }, include: { request: { include: { institution: { select: { name: true, address: true, city: true, restrictions: true, actualCustomerRequired: true } }, customer: { select: { fullName: true, mobile: true } } } } }, orderBy: { scheduledStartAt: "asc" } });
  return ok(response, items);
}));

router.get("/agent/assignments/:id", asyncHandler(async (request, response) => {
  const agent = await getAgent(request.auth!.userId);
  const item = await prisma.agentAssignment.findFirst({ where: { id: request.params.id, agentId: agent.id }, include: { request: { include: { institution: true, serviceType: true, customer: { select: { fullName: true, mobile: true } }, taskUpdates: { orderBy: { createdAt: "asc" } } } }, evidence: true } });
  if (!item) throw new AppError(404, "ASSIGNMENT_NOT_FOUND", "Assignment not found");
  return ok(response, item);
}));

router.post("/agent/assignments/:id/help", requireCsrf, asyncHandler(async (request, response) => {
  const input = parseBody(z.object({
    reason: z.enum(["CUSTOMER_UNAVAILABLE", "INSTITUTION_ISSUE", "TRAVEL_DELAY", "SAFETY_CONCERN", "OTHER"]),
    note: z.string().trim().min(5).max(1000),
  }), request.body);
  const agent = await getAgent(request.auth!.userId);
  const assignment = await prisma.agentAssignment.findFirst({
    where: { id: request.params.id, agentId: agent.id },
    include: { request: true },
  });
  if (!assignment) throw new AppError(404, "ASSIGNMENT_NOT_FOUND", "Assignment not found");
  if (!["ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"].includes(assignment.status)) {
    throw new AppError(409, "ASSIGNMENT_NOT_ACTIVE", "Help can only be requested for an active assignment");
  }
  const reasonLabels = {
    CUSTOMER_UNAVAILABLE: "Customer unavailable",
    INSTITUTION_ISSUE: "Institution issue",
    TRAVEL_DELAY: "Travel delay",
    SAFETY_CONCERN: "Safety concern",
    OTHER: "Other issue",
  } as const;
  const summary = `Agent help request — ${reasonLabels[input.reason]}: ${input.note}`;
  await prisma.$transaction(async (transaction) => {
    await transaction.requestNote.create({
      data: { requestId: assignment.requestId, authorId: request.auth!.userId, content: summary },
    });
    await transaction.auditLog.create({
      data: { actorId: request.auth!.userId, action: "ASSIGNMENT_HELP_REQUESTED", entityType: "AgentAssignment", entityId: assignment.id, after: { reason: input.reason, note: input.note } },
    });
    await notifyAdmins({
      requestId: assignment.requestId,
      event: "AGENT_HELP_REQUESTED",
      title: `Agent needs help · ${assignment.request.reference}`,
      message: `${reasonLabels[input.reason]}: ${input.note}`,
    }, transaction);
  });
  return ok(response, { message: "An administrator has been notified. Your task status has not changed." }, 202);
}));

router.patch("/agent/assignments/:id/status", requireCsrf, asyncHandler(async (request, response) => {
  const input = parseBody(assignmentTransitionSchema, request.body);
  const agent = await getAgent(request.auth!.userId);
  const assignment = await prisma.agentAssignment.findFirst({ where: { id: request.params.id, agentId: agent.id }, include: { request: true } });
  if (!assignment) throw new AppError(404, "ASSIGNMENT_NOT_FOUND", "Assignment not found");
  if (!canTransition(assignment.status, input.status)) throw new AppError(409, "INVALID_STATUS_TRANSITION", `Cannot move an assignment from ${assignment.status} to ${input.status}`);
  if (input.status === "COMPLETED" && (!input.outcome || input.outcome.length < 5)) throw new AppError(422, "OUTCOME_REQUIRED", "Describe the task outcome before completing it");
  if (input.status === "FAILED" && (!input.note || input.note.length < 5)) throw new AppError(422, "FAILURE_REASON_REQUIRED", "Explain why the task could not be completed");
  if (input.status === "CANCELLED" && (!input.note || input.note.length < 5)) throw new AppError(422, "DECLINE_REASON_REQUIRED", "Explain why you cannot take this assignment");
  const requestStatus: Partial<Record<AssignmentStatus, RequestStatus>> = { EN_ROUTE: "EN_ROUTE", ARRIVED: "ARRIVED", IN_PROGRESS: "IN_PROGRESS", COMPLETED: "COMPLETED" };
  const updated = await prisma.$transaction(async (transaction) => {
    const claimed = await transaction.agentAssignment.updateMany({
      where: { id: assignment.id, status: assignment.status },
      data: { status: input.status, acceptedAt: input.status === "ACCEPTED" ? new Date() : undefined, completedAt: input.status === "COMPLETED" ? new Date() : undefined },
    });
    if (claimed.count !== 1) throw new AppError(409, "STATUS_ALREADY_CHANGED", "This assignment was already updated. Refresh to see its current status.");
    const changed = await transaction.agentAssignment.findUniqueOrThrow({ where: { id: assignment.id } });
    const mapped = input.status === "CANCELLED" ? "APPROVED" : requestStatus[input.status as AssignmentStatus];
    if (mapped) await transaction.serviceRequest.update({ where: { id: assignment.requestId }, data: { requestStatus: mapped, completedAt: input.status === "COMPLETED" ? new Date() : undefined } });
    if (assignment.status === "EN_ROUTE" && input.status === "IN_PROGRESS") {
      await transaction.taskUpdate.create({ data: { requestId: assignment.requestId, assignmentId: assignment.id, status: "ARRIVED", message: "Arrival recorded automatically when assistance started.", actorId: request.auth!.userId } });
    }
    await transaction.taskUpdate.create({ data: { requestId: assignment.requestId, assignmentId: assignment.id, status: input.status, message: input.note, publicNote: input.status === "CANCELLED" ? undefined : input.status === "COMPLETED" ? input.outcome : input.note || `Agent status updated to ${input.status.toLowerCase().replaceAll("_", " ")}.`, actorId: request.auth!.userId } });
    if (input.status === "COMPLETED") {
      await transaction.taskEvidence.create({ data: { requestId: assignment.requestId, assignmentId: assignment.id, type: "QUEUE_REFERENCE", outcome: input.outcome, permittedReference: input.permittedReference } });
      if (agent.hourlyRate > 0) await transaction.agentEarning.upsert({ where: { agentId_assignmentId: { agentId: agent.id, assignmentId: assignment.id } }, create: { agentId: agent.id, assignmentId: assignment.id, amount: agent.hourlyRate }, update: {} });
    }
    await transaction.auditLog.create({ data: { actorId: request.auth!.userId, action: "ASSIGNMENT_STATUS_CHANGED", entityType: "AgentAssignment", entityId: assignment.id, before: { status: assignment.status }, after: { status: input.status, note: input.note } } });
    const customerMessages: Partial<Record<AssignmentStatus, { title: string; message: string }>> = {
      EN_ROUTE: { title: "Your agent is on the way", message: `${assignment.request.reference}: your QueueMate agent has started the journey.` },
      ARRIVED: { title: "Your agent has arrived", message: `${assignment.request.reference}: your QueueMate agent has arrived.` },
      IN_PROGRESS: { title: "Queue assistance started", message: `${assignment.request.reference}: assistance is now in progress.` },
      COMPLETED: { title: "Queue assistance completed", message: `${assignment.request.reference} has been completed.` },
    };
    const customerMessage = customerMessages[input.status as AssignmentStatus];
    if (customerMessage) await notify({ userId: assignment.request.customerId, requestId: assignment.requestId, event: `AGENT_${input.status}`, ...customerMessage }, transaction);
    return changed;
  });
  await notifyAdmins({ requestId: assignment.requestId, event: input.status === "CANCELLED" ? "AGENT_DECLINED" : `AGENT_${input.status}`, title: input.status === "CANCELLED" ? "Agent declined assignment" : `Assignment ${input.status.toLowerCase()}`, message: input.status === "CANCELLED" ? `${assignment.request.reference} needs to be reassigned. ${input.note ?? ""}` : `${assignment.request.reference} was updated by the assigned agent.` });
  return ok(response, updated);
}));

router.post("/agent/assignments/:id/evidence", requireCsrf, upload.single("evidence"), asyncHandler(async (request, response) => {
  const agent = await getAgent(request.auth!.userId);
  const assignment = await prisma.agentAssignment.findFirst({ where: { id: request.params.id, agentId: agent.id } });
  if (!assignment) throw new AppError(404, "ASSIGNMENT_NOT_FOUND", "Assignment not found");
  const metadata = parseBody(z.object({ type: z.enum(["COMPLETION_DOCUMENT", "QUEUE_REFERENCE", "OTHER"]), permittedReference: z.string().max(100).optional(), outcome: z.string().min(5).max(1000), privacyConfirmed: z.union([z.literal("true"), z.literal(true)]) }), request.body);
  let stored: Awaited<ReturnType<typeof putPrivateFile>> | undefined;
  if (request.file) stored = await putPrivateFile(`tasks/${assignment.requestId}`, request.file);
  const evidence = await prisma.taskEvidence.create({ data: { requestId: assignment.requestId, assignmentId: assignment.id, type: metadata.type, permittedReference: metadata.permittedReference, outcome: metadata.outcome, storageKey: stored?.key, mimeType: request.file?.mimetype, sizeBytes: request.file?.size } });
  await audit(request, "TASK_EVIDENCE_ADDED", "TaskEvidence", evidence.id);
  return ok(response, evidence, 201);
}));

router.get("/agent/earnings", asyncHandler(async (request, response) => {
  const agent = await getAgent(request.auth!.userId);
  const items = await prisma.agentEarning.findMany({ where: { agentId: agent.id }, include: { assignment: { include: { request: { select: { reference: true, completedAt: true } } } } }, orderBy: { createdAt: "desc" } });
  const total = items.reduce((sum, item) => sum + Number(item.amount), 0);
  return ok(response, { total, currency: "BWP", items });
}));

router.get("/agent/availability", asyncHandler(async (request, response) => {
  const agent = await getAgent(request.auth!.userId);
  return ok(response, await prisma.agentAvailability.findMany({ where: { agentId: agent.id }, orderBy: { startsAt: "asc" } }));
}));

router.post("/agent/availability", requireCsrf, asyncHandler(async (request, response) => {
  const agent = await getAgent(request.auth!.userId);
  const input = parseBody(availabilitySchema, request.body);
  const item = await prisma.agentAvailability.create({ data: { agentId: agent.id, type: input.type, startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt), note: input.note } });
  await audit(request, "AGENT_AVAILABILITY_CREATED", "AgentAvailability", item.id);
  return ok(response, item, 201);
}));

export default router;
