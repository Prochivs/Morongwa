import type { NotificationChannel, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export async function notify(input: {
  userId: string;
  requestId?: string;
  event: string;
  title: string;
  message: string;
  channels?: NotificationChannel[];
}, transaction: Prisma.TransactionClient | typeof prisma = prisma) {
  const channels = input.channels ?? ["IN_APP"];
  return transaction.notification.createMany({
    data: channels.map((channel) => ({
      userId: input.userId,
      requestId: input.requestId,
      event: input.event,
      title: input.title,
      message: input.message,
      channel,
      deliveryStatus: channel === "IN_APP" ? "SENT" : "PENDING",
      sentAt: channel === "IN_APP" ? new Date() : undefined,
    })),
  });
}

export async function notifyAdmins(input: Omit<Parameters<typeof notify>[0], "userId">, transaction: Prisma.TransactionClient | typeof prisma = prisma) {
  const admins = await transaction.user.findMany({ where: { role: "ADMIN", status: "ACTIVE" }, select: { id: true } });
  await Promise.all(admins.map((admin) => notify({ ...input, userId: admin.id }, transaction)));
}
