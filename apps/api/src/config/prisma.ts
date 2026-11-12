import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

const globalPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalPrisma.prisma ?? new PrismaClient({
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

if (env.NODE_ENV !== "production") globalPrisma.prisma = prisma;
