import { z } from "zod";

export const roles = ["CUSTOMER", "AGENT", "ADMIN"] as const;
export type UserRole = (typeof roles)[number];

export const requestStatuses = [
  "DRAFT", "PENDING_PAYMENT", "PAYMENT_REVIEW", "PENDING_APPROVAL", "APPROVED",
  "AGENT_ASSIGNED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED", "FAILED",
  "REJECTED", "CANCELLED",
] as const;
export type RequestStatus = (typeof requestStatuses)[number];

export const paymentStatuses = [
  "UNPAID", "PROOF_UPLOADED", "UNDER_VERIFICATION", "VERIFIED", "REJECTED",
  "REFUND_PENDING", "REFUNDED",
] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export const assignmentStatuses = [
  "ASSIGNED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED",
  "FAILED", "CANCELLED",
] as const;
export type AssignmentStatus = (typeof assignmentStatuses)[number];

export const botswanaPhoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+267|267)?(?:7[1-8]|[2-6][0-9])[0-9]{6}$/, "Enter a valid Botswana mobile number");

export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[0-9]/, "Include a number")
  .regex(/[^A-Za-z0-9]/, "Include a symbol");

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-f]{24}$/i, "Enter a valid identifier");

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    mobile: botswanaPhoneSchema,
    password: passwordSchema,
    passwordConfirmation: z.string(),
    acceptTerms: z.literal(true),
    acceptPrivacy: z.literal(true),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

export const createRequestSchema = z.object({
  institutionId: objectIdSchema,
  serviceTypeId: objectIdSchema,
  requestedDate: z.string().date(),
  preferredArrivalTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  locationInstructions: z.string().trim().max(500).optional(),
  assistanceFor: z.enum(["SELF", "OTHER"]),
  instructions: z.string().trim().max(1500).optional(),
  contactName: z.string().trim().min(2).max(120),
  contactMobile: botswanaPhoneSchema,
  alternativeMobile: botswanaPhoneSchema.optional().or(z.literal("")),
  contactEmail: z.string().email(),
  onSiteContact: z.string().trim().max(200).optional(),
  acknowledgeAvailability: z.literal(true),
  acknowledgeInstitutionRules: z.literal(true),
  acknowledgeNoImpersonation: z.literal(true),
});

export const cancellationSchema = z.object({ reason: z.string().trim().min(10).max(500) });

export const customerProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address").transform((value) => value.toLowerCase()),
  mobile: botswanaPhoneSchema,
  altMobile: botswanaPhoneSchema.optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter your city").max(100),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  comment: z.string().trim().max(1000, "Keep your review under 1,000 characters").optional().or(z.literal("")),
});

export const paymentProofMetadataSchema = z.object({
  amountSubmitted: z.coerce.number().positive().max(100000),
  paymentReference: z.string().trim().min(3).max(100),
});

export const paymentDecisionSchema = z.object({
  notes: z.string().trim().min(3).max(1000),
});

export const requestDecisionSchema = z.object({
  reason: z.string().trim().min(5).max(1000).optional(),
});

export const assignmentSchema = z.object({
  requestId: objectIdSchema,
  agentId: objectIdSchema,
  travelBufferMinutes: z.coerce.number().int().min(0).max(240).default(30),
  overrideConflict: z.boolean().default(false),
  overrideReason: z.string().trim().min(10).max(500).optional(),
}).superRefine((value, context) => {
  if (value.overrideConflict && !value.overrideReason) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["overrideReason"], message: "An override reason is required" });
  }
});

export const assignmentTransitionSchema = z.object({
  status: z.enum(assignmentStatuses),
  note: z.string().trim().max(1000).optional(),
  outcome: z.string().trim().max(1000).optional(),
  permittedReference: z.string().trim().max(100).optional(),
});

export const institutionSchema = z.object({
  name: z.string().trim().min(2).max(160),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100).default("Gaborone"),
  contactPhone: z.string().trim().max(30).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional(),
  active: z.boolean().default(false),
  actualCustomerRequired: z.boolean().default(false),
  requiredAuthorisation: z.string().trim().max(500).optional(),
  restrictions: z.string().trim().max(1000).optional(),
  estimatedDurationMinutes: z.coerce.number().int().min(15).max(720).default(120),
  serviceTypeId: objectIdSchema,
  permitted: z.boolean().default(false),
  permissionConditions: z.string().trim().max(1000).optional(),
});

export const agentSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    mobile: botswanaPhoneSchema,
    agentReference: z.string().trim().regex(/^AGENT-[A-Z0-9-]+$/),
    emergencyContact: z.string().trim().max(160).optional(),
    available: z.boolean().default(false),
    hourlyRate: z.coerce.number().min(0).max(10000).default(0),
    password: passwordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Passwords do not match",
  });

export const availabilitySchema = z.object({
  type: z.enum(["WORKING_HOURS", "UNAVAILABLE", "DAY_OFF"]),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  note: z.string().trim().max(300).optional(),
}).refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
  path: ["endsAt"], message: "End time must be after start time",
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type CustomerProfileInput = z.infer<typeof customerProfileSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;

export type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
export type ApiFailure = { success: false; error: { code: string; message: string; details?: unknown } };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export const assignmentTransitions: Record<AssignmentStatus, readonly AssignmentStatus[]> = {
  ASSIGNED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["EN_ROUTE", "CANCELLED"],
  EN_ROUTE: ["ARRIVED", "FAILED"],
  ARRIVED: ["IN_PROGRESS", "FAILED"],
  IN_PROGRESS: ["COMPLETED", "FAILED"],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
};

export function canTransition(from: AssignmentStatus, to: AssignmentStatus): boolean {
  return assignmentTransitions[from].includes(to);
}

export function formatCurrency(value: number | string, currency = "BWP"): string {
  return new Intl.NumberFormat("en-BW", { style: "currency", currency }).format(Number(value));
}

export function getStatusLabel(status: string): string {
  return status.toLowerCase().split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
