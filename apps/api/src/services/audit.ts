import type { Request } from "express";
import { prisma } from "../config/prisma.js";

export async function audit(request: Request, action: string, entityType: string, entityId?: string, before?: unknown, after?: unknown) {
  await prisma.auditLog.create({
    data: {
      actorId: request.auth?.userId,
      action,
      entityType,
      entityId,
      before: before as never,
      after: after as never,
      ipAddress: request.ip,
      userAgent: request.get("user-agent"),
    },
  });
}
