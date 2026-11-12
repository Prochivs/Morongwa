import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const asyncHandler = (handler: (request: Request, response: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (request, response, next) => void handler(request, response, next).catch(next);

export function parseBody<Schema extends z.ZodType>(schema: Schema, body: unknown): z.infer<Schema> {
  const result = schema.safeParse(body);
  if (!result.success) throw new AppError(422, "VALIDATION_ERROR", "Please correct the highlighted fields", result.error.flatten());
  return result.data;
}

export function ok<T>(response: Response, data: T, status = 200, meta?: Record<string, unknown>) {
  return response.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function pagination(query: Request["query"]) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
