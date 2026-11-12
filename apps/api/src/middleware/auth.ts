import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/http.js";

export const SESSION_COOKIE = "qm_session";
export const CSRF_COOKIE = "qm_csrf";
export const hashToken = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
export const createToken = () => crypto.randomBytes(32).toString("base64url");

export async function authenticate(request: Request, _response: Response, next: NextFunction) {
  try {
    const token = request.cookies?.[SESSION_COOKIE] as string | undefined;
    if (!token) throw new AppError(401, "UNAUTHENTICATED", "Please sign in to continue");
    const session = await prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { select: { id: true, role: true, status: true } } },
    });
    if (!session || session.expiresAt <= new Date() || session.user.status !== "ACTIVE") {
      throw new AppError(401, "SESSION_EXPIRED", "Your session has expired");
    }
    request.auth = { userId: session.user.id, role: session.user.role, sessionId: session.id, csrfHash: session.csrfHash };
    next();
  } catch (error) {
    next(error);
  }
}

export function authorise(...roles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.auth || !roles.includes(request.auth.role)) return next(new AppError(403, "FORBIDDEN", "You do not have access to this action"));
    next();
  };
}

export function requireCsrf(request: Request, _response: Response, next: NextFunction) {
  const header = request.get("x-csrf-token");
  const cookie = request.cookies?.[CSRF_COOKIE] as string | undefined;
  if (!header || !cookie || header !== cookie || !request.auth || hashToken(header) !== request.auth.csrfHash) {
    return next(new AppError(403, "CSRF_INVALID", "Security token is missing or invalid"));
  }
  next();
}
