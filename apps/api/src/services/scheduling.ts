import type { AssignmentStatus, Prisma } from "@prisma/client";
import { addMinutes } from "date-fns";
import { AppError } from "../utils/http.js";

const activeStatuses: AssignmentStatus[] = ["ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"];

export async function assertAgentCanBeAssigned(
  transaction: Prisma.TransactionClient,
  agentId: string,
  startsAt: Date,
  durationMinutes: number,
  travelBufferMinutes: number,
  overrideConflict: boolean,
) {
  await transaction.agentScheduleLock.upsert({
    where: { agentId },
    create: { agentId },
    update: { version: { increment: 1 } },
  });
  const agent = await transaction.agentProfile.findUnique({ where: { id: agentId }, include: { user: true } });
  if (!agent || agent.user.status !== "ACTIVE" || !agent.available) throw new AppError(409, "AGENT_UNAVAILABLE", "The selected agent is not active and available");

  const startsWithBuffer = addMinutes(startsAt, -travelBufferMinutes);
  const endsAt = addMinutes(startsAt, durationMinutes + travelBufferMinutes);
  const unavailable = await transaction.agentAvailability.findFirst({
    where: { agentId, type: { in: ["UNAVAILABLE", "DAY_OFF"] }, startsAt: { lt: endsAt }, endsAt: { gt: startsWithBuffer } },
  });
  if (unavailable && !overrideConflict) throw new AppError(409, "AGENT_UNAVAILABLE", "The selected agent is unavailable during this period");

  const conflict = await transaction.agentAssignment.findFirst({
    where: { agentId, status: { in: activeStatuses }, scheduledStartAt: { lt: endsAt }, scheduledEndAt: { gt: startsWithBuffer } },
    select: { id: true },
  });
  if (conflict && !overrideConflict) throw new AppError(409, "SCHEDULING_CONFLICT", "The selected agent already has an overlapping assignment");
  return { scheduledEndAt: addMinutes(startsAt, durationMinutes), conflict: Boolean(conflict || unavailable) };
}
