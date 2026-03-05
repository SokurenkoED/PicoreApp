import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, prisma } from '@picoria/db';
import { sanitizeContent } from './content-sanitizer';

type BlogContentInput =
  | {
      format: 'html';
      html: string;
    }
  | {
      format: 'blocks';
      blocks: Array<
        | { type: 'h2' | 'h3'; text: string }
        | { type: 'p'; text: string }
        | { type: 'quote'; text: string; cite?: string }
        | { type: 'ul'; items: string[] }
        | { type: 'image'; src: string; alt: string; caption?: string }
      >;
    };

type BlogArticleCreateInput = {
  slug: string;
  titleEn: string;
  titleRu: string;
  excerptEn: string;
  excerptRu: string;
  contentEn: BlogContentInput;
  contentRu: BlogContentInput;
  coverImageUrl: string;
  coverAltEn?: string;
  coverAltRu?: string;
  tagsEn: string[];
  tagsRu: string[];
  authorName: string;
  readingMinutes: number;
  isPublished: boolean;
  publishedAt: Date | null;
};

type BlogArticleUpdateInput = Partial<BlogArticleCreateInput>;

@Injectable()
export class ArticlesService {
  private asStringArray(input: unknown): string[] {
    if (!Array.isArray(input)) {
      return [];
    }

    return input.filter((item): item is string => typeof item === 'string');
  }

  async listPublished(lang: 'en' | 'ru') {
    const now = new Date();
    const items = await prisma.blogArticle.findMany({
      where: {
        isPublished: true,
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }]
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
    });

    return items.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: lang === 'ru' ? item.titleRu : item.titleEn,
      excerpt: lang === 'ru' ? item.excerptRu : item.excerptEn,
      coverImageUrl: item.coverImageUrl,
      coverAlt: lang === 'ru' ? item.coverAltRu ?? item.coverAltEn ?? '' : item.coverAltEn ?? item.coverAltRu ?? '',
      tags: this.asStringArray(lang === 'ru' ? item.tagsRu : item.tagsEn),
      authorName: item.authorName,
      readingMinutes: item.readingMinutes,
      publishedAt: item.publishedAt
    }));
  }

  async getBySlug(slug: string, lang: 'en' | 'ru') {
    const article = await prisma.blogArticle.findUnique({ where: { slug } });
    const now = new Date();
    if (!article || !article.isPublished || (article.publishedAt && article.publishedAt > now)) {
      throw new NotFoundException('Article not found');
    }

    return {
      id: article.id,
      slug: article.slug,
      title: lang === 'ru' ? article.titleRu : article.titleEn,
      excerpt: lang === 'ru' ? article.excerptRu : article.excerptEn,
      content: (lang === 'ru' ? article.contentRu : article.contentEn) as BlogContentInput,
      coverImageUrl: article.coverImageUrl,
      coverAlt: lang === 'ru' ? article.coverAltRu ?? article.coverAltEn ?? '' : article.coverAltEn ?? article.coverAltRu ?? '',
      tags: this.asStringArray(lang === 'ru' ? article.tagsRu : article.tagsEn),
      authorName: article.authorName,
      readingMinutes: article.readingMinutes,
      publishedAt: article.publishedAt
    };
  }

  async adminList() {
    return prisma.blogArticle.findMany({
      orderBy: [{ updatedAt: 'desc' }]
    });
  }

  async adminCreate(input: BlogArticleCreateInput) {
    return prisma.blogArticle.create({
      data: {
        slug: input.slug,
        titleEn: input.titleEn,
        titleRu: input.titleRu,
        excerptEn: input.excerptEn,
        excerptRu: input.excerptRu,
        coverImageUrl: input.coverImageUrl,
        coverAltEn: input.coverAltEn,
        coverAltRu: input.coverAltRu,
        authorName: input.authorName,
        readingMinutes: input.readingMinutes,
        isPublished: input.isPublished,
        publishedAt: input.publishedAt,
        contentEn: sanitizeContent(input.contentEn) as Prisma.InputJsonValue,
        contentRu: sanitizeContent(input.contentRu) as Prisma.InputJsonValue,
        tagsEn: input.tagsEn as Prisma.InputJsonValue,
        tagsRu: input.tagsRu as Prisma.InputJsonValue
      }
    });
  }

  async adminUpdate(id: string, input: BlogArticleUpdateInput) {
    const data: Prisma.BlogArticleUpdateInput = {};

    if (typeof input.slug === 'string') {
      data.slug = input.slug;
    }

    if (typeof input.titleEn === 'string') {
      data.titleEn = input.titleEn;
    }

    if (typeof input.titleRu === 'string') {
      data.titleRu = input.titleRu;
    }

    if (typeof input.excerptEn === 'string') {
      data.excerptEn = input.excerptEn;
    }

    if (typeof input.excerptRu === 'string') {
      data.excerptRu = input.excerptRu;
    }

    if (typeof input.coverImageUrl === 'string') {
      data.coverImageUrl = input.coverImageUrl;
    }

    if (typeof input.coverAltEn === 'string') {
      data.coverAltEn = input.coverAltEn;
    }

    if (typeof input.coverAltRu === 'string') {
      data.coverAltRu = input.coverAltRu;
    }

    if (typeof input.authorName === 'string') {
      data.authorName = input.authorName;
    }

    if (typeof input.readingMinutes === 'number') {
      data.readingMinutes = input.readingMinutes;
    }

    if (typeof input.isPublished === 'boolean') {
      data.isPublished = input.isPublished;
    }

    if (input.publishedAt !== undefined) {
      data.publishedAt = input.publishedAt;
    }

    if (input.contentEn) {
      data.contentEn = sanitizeContent(input.contentEn) as Prisma.InputJsonValue;
    }

    if (input.contentRu) {
      data.contentRu = sanitizeContent(input.contentRu) as Prisma.InputJsonValue;
    }

    if (input.tagsEn) {
      data.tagsEn = input.tagsEn as Prisma.InputJsonValue;
    }

    if (input.tagsRu) {
      data.tagsRu = input.tagsRu as Prisma.InputJsonValue;
    }

    return prisma.blogArticle.update({
      where: { id },
      data
    });
  }

  async adminDelete(id: string) {
    return prisma.blogArticle.delete({ where: { id } });
  }
}
