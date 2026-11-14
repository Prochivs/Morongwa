import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const service = await prisma.serviceType.upsert({
    where: { slug: "queue-assistance" },
    update: { active: true },
    create: {
      name: "Queue assistance",
      slug: "queue-assistance",
      description: "Permitted queue-position assistance without impersonation or bypassing institutional rules.",
    },
  });

  const institution = await prisma.institution.upsert({
    where: { slug: "queuemate-service-centre" },
    update: { active: true, deletedAt: null, restrictions: null, lastPermissionReviewAt: new Date() },
    create: {
      name: "QueueMate Service Centre",
      slug: "queuemate-service-centre",
      address: "Gaborone, Botswana",
      city: "Gaborone",
      description: "Queue assistance requests available for testing and operational review.",
      active: true,
      deletedAt: null,
      restrictions: null,
      estimatedDurationMinutes: 120,
      lastPermissionReviewAt: new Date(),
    },
  });

  await prisma.institutionPermission.upsert({
    where: { institutionId_serviceTypeId: { institutionId: institution.id, serviceTypeId: service.id } },
    update: { permitted: true, reviewedAt: new Date() },
    create: {
      institutionId: institution.id,
      serviceTypeId: service.id,
      permitted: true,
      conditions: "Subject to QueueMate review and current service availability.",
      reviewedAt: new Date(),
    },
  });

  const pricing = [
    { name: "Standard queue assistance", type: "FIXED" as const, amount: 50 },
    { name: "Early morning assistance", type: "FIXED" as const, amount: 70, criteria: { before: "07:00" } },
    { name: "Urgent assistance", type: "FIXED" as const, amount: 90, criteria: { noticeHoursLessThan: 24 } },
    { name: "Extended waiting", type: "CUSTOM_QUOTE" as const, amount: null },
  ];

  for (const rule of pricing) {
    const existing = await prisma.pricingRule.findFirst({ where: { name: rule.name, serviceTypeId: service.id } });
    if (!existing) {
      await prisma.pricingRule.create({
        data: { ...rule, serviceTypeId: service.id, currency: "BWP", effectiveFrom: new Date("2026-01-01T00:00:00.000Z"), effectiveTo: null },
      });
    }
  }

  const settings = [
    { key: "cancellation.policy", description: "Customer cancellation terms", value: { cutoffHours: 12, verifiedPaymentRefundReview: true } },
    { key: "business.contact", description: "Public contact details", value: { email: "hello@queuemate.co.bw", phone: "+267 71 000 000", city: "Gaborone" } },
    { key: "scheduling.travelBufferMinutes", description: "Default travel buffer", value: 30 },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description, sensitive: false },
      create: { ...setting, sensitive: false },
    });
  }

  const events = [
    "REQUEST_SUBMITTED",
    "PROOF_UPLOADED",
    "PAYMENT_VERIFIED",
    "PAYMENT_REJECTED",
    "REQUEST_APPROVED",
    "AGENT_ASSIGNED",
    "AGENT_EN_ROUTE",
    "AGENT_ARRIVED",
    "AGENT_COMPLETED",
    "AGENT_FAILED",
  ];

  for (const event of events) {
    await prisma.notificationTemplate.upsert({
      where: { event_channel: { event, channel: "IN_APP" } },
      update: { active: true },
      create: { event, channel: "IN_APP", body: `QueueMate update: ${event.toLowerCase().replaceAll("_", " ")}.` },
    });
  }

  console.info("QueueMate operational data is ready");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
