import type { ErrorRequestHandler, RequestHandler } from "express";
import multer from "multer";
import { AppError } from "../utils/http.js";

export const notFound: RequestHandler = (request, _response, next) => {
  next(new AppError(404, "NOT_FOUND", `Route ${request.method} ${request.path} was not found`));
};

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  const known = error instanceof AppError;
  const upload = error instanceof multer.MulterError;
  const status = known ? error.status : upload ? 422 : 500;
  const code = known ? error.code : upload ? "UPLOAD_ERROR" : "INTERNAL_ERROR";
  const message = known ? error.message : upload ? error.message : "An unexpected error occurred";
  if (status >= 500) request.log?.error?.({ error }, "request failed");
  response.status(status).json({
    success: false,
    error: { code, message, ...(known && error.details ? { details: error.details } : {}) },
  });
};
