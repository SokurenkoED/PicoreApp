CREATE TABLE "preset_categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "preset_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "preset_categories_slug_key" ON "preset_categories"("slug");

ALTER TABLE "presets"
  ADD COLUMN "categoryId" UUID;

CREATE INDEX "presets_categoryId_updatedAt_idx" ON "presets"("categoryId", "updatedAt");

ALTER TABLE "presets"
  ADD CONSTRAINT "presets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "preset_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
