import { describe, expect, it } from "vitest";
import { canTransition, createRequestSchema, registerSchema } from "./index";

describe("shared business contracts", () => {
  it("accepts only valid assignment transitions", () => {
    expect(canTransition("ASSIGNED", "ACCEPTED")).toBe(true);
    expect(canTransition("ASSIGNED", "COMPLETED")).toBe(false);
    expect(canTransition("COMPLETED", "IN_PROGRESS")).toBe(false);
  });

  it("requires strong matching passwords and Botswana mobile numbers", () => {
    expect(registerSchema.safeParse({
      fullName: "Test Customer",
      email: "customer@example.com",
      mobile: "+26771123456",
      password: "QueueMateDev!2026",
      passwordConfirmation: "QueueMateDev!2026",
      acceptTerms: true,
      acceptPrivacy: true,
    }).success).toBe(true);
  });

  it("rejects a request without the mandatory acknowledgements", () => {
    expect(createRequestSchema.safeParse({}).success).toBe(false);
  });
});
