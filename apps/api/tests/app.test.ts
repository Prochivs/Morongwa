import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { validatePrivateUpload } from "../src/utils/uploads.js";

describe("QueueMate API", () => {
  it("returns the standard not-found contract", async () => {
    const response = await request(createApp()).get("/api/v1/does-not-exist");
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ success: false, error: { code: "NOT_FOUND" } });
  });

  it("returns browser security headers", async () => {
    const response = await request(createApp()).get("/api/v1/does-not-exist");
    expect(response.headers["content-security-policy"]).toContain("default-src 'self'");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("rejects stored-XSS and mass-assignment attempts before database access", async () => {
    const base = {
      fullName: "<img src=x onerror=alert(1)>",
      email: "security-test@example.com",
      mobile: "+26771123456",
      password: "QueueMateDev!2026",
      passwordConfirmation: "QueueMateDev!2026",
      acceptTerms: true,
      acceptPrivacy: true,
    };
    const xss = await request(createApp()).post("/api/v1/auth/register").send(base);
    expect(xss.status).toBe(422);
    expect(xss.body.error.code).toBe("VALIDATION_ERROR");

    const extraField = await request(createApp()).post("/api/v1/auth/register").send({
      ...base,
      fullName: "Security Test",
      role: "ADMIN",
    });
    expect(extraField.status).toBe(422);
  });

  it("rejects files whose content does not match an allowed type", () => {
    const fakeFile = {
      buffer: Buffer.from("<script>alert(1)</script>"),
      mimetype: "image/png",
      originalname: "proof.png",
    } as Express.Multer.File;
    expect(() => validatePrivateUpload(fakeFile)).toThrow("Upload a genuine PDF, PNG, or JPEG file");
  });
});
