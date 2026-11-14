import crypto from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { addDays, endOfDay, startOfDay, startOfMonth } from "date-fns";
import { agentSchema, assignmentSchema, institutionSchema, objectIdSchema, paymentDecisionSchema, requestDecisionSchema } from "@queuemate/shared";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { authenticate, authorise, requireCsrf } from "../../middleware/auth.js";
import { audit } from "../../services/audit.js";
import { notify } from "../../services/notifications.js";
import { assertAgentCanBeAssigned } from "../../services/scheduling.js";
import { AppError, asyncHandler, ok, pagination, parseBody } from "../../utils/http.js";
import { z } from "zod";

const router = Router();
router.use("/admin", authenticate, authorise("ADMIN"));

router.get("/admin/dashboard", asyncHandler(async (_request, response) => {
  const today = startOfDay(new Date());
  const month = startOfMonth(new Date());
  const [totalRequests, todayRequests, grouped, todayRevenue, monthRevenue, availableAgents, assignedAgents, recent, verifiedPayments] = await prisma.$transaction([
    prisma.serviceRequest.count({ where: { OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] } }),
    prisma.serviceRequest.count({ where: { createdAt: { gte: today } } }),
    prisma.serviceRequest.groupBy({ by: ["requestStatus"], orderBy: { requestStatus: "asc" }, _count: { _all: true } }),
    prisma.payment.aggregate({ where: { status: "VERIFIED", verifiedAt: { gte: today } }, _sum: { amountExpected: true } }),
    prisma.payment.aggregate({ where: { status: "VERIFIED", verifiedAt: { gte: month } }, _sum: { amountExpected: true } }),
    prisma.agentProfile.count({ where: { available: true, user: { status: "ACTIVE" } } }),
    prisma.agentAssignment.count({ where: { status: { in: ["ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"] } } }),
    prisma.serviceRequest.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { customer: { select: { fullName: true } }, institution: { select: { name: true } } } }),
    prisma.payment.findMany({ where: { status: "VERIFIED", createdAt: { gte: addDays(today, -29) } }, select: { createdAt: true, amountExpected: true } }),
  ]);
  const statusCounts = Object.fromEntries(grouped.map((item) => [item.requestStatus, (item._count as { _all: number })._all]));
  const revenueByDay = new Map<string, { day: string; revenue: number; requests: number }>();
  for (const payment of verifiedPayments) {
    const day = payment.createdAt.toISOString().slice(0, 10);
    const current = revenueByDay.get(day) ?? { day, revenue: 0, requests: 0 };
    current.revenue += payment.amountExpected;
    current.requests += 1;
    revenueByDay.set(day, current);
  }
  return ok(response, {
    metrics: { totalRequests, todayRequests, pendingPaymentVerification: statusCounts.PAYMENT_REVIEW ?? 0, pendingApproval: statusCounts.PENDING_APPROVAL ?? 0, approved: statusCounts.APPROVED ?? 0, active: (statusCounts.EN_ROUTE ?? 0) + (statusCounts.ARRIVED ?? 0) + (statusCounts.IN_PROGRESS ?? 0), completed: statusCounts.COMPLETED ?? 0, cancelled: statusCounts.CANCELLED ?? 0, todayRevenue: todayRevenue._sum.amountExpected ?? 0, monthRevenue: monthRevenue._sum.amountExpected ?? 0, availableAgents, assignedAgents },
    statusDistribution: grouped.map((item) => ({ status: item.requestStatus, count: (item._count as { _all: number })._all })),
    revenueSeries: [...revenueByDay.values()].sort((a, b) => a.day.localeCompare(b.day)),
    recent,
  });
}));

