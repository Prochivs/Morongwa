-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'PAYMENT_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'AGENT_ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PROOF_UPLOADED', 'UNDER_VERIFICATION', 'VERIFIED', 'REJECTED', 'REFUND_PENDING', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AvailabilityType" AS ENUM ('WORKING_HOURS', 'UNAVAILABLE', 'DAY_OFF');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('FIXED', 'CUSTOM_QUOTE');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('PAYMENT_PROOF', 'COMPLETION_DOCUMENT', 'QUEUE_REFERENCE', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "csrfHash" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "altMobile" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Gaborone',
    "termsAt" TIMESTAMP(3) NOT NULL,
    "privacyAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "agentReference" TEXT NOT NULL,
    "emergencyContact" TEXT,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "hourlyRate" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Gaborone',
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "actualCustomerRequired" BOOLEAN NOT NULL DEFAULT false,
    "requiredAuthorisation" TEXT,
    "restrictions" TEXT,
    "estimatedDurationMinutes" INTEGER NOT NULL DEFAULT 120,
    "internalNotes" TEXT,
    "lastPermissionReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstitutionPermission" (
    "id" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "serviceTypeId" UUID NOT NULL,
    "permitted" BOOLEAN NOT NULL DEFAULT false,
    "conditions" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstitutionPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingRule" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "serviceTypeId" UUID NOT NULL,
    "type" "PricingType" NOT NULL DEFAULT 'FIXED',
    "amount" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'BWP',
    "criteria" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "customerId" UUID NOT NULL,
    "institutionId" UUID NOT NULL,
    "serviceTypeId" UUID NOT NULL,
    "pricingRuleId" UUID,
    "requestedDate" DATE NOT NULL,
    "preferredArrivalTime" TEXT NOT NULL,
    "scheduledStartAt" TIMESTAMP(3) NOT NULL,
    "estimatedDurationMinutes" INTEGER NOT NULL,
    "locationInstructions" TEXT,
    "assistanceFor" TEXT NOT NULL DEFAULT 'SELF',
    "instructions" TEXT,
    "contactName" TEXT NOT NULL,
    "contactMobile" TEXT NOT NULL,
    "alternativeMobile" TEXT,
    "contactEmail" TEXT NOT NULL,
    "onSiteContact" TEXT,
    "quotedAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BWP',
    "requestStatus" "RequestStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "termsAcceptedAt" TIMESTAMP(3) NOT NULL,
    "rejectionReason" TEXT,
    "cancellationReason" TEXT,
    "refundEligible" BOOLEAN,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "amountExpected" DECIMAL(12,2) NOT NULL,
    "amountSubmitted" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'BWP',
    "paymentReference" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "verificationNotes" TEXT,
    "verifiedById" UUID,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentProof" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentProof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentAvailability" (
    "id" UUID NOT NULL,
    "agentId" UUID NOT NULL,
    "type" "AvailabilityType" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentAssignment" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "agentId" UUID NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "scheduledStartAt" TIMESTAMP(3) NOT NULL,
    "scheduledEndAt" TIMESTAMP(3) NOT NULL,
    "travelBufferMinutes" INTEGER NOT NULL DEFAULT 30,
    "overrideReason" TEXT,
    "assignedById" UUID NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskUpdate" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "assignmentId" UUID,
    "status" "AssignmentStatus" NOT NULL,
    "message" TEXT,
    "publicNote" TEXT,
    "actorId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskEvidence" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "assignmentId" UUID,
    "type" "EvidenceType" NOT NULL,
    "storageKey" TEXT,
    "permittedReference" TEXT,
    "outcome" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "requestId" UUID,
    "channel" "NotificationChannel" NOT NULL,
    "event" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "failureDetail" TEXT,
    "readAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" UUID NOT NULL,
    "event" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentEarning" (
    "id" UUID NOT NULL,
    "agentId" UUID NOT NULL,
    "assignmentId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BWP',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentEarning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "sensitive" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemCounter" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestNote" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_expiresAt_idx" ON "PasswordReset"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_userId_key" ON "CustomerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_userId_key" ON "AgentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_agentReference_key" ON "AgentProfile"("agentReference");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_slug_key" ON "Institution"("slug");

-- CreateIndex
CREATE INDEX "Institution_active_city_idx" ON "Institution"("active", "city");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionPermission_institutionId_serviceTypeId_key" ON "InstitutionPermission"("institutionId", "serviceTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_slug_key" ON "ServiceType"("slug");

-- CreateIndex
CREATE INDEX "PricingRule_serviceTypeId_active_effectiveFrom_idx" ON "PricingRule"("serviceTypeId", "active", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_reference_key" ON "ServiceRequest"("reference");

-- CreateIndex
CREATE INDEX "ServiceRequest_customerId_createdAt_idx" ON "ServiceRequest"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "ServiceRequest_requestStatus_paymentStatus_idx" ON "ServiceRequest"("requestStatus", "paymentStatus");

-- CreateIndex
CREATE INDEX "ServiceRequest_institutionId_scheduledStartAt_idx" ON "ServiceRequest"("institutionId", "scheduledStartAt");

-- CreateIndex
CREATE INDEX "Payment_requestId_status_idx" ON "Payment"("requestId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentProof_storageKey_key" ON "PaymentProof"("storageKey");

-- CreateIndex
CREATE INDEX "AgentAvailability_agentId_startsAt_endsAt_idx" ON "AgentAvailability"("agentId", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "AgentAssignment_agentId_scheduledStartAt_scheduledEndAt_idx" ON "AgentAssignment"("agentId", "scheduledStartAt", "scheduledEndAt");

-- CreateIndex
CREATE INDEX "AgentAssignment_requestId_status_idx" ON "AgentAssignment"("requestId", "status");

-- CreateIndex
CREATE INDEX "TaskUpdate_requestId_createdAt_idx" ON "TaskUpdate"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_event_channel_key" ON "NotificationTemplate"("event", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "Review_requestId_key" ON "Review"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "Refund_requestId_key" ON "Refund"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentEarning_agentId_assignmentId_key" ON "AgentEarning"("agentId", "assignmentId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "SystemCounter_key_key" ON "SystemCounter"("key");

-- CreateIndex
CREATE INDEX "RequestNote_requestId_createdAt_idx" ON "RequestNote"("requestId", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionPermission" ADD CONSTRAINT "InstitutionPermission_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionPermission" ADD CONSTRAINT "InstitutionPermission_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingRule" ADD CONSTRAINT "PricingRule_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_pricingRuleId_fkey" FOREIGN KEY ("pricingRuleId") REFERENCES "PricingRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentProof" ADD CONSTRAINT "PaymentProof_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAvailability" ADD CONSTRAINT "AgentAvailability_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAssignment" ADD CONSTRAINT "AgentAssignment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAssignment" ADD CONSTRAINT "AgentAssignment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskUpdate" ADD CONSTRAINT "TaskUpdate_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "AgentAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskEvidence" ADD CONSTRAINT "TaskEvidence_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskEvidence" ADD CONSTRAINT "TaskEvidence_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "AgentAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentEarning" ADD CONSTRAINT "AgentEarning_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentEarning" ADD CONSTRAINT "AgentEarning_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "AgentAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestNote" ADD CONSTRAINT "RequestNote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestNote" ADD CONSTRAINT "RequestNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
