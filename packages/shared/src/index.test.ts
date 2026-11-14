import { describe, expect, it } from "vitest";
import { canTransition, createRequestSchema, customerProfileSchema, registerSchema, reviewSchema } from "./index";

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

  it("validates customer profile updates", () => {
    expect(customerProfileSchema.safeParse({
      fullName: "Neo Molefe",
      email: "NEO@example.com",
      mobile: "+26771123456",
      altMobile: "",
      address: "Main Mall",
      city: "Gaborone",
    }).success).toBe(true);
    expect(customerProfileSchema.safeParse({
      fullName: "N",
      email: "not-an-email",
      mobile: "123",
      city: "Gaborone",
    }).success).toBe(false);
  });

  it("accepts only ratings from one to five", () => {
    expect(reviewSchema.safeParse({ rating: 5, comment: "Helpful and professional." }).success).toBe(true);
    expect(reviewSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 6 }).success).toBe(false);
  });
});
