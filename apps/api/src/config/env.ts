import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  APP_URL: z.string().url().default("http://localhost:8080"),
  MINIO_ENDPOINT: z.string().url(),
  MINIO_REGION: z.string().default("us-east-1"),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(8),
  MINIO_BUCKET: z.string().min(3),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default("QueueMate <no-reply@queuemate.co.bw>"),
  BUSINESS_NAME: z.string().default("QueueMate"),
  BUSINESS_CURRENCY: z.string().default("BWP"),
  BUSINESS_TIMEZONE: z.string().default("Africa/Gaborone"),
  BUSINESS_CITY: z.string().default("Gaborone"),
  BUSINESS_COUNTRY: z.string().default("Botswana"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const message = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment: ${message}`);
}

export const env = parsed.data;
