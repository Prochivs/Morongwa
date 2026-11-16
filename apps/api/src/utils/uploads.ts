import path from "node:path";
import { AppError } from "./http.js";

const signatures = [
  { mimeType: "image/jpeg", extension: ".jpg", bytes: [0xff, 0xd8, 0xff] },
  { mimeType: "image/png", extension: ".png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mimeType: "application/pdf", extension: ".pdf", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] },
] as const;

export function validatePrivateUpload(file: Express.Multer.File) {
  const signature = signatures.find((candidate) =>
    candidate.bytes.every((byte, index) => file.buffer[index] === byte),
  );
  if (!signature || file.mimetype !== signature.mimeType) {
    throw new AppError(422, "UNSAFE_FILE_TYPE", "Upload a genuine PDF, PNG, or JPEG file");
  }

  const baseName = path.basename(file.originalname, path.extname(file.originalname))
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F<>:"/\\|?*]/gu, "-")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, 100) || "upload";

  return { mimeType: signature.mimeType, originalName: `${baseName}${signature.extension}` };
}
