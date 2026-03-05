CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

ALTER TYPE "UserType" ADD VALUE IF NOT EXISTS 'local';
ALTER TYPE "UserType" ADD VALUE IF NOT EXISTS 'vk';
ALTER TYPE "UserType" ADD VALUE IF NOT EXISTS 'yandex';

ALTER TABLE "users"
  ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'user',
  ADD COLUMN "email" TEXT,
  ADD COLUMN "passwordHash" TEXT,
  ADD COLUMN "name" TEXT,
  ADD COLUMN "vkId" TEXT,
  ADD COLUMN "yandexId" TEXT;

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_vkId_key" ON "users"("vkId");
CREATE UNIQUE INDEX "users_yandexId_key" ON "users"("yandexId");

CREATE TABLE "generation_models" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "providerKey" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "generation_models_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "generation_models_key_key" ON "generation_models"("key");

CREATE TABLE "presets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "titleRu" TEXT NOT NULL,
  "descriptionEn" TEXT NOT NULL,
  "descriptionRu" TEXT NOT NULL,
  "promptTemplate" JSONB NOT NULL,
  "defaultParams" JSONB NOT NULL,
  "coverAssetKey" TEXT,
  "sampleAssetKeys" JSONB NOT NULL,
  "modelId" UUID,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "presets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "presets_slug_key" ON "presets"("slug");
CREATE INDEX "presets_modelId_updatedAt_idx" ON "presets"("modelId", "updatedAt");

CREATE TABLE "photoshoots" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "titleRu" TEXT NOT NULL,
  "descriptionEn" TEXT NOT NULL,
  "descriptionRu" TEXT NOT NULL,
  "coverAssetKey" TEXT,
  "galleryAssetKeys" JSONB NOT NULL,
  "presetId" UUID,
  "modelId" UUID,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "photoshoots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "photoshoots_slug_key" ON "photoshoots"("slug");
CREATE INDEX "photoshoots_presetId_updatedAt_idx" ON "photoshoots"("presetId", "updatedAt");
CREATE INDEX "photoshoots_modelId_updatedAt_idx" ON "photoshoots"("modelId", "updatedAt");

CREATE TABLE "password_reset_tokens" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");
CREATE INDEX "password_reset_tokens_userId_createdAt_idx" ON "password_reset_tokens"("userId", "createdAt");

ALTER TABLE "presets"
  ADD CONSTRAINT "presets_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "generation_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "photoshoots"
  ADD CONSTRAINT "photoshoots_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "presets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "photoshoots"
  ADD CONSTRAINT "photoshoots_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "generation_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "password_reset_tokens"
  ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
