import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js/max";

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

const unsupportedControlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u;
const htmlDelimiters = /[<>]/u;

/**
 * Normalises human-entered text and rejects characters that can turn stored
 * values into HTML. Output encoding is still required when values are rendered.
 */
export function plainTextSchema(options: { min?: number; max: number; label?: string }) {
  const { min = 0, max, label = "This field" } = options;
  return z
    .string()
    .transform((value) => value.normalize("NFKC").trim())
    .refine((value) => !unsupportedControlCharacters.test(value), `${label} contains unsupported control characters`)
    .refine((value) => !htmlDelimiters.test(value), `${label} must not contain HTML`)
    .pipe(z.string().min(min, min > 0 ? `${label} is too short` : undefined).max(max, `${label} is too long`));
}

export const emailSchema = z
  .string()
  .transform((value) => value.normalize("NFKC").trim().toLowerCase())
  .pipe(z.string().email("Enter a valid email address").max(254));

export const internationalPhoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s().-]/g, ""))
  .refine((value) => /^\+[1-9]\d{7,14}$/.test(value) && isValidPhoneNumber(value), "Enter a valid international phone number");

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
    fullName: plainTextSchema({ min: 2, max: 120, label: "Full name" }),
    email: emailSchema,
    mobile: internationalPhoneSchema,
    password: passwordSchema,
    passwordConfirmation: z.string(),
    acceptTerms: z.literal(true),
    acceptPrivacy: z.literal(true),
  }).strict()
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
}).strict();

export const createRequestSchema = z.object({
  institutionId: objectIdSchema,
  serviceTypeId: objectIdSchema,
  requestedDate: z.string().date(),
  preferredArrivalTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  locationInstructions: plainTextSchema({ max: 500, label: "Location instructions" }).optional(),
  assistanceFor: z.enum(["SELF", "OTHER"]),
  instructions: plainTextSchema({ max: 1500, label: "Instructions" }).optional(),
  contactName: plainTextSchema({ min: 2, max: 120, label: "Contact name" }),
  contactMobile: internationalPhoneSchema,
  alternativeMobile: internationalPhoneSchema.optional().or(z.literal("")),
  contactEmail: emailSchema,
  onSiteContact: plainTextSchema({ max: 200, label: "On-site contact" }).optional(),
  acknowledgeAvailability: z.literal(true),
  acknowledgeInstitutionRules: z.literal(true),
  acknowledgeNoImpersonation: z.literal(true),
}).strict();

export const plannerItemSchema = z.object({
  title: plainTextSchema({ min: 2, max: 120, label: "Title" }),
  plannedDate: z.string().date(),
  plannedTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time"),
  notes: plainTextSchema({ max: 1000, label: "Notes" }).optional().or(z.literal("")),
}).strict();

export const cancellationSchema = z.object({ reason: plainTextSchema({ min: 10, max: 500, label: "Cancellation reason" }) }).strict();

export const customerProfileSchema = z.object({
  fullName: plainTextSchema({ min: 2, max: 120, label: "Full name" }),
  email: emailSchema,
  mobile: internationalPhoneSchema,
  altMobile: internationalPhoneSchema.optional().or(z.literal("")),
  address: plainTextSchema({ max: 300, label: "Address" }).optional().or(z.literal("")),
  city: plainTextSchema({ min: 2, max: 100, label: "City" }),
}).strict();

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  comment: plainTextSchema({ max: 1000, label: "Review" }).optional().or(z.literal("")),
}).strict();

export const paymentProofMetadataSchema = z.object({
  amountSubmitted: z.coerce.number().positive().max(100000),
  paymentReference: plainTextSchema({ min: 3, max: 100, label: "Payment reference" }),
}).strict();

export const paymentDecisionSchema = z.object({
  notes: plainTextSchema({ min: 3, max: 1000, label: "Notes" }),
}).strict();

export const requestDecisionSchema = z.object({
  reason: plainTextSchema({ min: 5, max: 1000, label: "Reason" }).optional(),
}).strict();

export const assignmentSchema = z.object({
  requestId: objectIdSchema,
  agentId: objectIdSchema,
  travelBufferMinutes: z.coerce.number().int().min(0).max(240).default(30),
  overrideConflict: z.boolean().default(false),
  overrideReason: plainTextSchema({ min: 10, max: 500, label: "Override reason" }).optional(),
}).strict().superRefine((value, context) => {
  if (value.overrideConflict && !value.overrideReason) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["overrideReason"], message: "An override reason is required" });
  }
});

export const assignmentTransitionSchema = z.object({
  status: z.enum(assignmentStatuses),
  note: plainTextSchema({ max: 1000, label: "Status note" }).optional(),
  outcome: plainTextSchema({ max: 1000, label: "Outcome" }).optional(),
  permittedReference: plainTextSchema({ max: 100, label: "Reference" }).optional(),
}).strict();

export const institutionSchema = z.object({
  name: plainTextSchema({ min: 2, max: 160, label: "Institution name" }),
  address: plainTextSchema({ min: 5, max: 300, label: "Address" }),
  city: plainTextSchema({ min: 2, max: 100, label: "City" }).default("Gaborone"),
  contactPhone: internationalPhoneSchema.optional().or(z.literal("")),
  contactEmail: emailSchema.optional().or(z.literal("")),
  description: plainTextSchema({ max: 1000, label: "Description" }).optional(),
  active: z.boolean().default(false),
  actualCustomerRequired: z.boolean().default(false),
  requiredAuthorisation: plainTextSchema({ max: 500, label: "Required authorisation" }).optional(),
  restrictions: plainTextSchema({ max: 1000, label: "Restrictions" }).optional(),
  estimatedDurationMinutes: z.coerce.number().int().min(15).max(720).default(120),
  serviceTypeId: objectIdSchema,
  permitted: z.boolean().default(false),
  permissionConditions: plainTextSchema({ max: 1000, label: "Permission conditions" }).optional(),
}).strict();

export const agentSchema = z
  .object({
    fullName: plainTextSchema({ min: 2, max: 120, label: "Full name" }),
    email: emailSchema,
    mobile: internationalPhoneSchema,
    emergencyContact: internationalPhoneSchema.optional().or(z.literal("")),
    available: z.boolean().default(false),
    password: passwordSchema,
    passwordConfirmation: z.string(),
  }).strict()
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Passwords do not match",
  });

export const availabilitySchema = z.object({
  type: z.enum(["WORKING_HOURS", "UNAVAILABLE", "DAY_OFF"]),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  note: plainTextSchema({ max: 300, label: "Availability note" }).optional(),
}).strict().refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
  path: ["endsAt"], message: "End time must be after start time",
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type PlannerItemInput = z.infer<typeof plannerItemSchema>;
export type CustomerProfileInput = z.infer<typeof customerProfileSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;

export type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
export type ApiFailure = { success: false; error: { code: string; message: string; details?: unknown } };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export const assignmentTransitions: Record<AssignmentStatus, readonly AssignmentStatus[]> = {
  ASSIGNED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["EN_ROUTE"],
  EN_ROUTE: ["ARRIVED", "IN_PROGRESS"],
  ARRIVED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
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
