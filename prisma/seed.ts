import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const developmentPassword = "QueueMateDev!2026";

async function createUser(input: { email: string; mobile: string; fullName: string; role: "ADMIN" | "AGENT" | "CUSTOMER"; agentReference?: string }) {
  const passwordHash = await bcrypt.hash(developmentPassword, 12);
  return prisma.user.upsert({
    where: { email: input.email },
    update: {},
    create: {
      email: input.email,
      mobile: input.mobile,
      fullName: input.fullName,
      role: input.role,
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      passwordHash,
      ...(input.role === "CUSTOMER" ? { customerProfile: { create: { termsAt: new Date(), privacyAt: new Date() } } } : {}),
      ...(input.role === "AGENT" ? { agentProfile: { create: { agentReference: input.agentReference!, onboardingComplete: true, available: true, hourlyRate: 50 } } } : {}),
    },
  });
}

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Development seed data is disabled in production");

  const admin = await createUser({ email: "admin@queuemate.local", mobile: "+26771100001", fullName: "QueueMate Administrator", role: "ADMIN" });
  const agentOne = await createUser({ email: "agent001@queuemate.local", mobile: "+26771100002", fullName: "Agent 001", role: "AGENT", agentReference: "AGENT-001" });
  const agentTwo = await createUser({ email: "agent002@queuemate.local", mobile: "+26771100003", fullName: "Agent 002", role: "AGENT", agentReference: "AGENT-002" });
  await createUser({ email: "customer@queuemate.local", mobile: "+26771100004", fullName: "Development Customer", role: "CUSTOMER" });

  const service = await prisma.serviceType.upsert({
    where: { slug: "queue-assistance" },
    update: {},
    create: { name: "Queue assistance", slug: "queue-assistance", description: "Permitted queue-position assistance without impersonation or bypassing institutional rules." },
  });

  const institution = await prisma.institution.upsert({
    where: { slug: "development-service-centre" },
    update: {},
    create: {
      name: "QueueMate Development Service Centre",
      slug: "development-service-centre",
      address: "Development environment, Gaborone",
      city: "Gaborone",
      description: "A development-only institution used to test the complete workflow.",
      active: true,
      actualCustomerRequired: false,
      restrictions: "Development data only. Replace with verified institutions before production launch.",
      estimatedDurationMinutes: 120,
      lastPermissionReviewAt: new Date(),
    },
  });

  await prisma.institutionPermission.upsert({
    where: { institutionId_serviceTypeId: { institutionId: institution.id, serviceTypeId: service.id } },
    update: { permitted: true, reviewedAt: new Date() },
    create: { institutionId: institution.id, serviceTypeId: service.id, permitted: true, conditions: "Development workflow only", reviewedAt: new Date() },
  });

  const pricing = [
    { name: "Standard queue assistance", type: "FIXED" as const, amount: 50 },
    { name: "Early morning assistance", type: "FIXED" as const, amount: 70, criteria: { before: "07:00" } },
    { name: "Urgent assistance", type: "FIXED" as const, amount: 90, criteria: { noticeHoursLessThan: 24 } },
    { name: "Extended waiting", type: "CUSTOM_QUOTE" as const, amount: null },
  ];
  for (const rule of pricing) {
    const existing = await prisma.pricingRule.findFirst({ where: { name: rule.name, serviceTypeId: service.id } });
    if (!existing) await prisma.pricingRule.create({ data: { ...rule, serviceTypeId: service.id, currency: "BWP", effectiveFrom: new Date("2026-01-01T00:00:00.000Z") } });
  }

  const settings = [
    { key: "bank.account", sensitive: true, description: "Development-only bank transfer details", value: { accountHolder: "QueueMate Development", bankName: "Configure before launch", accountNumber: "0000000000", branch: "Gaborone", branchCode: "000000", paymentInstructions: "Use the QueueMate request reference as the payment reference." } },
    { key: "cancellation.policy", sensitive: false, description: "Customer cancellation terms", value: { cutoffHours: 12, verifiedPaymentRefundReview: true } },
    { key: "business.contact", sensitive: false, description: "Public contact details", value: { email: "hello@queuemate.co.bw", phone: "+267 71 000 000", city: "Gaborone" } },
    { key: "scheduling.travelBufferMinutes", sensitive: false, description: "Default travel buffer", value: 30 },
  ];
  for (const setting of settings) {
    await prisma.systemSetting.upsert({ where: { key: setting.key }, update: { value: setting.value, description: setting.description, sensitive: setting.sensitive, updatedById: admin.id }, create: { ...setting, updatedById: admin.id } });
  }

  const templateEvents = ["REQUEST_SUBMITTED", "PROOF_UPLOADED", "PAYMENT_VERIFIED", "PAYMENT_REJECTED", "REQUEST_APPROVED", "AGENT_ASSIGNED", "AGENT_EN_ROUTE", "AGENT_ARRIVED", "AGENT_COMPLETED", "AGENT_FAILED"];
  for (const event of templateEvents) {
    await prisma.notificationTemplate.upsert({ where: { event_channel: { event, channel: "IN_APP" } }, update: {}, create: { event, channel: "IN_APP", body: `QueueMate update: ${event.toLowerCase().replaceAll("_", " ")}.` } });
  }

  const startsAt = new Date(); startsAt.setHours(5, 0, 0, 0);
  const endsAt = new Date(startsAt); endsAt.setFullYear(endsAt.getFullYear() + 1); endsAt.setHours(20, 0, 0, 0);
  for (const user of [agentOne, agentTwo]) {
    const agent = await prisma.agentProfile.findUniqueOrThrow({ where: { userId: user.id } });
    const existing = await prisma.agentAvailability.findFirst({ where: { agentId: agent.id, type: "WORKING_HOURS" } });
    if (!existing) await prisma.agentAvailability.create({ data: { agentId: agent.id, type: "WORKING_HOURS", startsAt, endsAt, note: "Development availability window" } });
  }

  console.info("QueueMate development seed complete");
  console.info("Admin: admin@queuemate.local / QueueMateDev!2026");
  console.info("Agent 001: agent001@queuemate.local / QueueMateDev!2026");
  console.info("Agent 002: agent002@queuemate.local / QueueMateDev!2026");
  console.info("Customer: customer@queuemate.local / QueueMateDev!2026");
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => prisma.$disconnect());
