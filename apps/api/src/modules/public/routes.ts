import { Router } from "express";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { asyncHandler, ok } from "../../utils/http.js";

const router = Router();

router.get("/health", asyncHandler(async (_request, response) => {
  await prisma.user.findFirst({ select: { id: true } });
  return ok(response, { status: "healthy", timestamp: new Date().toISOString(), service: "queuemate-api" });
}));

router.get("/public/config", asyncHandler(async (_request, response) => {
  const settings = await prisma.systemSetting.findMany({ where: { sensitive: false }, select: { key: true, value: true } });
  return ok(response, {
    business: { name: env.BUSINESS_NAME, tagline: "We Queue. You Save Time.", city: env.BUSINESS_CITY, country: env.BUSINESS_COUNTRY, currency: env.BUSINESS_CURRENCY, timezone: env.BUSINESS_TIMEZONE },
    settings: Object.fromEntries(settings.map((setting) => [setting.key, setting.value])),
  });
}));

router.get("/public/institutions", asyncHandler(async (_request, response) => {
  const institutions = await prisma.institution.findMany({
    where: { active: true, OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }], permissions: { some: { permitted: true, serviceType: { active: true } } } },
    select: { id: true, name: true, address: true, city: true, description: true, actualCustomerRequired: true, restrictions: true, estimatedDurationMinutes: true, permissions: { where: { permitted: true }, select: { conditions: true, serviceType: { select: { id: true, name: true, description: true } } } } },
    orderBy: { name: "asc" },
  });
  return ok(response, institutions);
}));

router.get("/public/pricing", asyncHandler(async (_request, response) => {
  const pricing = await prisma.pricingRule.findMany({ where: { active: true, effectiveFrom: { lte: new Date() }, OR: [{ effectiveTo: null }, { effectiveTo: { isSet: false } }, { effectiveTo: { gt: new Date() } }] }, include: { serviceType: { select: { name: true } } }, orderBy: { amount: "asc" } });
  return ok(response, pricing);
}));

router.get("/public/reviews", asyncHandler(async (_request, response) => {
  const reviews = await prisma.review.findMany({ where: { approved: true }, select: { rating: true, comment: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 6 });
  return ok(response, reviews);
}));

export default router;