router.get("/admin/requests", asyncHandler(async (request, response) => {
  const { page, pageSize, skip, take } = pagination(request.query);
  const search = typeof request.query.search === "string" ? request.query.search.trim() : undefined;
  const where: Prisma.ServiceRequestWhereInput = {
    AND: [
      { OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] },
      ...(search ? [{ OR: [{ reference: { contains: search, mode: "insensitive" as const } }, { customer: { fullName: { contains: search, mode: "insensitive" as const } } }, { customer: { email: { contains: search, mode: "insensitive" as const } } }] }] : []),
    ],
    ...(request.query.status ? { requestStatus: String(request.query.status) as never } : {}),
    ...(request.query.paymentStatus ? { paymentStatus: String(request.query.paymentStatus) as never } : {}),
    ...(request.query.institutionId ? { institutionId: String(request.query.institutionId) } : {}),
    ...(request.query.date ? { requestedDate: new Date(String(request.query.date)) } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.serviceRequest.findMany({ where, include: { customer: { select: { id: true, fullName: true, mobile: true, email: true } }, institution: { select: { id: true, name: true, city: true } }, assignments: { orderBy: { createdAt: "desc" }, take: 1, include: { agent: { include: { user: { select: { fullName: true } } } } } } }, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.serviceRequest.count({ where }),
  ]);
  return ok(response, items, 200, { page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
}));

router.get("/admin/requests/:id", asyncHandler(async (request, response) => {
  const item = await prisma.serviceRequest.findUnique({
    where: { id: request.params.id },
    include: {
      customer: { select: { id: true, fullName: true, email: true, mobile: true } },
      institution: { include: { permissions: { include: { serviceType: true } } } },
      serviceType: true,
      payments: { include: { proofs: true, verifiedBy: { select: { fullName: true } } } },
      assignments: { orderBy: { createdAt: "desc" }, include: { agent: { include: { user: { select: { fullName: true, mobile: true } } } } } },
      taskUpdates: { orderBy: { createdAt: "asc" } },
      evidence: true,
      notes: { include: { author: { select: { fullName: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!item) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found");
  return ok(response, item);
}));

router.patch("/admin/requests/:id/approve", requireCsrf, asyncHandler(async (request, response) => {
  const item = await prisma.serviceRequest.findUnique({ where: { id: request.params.id }, include: { institution: { include: { permissions: { where: { permitted: true } } } } } });
  if (!item) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found");
  if (item.paymentStatus !== "VERIFIED") throw new AppError(409, "PAYMENT_NOT_VERIFIED", "Payment must be manually verified before approval");
  if (!item.institution.active || !item.institution.permissions.some((permission) => permission.serviceTypeId === item.serviceTypeId)) throw new AppError(409, "INSTITUTION_NOT_ELIGIBLE", "The institution does not currently permit this assistance");
  if (item.requestStatus !== "PENDING_APPROVAL") throw new AppError(409, "INVALID_REQUEST_STATE", "Only requests pending approval can be approved");
  const updated = await prisma.serviceRequest.update({ where: { id: item.id }, data: { requestStatus: "APPROVED", approvedAt: new Date(), rejectionReason: null } });
  await audit(request, "REQUEST_APPROVED", "ServiceRequest", item.id, { status: item.requestStatus }, { status: updated.requestStatus });
  await notify({ userId: item.customerId, requestId: item.id, event: "REQUEST_APPROVED", title: "Request approved", message: `${item.reference} is approved. An available agent will be assigned.` });
  return ok(response, updated);
}));

router.patch("/admin/requests/:id/reject", requireCsrf, asyncHandler(async (request, response) => {
  const { reason } = parseBody(requestDecisionSchema.extend({ reason: z.string().min(5) }), request.body);
  const item = await prisma.serviceRequest.findUnique({ where: { id: request.params.id } });
  if (!item) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found");
  if (["COMPLETED", "CANCELLED", "REJECTED"].includes(item.requestStatus)) throw new AppError(409, "INVALID_REQUEST_STATE", "This request is already finalised");
  const updated = await prisma.serviceRequest.update({ where: { id: item.id }, data: { requestStatus: "REJECTED", rejectionReason: reason } });
  await audit(request, "REQUEST_REJECTED", "ServiceRequest", item.id, { status: item.requestStatus }, { status: updated.requestStatus, reason });
  await notify({ userId: item.customerId, requestId: item.id, event: "REQUEST_REJECTED", title: "Request not approved", message: `${item.reference}: ${reason}` });
  return ok(response, updated);
}));

router.patch("/admin/requests/:id/cancel", requireCsrf, asyncHandler(async (request, response) => {
  const { reason } = parseBody(requestDecisionSchema.extend({ reason: z.string().min(5) }), request.body);
  const item = await prisma.serviceRequest.findUnique({ where: { id: request.params.id } });
  if (!item) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found");
  if (item.requestStatus === "COMPLETED") throw new AppError(409, "INVALID_REQUEST_STATE", "A completed request cannot be cancelled");
  const updated = await prisma.$transaction(async (transaction) => {
    await transaction.agentAssignment.updateMany({ where: { requestId: item.id, status: { notIn: ["COMPLETED", "FAILED", "CANCELLED"] } }, data: { status: "CANCELLED" } });
    return transaction.serviceRequest.update({ where: { id: item.id }, data: { requestStatus: "CANCELLED", cancellationReason: reason, refundEligible: item.paymentStatus === "VERIFIED" } });
  });
  await audit(request, "REQUEST_CANCELLED_BY_ADMIN", "ServiceRequest", item.id, { status: item.requestStatus }, { status: updated.requestStatus, reason });
  await notify({ userId: item.customerId, requestId: item.id, event: "REQUEST_CANCELLED", title: "Request cancelled", message: `${item.reference}: ${reason}` });
  return ok(response, updated);
}));

router.post("/admin/requests/:id/notes", requireCsrf, asyncHandler(async (request, response) => {
  const { content } = parseBody(z.object({ content: z.string().trim().min(2).max(2000) }), request.body);
  const note = await prisma.requestNote.create({ data: { requestId: request.params.id, authorId: request.auth!.userId, content }, include: { author: { select: { fullName: true } } } });
  await audit(request, "INTERNAL_NOTE_ADDED", "ServiceRequest", request.params.id);
  return ok(response, note, 201);
}));

router.get("/admin/payments", asyncHandler(async (request, response) => {
  const { page, pageSize, skip, take } = pagination(request.query);
  const where: Prisma.PaymentWhereInput = request.query.status ? { status: String(request.query.status) as never } : {};
  const [items, total] = await prisma.$transaction([
    prisma.payment.findMany({ where, include: { request: { include: { customer: { select: { fullName: true, email: true } }, institution: { select: { name: true } } } }, proofs: true, verifiedBy: { select: { fullName: true } } }, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.payment.count({ where }),
  ]);
  return ok(response, items, 200, { page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
}));

router.patch("/admin/payments/:id/verify", requireCsrf, asyncHandler(async (request, response) => {
  const { notes } = parseBody(paymentDecisionSchema, request.body);
  const result = await prisma.$transaction(async (transaction) => {
    const payment = await transaction.payment.findUnique({ where: { id: request.params.id }, include: { request: true, proofs: true } });
    if (!payment) throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment not found");
    if (payment.status === "VERIFIED") throw new AppError(409, "ALREADY_VERIFIED", "This payment has already been verified");
    if (payment.status !== "PROOF_UPLOADED" && payment.status !== "UNDER_VERIFICATION") throw new AppError(409, "INVALID_PAYMENT_STATE", "The payment is not ready for verification");
    if (!payment.proofs.length || !payment.amountSubmitted || Math.round(payment.amountSubmitted * 100) !== Math.round(payment.amountExpected * 100)) throw new AppError(422, "PAYMENT_AMOUNT_MISMATCH", "Confirm that the submitted amount exactly matches the expected amount");
    const updated = await transaction.payment.update({ where: { id: payment.id }, data: { status: "VERIFIED", verificationNotes: notes, verifiedById: request.auth!.userId, verifiedAt: new Date() } });
    await transaction.serviceRequest.update({ where: { id: payment.requestId }, data: { paymentStatus: "VERIFIED", requestStatus: "PENDING_APPROVAL" } });
    await transaction.auditLog.create({ data: { actorId: request.auth!.userId, action: "PAYMENT_VERIFIED", entityType: "Payment", entityId: payment.id, before: { status: payment.status }, after: { status: "VERIFIED", notes }, ipAddress: request.ip } });
    await notify({ userId: payment.request.customerId, requestId: payment.requestId, event: "PAYMENT_VERIFIED", title: "Payment verified", message: `Payment for ${payment.request.reference} was verified and the request is awaiting approval.` }, transaction);
    return updated;
  });
  return ok(response, result);
}));

router.patch("/admin/payments/:id/reject", requireCsrf, asyncHandler(async (request, response) => {
  const { notes } = parseBody(paymentDecisionSchema, request.body);
  const payment = await prisma.payment.findUnique({ where: { id: request.params.id }, include: { request: true } });
  if (!payment) throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment not found");
  if (payment.status === "VERIFIED") throw new AppError(409, "PAYMENT_FINAL", "A verified payment cannot be rejected");
  const updated = await prisma.$transaction(async (transaction) => {
    const changed = await transaction.payment.update({ where: { id: payment.id }, data: { status: "REJECTED", verificationNotes: notes, verifiedById: request.auth!.userId, verifiedAt: new Date() } });
    await transaction.serviceRequest.update({ where: { id: payment.requestId }, data: { paymentStatus: "REJECTED", requestStatus: "PENDING_PAYMENT" } });
    await notify({ userId: payment.request.customerId, requestId: payment.requestId, event: "PAYMENT_REJECTED", title: "New payment proof required", message: `${payment.request.reference}: ${notes}` }, transaction);
    return changed;
  });
  await audit(request, "PAYMENT_REJECTED", "Payment", payment.id, { status: payment.status }, { status: updated.status, notes });
  return ok(response, updated);
}));

router.get("/admin/agents", asyncHandler(async (_request, response) => {
  const agents = await prisma.agentProfile.findMany({ include: { user: { select: { id: true, fullName: true, email: true, mobile: true, status: true } }, availability: { where: { endsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 10 }, assignments: { where: { status: { in: ["ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"] } }, select: { id: true } } }, orderBy: { agentReference: "asc" } });
  return ok(response, agents);
}));

router.post("/admin/agents", requireCsrf, asyncHandler(async (request, response) => {
  const input = parseBody(agentSchema, request.body);
  const existingUser = await prisma.user.findFirst({ where: { OR: [{ email: input.email }, { mobile: input.mobile }] }, select: { id: true } });
  if (existingUser) throw new AppError(409, "ACCOUNT_EXISTS", "An account already uses that email address or mobile number");
  const agentReference = `AGENT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const agent = await prisma.user.create({
    data: { fullName: input.fullName, email: input.email, mobile: input.mobile, passwordHash: await bcrypt.hash(input.password, env.PASSWORD_HASH_ROUNDS), role: "AGENT", status: "ACTIVE", emailVerifiedAt: new Date(), agentProfile: { create: { agentReference, emergencyContact: input.emergencyContact, onboardingComplete: true, available: input.available, hourlyRate: 0 } }, notifications: { create: { channel: "IN_APP", event: "AGENT_ACCOUNT_CREATED", title: "Welcome to QueueMate", message: "Your agent account is ready.", deliveryStatus: "SENT", sentAt: new Date() } } },
    select: { id: true, fullName: true, email: true, mobile: true, status: true, agentProfile: true },
  });
  await audit(request, "AGENT_CREATED", "AgentProfile", agent.agentProfile!.id);
  return ok(response, agent, 201);
}));

router.patch("/admin/agents/:id", requireCsrf, asyncHandler(async (request, response) => {
  const input = parseBody(z.object({ available: z.boolean().optional(), status: z.enum(["INVITED", "ACTIVE", "SUSPENDED", "DISABLED"]).optional(), onboardingComplete: z.boolean().optional(), hourlyRate: z.coerce.number().min(0).optional() }), request.body);
  const current = await prisma.agentProfile.findUnique({ where: { id: request.params.id }, include: { user: true } });
  if (!current) throw new AppError(404, "AGENT_NOT_FOUND", "Agent not found");
  const updated = await prisma.agentProfile.update({ where: { id: current.id }, data: { available: input.available, onboardingComplete: input.onboardingComplete, hourlyRate: input.hourlyRate, user: input.status ? { update: { status: input.status } } : undefined }, include: { user: { select: { fullName: true, email: true, status: true } } } });
  await audit(request, "AGENT_UPDATED", "AgentProfile", current.id, { available: current.available, status: current.user.status }, { available: updated.available, status: updated.user.status });
  return ok(response, updated);
}));

router.post("/admin/assignments", requireCsrf, asyncHandler(async (request, response) => {
  const input = parseBody(assignmentSchema, request.body);
  const assignment = await prisma.$transaction(async (transaction) => {
    const serviceRequest = await transaction.serviceRequest.findUnique({ where: { id: input.requestId } });
    if (!serviceRequest) throw new AppError(404, "REQUEST_NOT_FOUND", "Request not found");
    if (serviceRequest.requestStatus !== "APPROVED") throw new AppError(409, "REQUEST_NOT_APPROVED", "Only approved requests can be assigned");
    const travelBufferMinutes = input.travelBufferMinutes ?? 30;
    const schedule = await assertAgentCanBeAssigned(transaction, input.agentId, serviceRequest.scheduledStartAt, serviceRequest.estimatedDurationMinutes, travelBufferMinutes, input.overrideConflict ?? false);
    const created = await transaction.agentAssignment.create({ data: { requestId: serviceRequest.id, agentId: input.agentId, scheduledStartAt: serviceRequest.scheduledStartAt, scheduledEndAt: schedule.scheduledEndAt, travelBufferMinutes, overrideReason: schedule.conflict ? input.overrideReason : undefined, assignedById: request.auth!.userId }, include: { agent: { include: { user: { select: { id: true, fullName: true } } } } } });
    await transaction.serviceRequest.update({ where: { id: serviceRequest.id }, data: { requestStatus: "AGENT_ASSIGNED" } });
    await transaction.taskUpdate.create({ data: { requestId: serviceRequest.id, assignmentId: created.id, status: "ASSIGNED", actorId: request.auth!.userId, publicNote: "An agent has been assigned." } });
    await transaction.auditLog.create({ data: { actorId: request.auth!.userId, action: schedule.conflict ? "ASSIGNMENT_CONFLICT_OVERRIDDEN" : "AGENT_ASSIGNED", entityType: "AgentAssignment", entityId: created.id, after: { agentId: input.agentId, overrideReason: input.overrideReason } } });
    await notify({ userId: created.agent.user.id, requestId: serviceRequest.id, event: "AGENT_ASSIGNED", title: "New QueueMate assignment", message: `${serviceRequest.reference} is scheduled for ${serviceRequest.scheduledStartAt.toISOString()}.` }, transaction);
    await notify({ userId: serviceRequest.customerId, requestId: serviceRequest.id, event: "AGENT_ASSIGNED", title: "Agent assigned", message: `${created.agent.user.fullName} has been assigned to ${serviceRequest.reference}.` }, transaction);
    return created;
  });
  return ok(response, assignment, 201);
}));

router.get("/admin/schedule", asyncHandler(async (request, response) => {
  const date = request.query.date ? new Date(String(request.query.date)) : new Date();
  const from = startOfDay(date); const to = endOfDay(date);
  const agents = await prisma.agentProfile.findMany({ where: request.query.agentId ? { id: String(request.query.agentId) } : {}, include: { user: { select: { fullName: true, mobile: true, status: true } }, assignments: { where: { scheduledStartAt: { gte: from, lte: to } }, include: { request: { include: { institution: { select: { name: true, address: true } } } } }, orderBy: { scheduledStartAt: "asc" } }, availability: { where: { startsAt: { lte: to }, endsAt: { gte: from } } } }, orderBy: { agentReference: "asc" } });
  return ok(response, { date: from, agents });
}));

router.get("/admin/institutions", asyncHandler(async (_request, response) => {
  const items = await prisma.institution.findMany({ where: { OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }] }, include: { permissions: { include: { serviceType: true } }, _count: { select: { requests: true } } }, orderBy: { name: "asc" } });
  return ok(response, items);
}));

router.post("/admin/institutions", requireCsrf, asyncHandler(async (request, response) => {
  const input = parseBody(institutionSchema, request.body);
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const item = await prisma.institution.create({ data: { name: input.name, slug: `${slug}-${crypto.randomBytes(2).toString("hex")}`, address: input.address, city: input.city, contactPhone: input.contactPhone, contactEmail: input.contactEmail || null, description: input.description, active: input.active, actualCustomerRequired: input.actualCustomerRequired, requiredAuthorisation: input.requiredAuthorisation, restrictions: input.restrictions, estimatedDurationMinutes: input.estimatedDurationMinutes, lastPermissionReviewAt: new Date(), permissions: { create: { serviceTypeId: input.serviceTypeId, permitted: input.permitted, conditions: input.permissionConditions, reviewedAt: new Date() } } }, include: { permissions: true } });
  await audit(request, "INSTITUTION_CREATED", "Institution", item.id);
  return ok(response, item, 201);
}));

router.patch("/admin/institutions/:id", requireCsrf, asyncHandler(async (request, response) => {
  const input = parseBody(institutionSchema.partial().extend({ serviceTypeId: objectIdSchema.optional() }), request.body);
  const item = await prisma.institution.update({ where: { id: request.params.id }, data: { name: input.name, address: input.address, city: input.city, contactPhone: input.contactPhone, contactEmail: input.contactEmail || undefined, description: input.description, active: input.active, actualCustomerRequired: input.actualCustomerRequired, requiredAuthorisation: input.requiredAuthorisation, restrictions: input.restrictions, estimatedDurationMinutes: input.estimatedDurationMinutes, lastPermissionReviewAt: input.permitted !== undefined ? new Date() : undefined, permissions: input.serviceTypeId ? { upsert: { where: { institutionId_serviceTypeId: { institutionId: request.params.id, serviceTypeId: input.serviceTypeId } }, create: { serviceTypeId: input.serviceTypeId, permitted: input.permitted ?? false, conditions: input.permissionConditions, reviewedAt: new Date() }, update: { permitted: input.permitted, conditions: input.permissionConditions, reviewedAt: new Date() } } } : undefined }, include: { permissions: { include: { serviceType: true } } } });
  await audit(request, "INSTITUTION_UPDATED", "Institution", item.id);
  return ok(response, item);
}));

router.get("/admin/pricing", asyncHandler(async (_request, response) => ok(response, await prisma.pricingRule.findMany({ include: { serviceType: true }, orderBy: { effectiveFrom: "desc" } }))));

router.post("/admin/pricing", requireCsrf, asyncHandler(async (request, response) => {
  const input = parseBody(z.object({ name: z.string().min(2), serviceTypeId: objectIdSchema, type: z.enum(["FIXED", "CUSTOM_QUOTE"]), amount: z.coerce.number().positive().optional(), currency: z.string().default("BWP"), active: z.boolean().default(true), effectiveFrom: z.string().datetime(), effectiveTo: z.string().datetime().optional() }), request.body);
  if (input.type === "FIXED" && input.amount === undefined) throw new AppError(422, "AMOUNT_REQUIRED", "Fixed pricing requires an amount");
  const item = await prisma.pricingRule.create({ data: { ...input, amount: input.amount, effectiveFrom: new Date(input.effectiveFrom), effectiveTo: input.effectiveTo ? new Date(input.effectiveTo) : null } });
  await audit(request, "PRICING_CREATED", "PricingRule", item.id);
  return ok(response, item, 201);
}));

router.get("/admin/settings", asyncHandler(async (_request, response) => ok(response, await prisma.systemSetting.findMany({ orderBy: { key: "asc" } }))));

router.patch("/admin/settings", requireCsrf, asyncHandler(async (request, response) => {
  const input = parseBody(z.object({ key: z.enum(["bank.account", "cancellation.policy", "business.contact", "scheduling.travelBufferMinutes"]), value: z.unknown(), description: z.string().max(500).optional() }), request.body);
  const setting = await prisma.systemSetting.upsert({ where: { key: input.key }, create: { ...input, value: input.value as never, sensitive: input.key === "bank.account", updatedById: request.auth!.userId }, update: { value: input.value as never, description: input.description, updatedById: request.auth!.userId } });
  await audit(request, "SETTING_UPDATED", "SystemSetting", setting.id, undefined, { key: setting.key });
  return ok(response, setting);
}));

router.get("/admin/reports", asyncHandler(async (request, response) => {
  const from = request.query.from ? new Date(String(request.query.from)) : addDays(new Date(), -30);
  const to = request.query.to ? endOfDay(new Date(String(request.query.to))) : endOfDay(new Date());
  const [payments, requests, agentStats, newCustomers] = await prisma.$transaction([
    prisma.payment.groupBy({ by: ["status"], where: { createdAt: { gte: from, lte: to } }, orderBy: { status: "asc" }, _sum: { amountExpected: true }, _count: { _all: true } }),
    prisma.serviceRequest.groupBy({ by: ["requestStatus"], where: { createdAt: { gte: from, lte: to } }, orderBy: { requestStatus: "asc" }, _count: { _all: true } }),
    prisma.agentAssignment.groupBy({ by: ["agentId", "status"], where: { createdAt: { gte: from, lte: to } }, orderBy: [{ agentId: "asc" }, { status: "asc" }], _count: { _all: true } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: from, lte: to } } }),
  ]);
  if (request.query.format === "csv") {
    const rows = ["category,status,count,amount", ...payments.map((item) => `payment,${item.status},${(item._count as { _all: number })._all},${item._sum?.amountExpected ?? 0}`), ...requests.map((item) => `request,${item.requestStatus},${(item._count as { _all: number })._all},`)];
    response.setHeader("Content-Type", "text/csv"); response.setHeader("Content-Disposition", "attachment; filename=queuemate-report.csv");
    return response.send(rows.join("\n"));
  }
  return ok(response, { period: { from, to }, financial: payments, operational: requests, agents: agentStats, customers: { newCustomers } });
}));

export default router;
