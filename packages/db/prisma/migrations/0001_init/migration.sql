CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "UserType" AS ENUM ('guest', 'telegram');
CREATE TYPE "Locale" AS ENUM ('en', 'ru');
CREATE TYPE "AssetKind" AS ENUM ('input', 'preview', 'output');
CREATE TYPE "JobStatus" AS ENUM ('queued', 'processing', 'uploading_results', 'done', 'failed', 'canceled');
CREATE TYPE "PaymentProvider" AS ENUM ('tbank');
CREATE TYPE "PaymentStatus" AS ENUM ('created', 'pending', 'paid', 'failed', 'canceled');
CREATE TYPE "LedgerReason" AS ENUM ('purchase', 'spend', 'refund', 'admin');

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "type" "UserType" NOT NULL,
  "locale" "Locale" NOT NULL DEFAULT 'en',
  "telegramId" BIGINT,
  "isBlocked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "styles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "titleRu" TEXT NOT NULL,
  "descriptionEn" TEXT NOT NULL,
  "descriptionRu" TEXT NOT NULL,
  "faqEn" JSONB NOT NULL,
  "faqRu" JSONB NOT NULL,
  "sampleImages" JSONB NOT NULL,
  "promptTemplate" JSONB NOT NULL,
  "defaultParams" JSONB NOT NULL,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "styles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jobs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "styleId" UUID NOT NULL,
  "status" "JobStatus" NOT NULL DEFAULT 'queued',
  "providerKey" TEXT NOT NULL,
  "params" JSONB NOT NULL,
  "progress" INTEGER,
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "jobId" UUID,
  "kind" "AssetKind" NOT NULL,
  "storageKey" TEXT NOT NULL,
  "mime" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "packages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "priceRub" INTEGER NOT NULL,
  "credits" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sort" INTEGER NOT NULL DEFAULT 100,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "packageId" UUID,
  "provider" "PaymentProvider" NOT NULL,
  "providerPaymentId" TEXT,
  "orderId" TEXT NOT NULL,
  "amountRub" INTEGER NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'created',
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt" TIMESTAMP(3),
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "creditsLedger" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "delta" INTEGER NOT NULL,
  "reason" "LedgerReason" NOT NULL,
  "refId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "creditsLedger_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_telegramId_key" ON "users"("telegramId");
CREATE UNIQUE INDEX "styles_slug_key" ON "styles"("slug");
CREATE INDEX "jobs_userId_createdAt_idx" ON "jobs"("userId", "createdAt");
CREATE INDEX "assets_userId_createdAt_idx" ON "assets"("userId", "createdAt");
CREATE UNIQUE INDEX "payments_providerPaymentId_key" ON "payments"("providerPaymentId");
CREATE UNIQUE INDEX "payments_orderId_key" ON "payments"("orderId");
CREATE INDEX "payments_userId_createdAt_idx" ON "payments"("userId", "createdAt");
CREATE UNIQUE INDEX "creditsLedger_userId_reason_refId_key" ON "creditsLedger"("userId", "reason", "refId");
CREATE INDEX "creditsLedger_userId_createdAt_idx" ON "creditsLedger"("userId", "createdAt");

ALTER TABLE "jobs"
  ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jobs"
  ADD CONSTRAINT "jobs_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "styles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assets"
  ADD CONSTRAINT "assets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assets"
  ADD CONSTRAINT "assets_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments"
  ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments"
  ADD CONSTRAINT "payments_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "creditsLedger"
  ADD CONSTRAINT "creditsLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
