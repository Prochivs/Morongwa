import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import authRoutes from "./modules/auth/routes.js";
import publicRoutes from "./modules/public/routes.js";
import customerRoutes from "./modules/customer/routes.js";
import paymentRoutes from "./modules/payments/routes.js";
import adminRoutes from "./modules/admin/routes.js";
import agentRoutes from "./modules/agent/routes.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(pinoHttp({ redact: ["req.headers.authorization", "req.headers.cookie", "req.body.password", "req.body.passwordConfirmation"] }));
  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
  app.use(cors({ origin: env.APP_URL, credentials: true, methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"] }));
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(cookieParser());
  app.use("/api/v1/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false }), authRoutes);
  app.use("/api/v1", rateLimit({ windowMs: 60 * 1000, limit: 180, standardHeaders: "draft-7", legacyHeaders: false }), publicRoutes, customerRoutes, paymentRoutes, adminRoutes, agentRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
