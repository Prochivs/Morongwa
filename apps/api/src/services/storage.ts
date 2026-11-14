import crypto from "node:crypto";
import { get, put } from "@vercel/blob";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";

const useVercelBlob = Boolean(process.env.VERCEL || process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);

function getLocalStorage() {
  if (!env.MINIO_ENDPOINT || !env.MINIO_ACCESS_KEY || !env.MINIO_SECRET_KEY || !env.MINIO_BUCKET) {
    throw new AppError(500, "STORAGE_UNAVAILABLE", "Private file storage is not configured");
  }

  return new S3Client({
    endpoint: env.MINIO_ENDPOINT,
    region: env.MINIO_REGION,
    forcePathStyle: true,
    credentials: { accessKeyId: env.MINIO_ACCESS_KEY, secretAccessKey: env.MINIO_SECRET_KEY },
  });
}

const signatures = {
  "application/pdf": (buffer: Buffer) => buffer.subarray(0, 5).toString() === "%PDF-",
  "image/png": (buffer: Buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/jpeg": (buffer: Buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
} as const;

export function validatePrivateDocument(file: Express.Multer.File) {
  const validator = signatures[file.mimetype as keyof typeof signatures];
  if (!validator || !validator(file.buffer)) throw new AppError(422, "INVALID_FILE", "Upload a genuine PDF, PNG, or JPEG file");
  if (file.size > 5 * 1024 * 1024) throw new AppError(422, "FILE_TOO_LARGE", "Files must be 5 MB or smaller");
}

export async function putPrivateFile(prefix: string, file: Express.Multer.File) {
  validatePrivateDocument(file);
  const extension = file.mimetype === "application/pdf" ? "pdf" : file.mimetype === "image/png" ? "png" : "jpg";
  const sha256 = crypto.createHash("sha256").update(file.buffer).digest("hex");
  const key = `${prefix}/${crypto.randomUUID()}.${extension}`;

  if (useVercelBlob) {
    const stored = await put(key, file.buffer, {
      access: "private",
      addRandomSuffix: false,
      contentType: file.mimetype,
    });
    return { key: stored.pathname, sha256 };
  }

  await getLocalStorage().send(
    new PutObjectCommand({
      Bucket: env.MINIO_BUCKET!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: { sha256 },
    }),
  );
  return { key, sha256 };
}

export async function getPrivateFile(key: string) {
  if (useVercelBlob) {
    const object = await get(key, { access: "private" });
    if (!object || object.statusCode !== 200 || !object.stream) {
      throw new AppError(404, "FILE_NOT_FOUND", "The requested file is unavailable");
    }
    return Buffer.from(await new Response(object.stream).arrayBuffer());
  }

  const object = await getLocalStorage().send(new GetObjectCommand({ Bucket: env.MINIO_BUCKET!, Key: key }));
  if (!object.Body) throw new AppError(404, "FILE_NOT_FOUND", "The requested file is unavailable");
  return Buffer.from(await object.Body.transformToByteArray());
}
