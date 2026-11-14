import crypto from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { loginSchema, passwordSchema, registerSchema } from "@queuemate/shared";
import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { authenticate, createToken, CSRF_COOKIE, hashToken, requireCsrf, SESSION_COOKIE } from "../../middleware/auth.js";
import { audit } from "../../services/audit.js";
import { AppError, asyncHandler, ok, parseBody } from "../../utils/http.js";
import { z } from "zod";

const router = Router();
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;
const cookieBase = {
  sameSite: "lax" as const,
  secure: env.COOKIE_SECURE || env.NODE_ENV === "production",
  domain: env.COOKIE_DOMAIN || undefined,
  path: "/",
};

function publicUser(user: { id: string; email: string; mobile: string; fullName: string; role: string; emailVerifiedAt: Date | null }) {
  return { id: user.id, email: user.email, mobile: user.mobile, fullName: user.fullName, role: user.role, emailVerified: Boolean(user.emailVerifiedAt) };
}

async function issueSession(response: Parameters<typeof ok>[0], request: Parameters<typeof audit>[0], userId: string) {
  const token = createToken();
  const csrf = createToken();
  const expiresAt = new Date(Date.now() + sessionDurationMs);
  await prisma.session.create({
    data: { tokenHash: hashToken(token), csrfHash: hashToken(csrf), userId, expiresAt, ipAddress: request.ip, userAgent: request.get("user-agent") },
  });
  response.cookie(SESSION_COOKIE, token, { ...cookieBase, httpOnly: true, expires: expiresAt });
  response.cookie(CSRF_COOKIE, csrf, { ...cookieBase, httpOnly: false, expires: expiresAt });
  return csrf;
}

router.post("/register", asyncHandler(async (request, response) => {
  const input = parseBody(registerSchema, request.body);
  const exists = await prisma.user.findFirst({ where: { OR: [{ email: input.email }, { mobile: input.mobile }] }, select: { id: true } });
  if (exists) throw new AppError(409, "ACCOUNT_EXISTS", "An account already uses that email address or mobile number");
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.$transaction(async (transaction) => {
    const created = await transaction.user.create({
      data: { email: input.email, mobile: input.mobile, fullName: input.fullName, passwordHash, customerProfile: { create: { termsAt: new Date(), privacyAt: new Date() } } },
    });
    await transaction.auditLog.create({ data: { actorId: created.id, action: "AUTH_REGISTER", entityType: "User", entityId: created.id, ipAddress: request.ip } });
    return created;
  });
  const csrfToken = await issueSession(response, request, user.id);
  return ok(response, { user: publicUser(user), csrfToken }, 201);
}));

router.post("/login", asyncHandler(async (request, response) => {
  const input = parseBody(loginSchema, request.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || user.status !== "ACTIVE" || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }
  const csrfToken = await issueSession(response, request, user.id);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await audit(request, "AUTH_LOGIN", "User", user.id);
  return ok(response, { user: publicUser(user), csrfToken });
}));

router.post("/logout", authenticate, requireCsrf, asyncHandler(async (request, response) => {
  await prisma.session.delete({ where: { id: request.auth!.sessionId } }).catch(() => undefined);
  response.clearCookie(SESSION_COOKIE, cookieBase);
  response.clearCookie(CSRF_COOKIE, cookieBase);
  return ok(response, { message: "Signed out" });
}));

router.get("/me", authenticate, asyncHandler(async (request, response) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: request.auth!.userId }, select: { id: true, email: true, mobile: true, fullName: true, role: true, emailVerifiedAt: true } });
  return ok(response, publicUser(user));
}));

router.post("/forgot-password", asyncHandler(async (request, response) => {
  const { email } = parseBody(z.object({ email: z.string().email().transform((value) => value.toLowerCase()) }), request.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = crypto.randomBytes(32).toString("base64url");
    await prisma.$transaction([
      prisma.passwordReset.deleteMany({ where: { userId: user.id, OR: [{ usedAt: null }, { usedAt: { isSet: false } }] } }),
      prisma.passwordReset.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) } }),
      prisma.notification.create({ data: { userId: user.id, channel: "EMAIL", event: "PASSWORD_RESET", title: "Reset your QueueMate password", message: `${env.APP_URL}/reset-password?token=${token}` } }),
    ]);
  }
  return ok(response, { message: "If the account exists, password reset instructions will be sent" }, 202);
}));

router.post("/reset-password", asyncHandler(async (request, response) => {
  const input = parseBody(z.object({ token: z.string().min(20), password: passwordSchema, passwordConfirmation: z.string() }).refine((value) => value.password === value.passwordConfirmation, { path: ["passwordConfirmation"], message: "Passwords do not match" }), request.body);
  const reset = await prisma.passwordReset.findUnique({ where: { tokenHash: hashToken(input.token) } });
  if (!reset || reset.usedAt || reset.expiresAt <= new Date()) throw new AppError(400, "RESET_INVALID", "This password reset link is invalid or expired");
  const passwordHash = await bcrypt.hash(input.password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: reset.userId } }),
  ]);
  return ok(response, { message: "Password updated. Please sign in again" });
}));

export default router;
