CREATE TABLE "blog_articles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "titleRu" TEXT NOT NULL,
  "excerptEn" TEXT NOT NULL,
  "excerptRu" TEXT NOT NULL,
  "contentEn" JSONB NOT NULL,
  "contentRu" JSONB NOT NULL,
  "coverImageUrl" TEXT NOT NULL,
  "coverAltEn" TEXT,
  "coverAltRu" TEXT,
  "tagsEn" JSONB NOT NULL,
  "tagsRu" JSONB NOT NULL,
  "authorName" TEXT NOT NULL,
  "readingMinutes" INTEGER NOT NULL DEFAULT 5,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "blog_articles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "blog_articles_slug_key" ON "blog_articles"("slug");
CREATE INDEX "blog_articles_isPublished_publishedAt_idx" ON "blog_articles"("isPublished", "publishedAt");
