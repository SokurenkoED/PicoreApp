import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { parseOrThrow } from '../common/http-error';
import { AdminGuard } from '../auth/admin.guard';
import { ArticlesService } from './articles.service';

const langSchema = z.enum(['en', 'ru']).default('en');

const headingBlockSchema = z.object({
  type: z.enum(['h2', 'h3']),
  text: z.string().min(1)
});

const paragraphBlockSchema = z.object({
  type: z.literal('p'),
  text: z.string().min(1)
});

const quoteBlockSchema = z.object({
  type: z.literal('quote'),
  text: z.string().min(1),
  cite: z.string().min(1).optional()
});

const listBlockSchema = z.object({
  type: z.literal('ul'),
  items: z.array(z.string().min(1)).min(1)
});

const imageBlockSchema = z.object({
  type: z.literal('image'),
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().min(1).optional()
});

const blockContentSchema = z.object({
  format: z.literal('blocks'),
  blocks: z.array(
    z.union([headingBlockSchema, paragraphBlockSchema, quoteBlockSchema, listBlockSchema, imageBlockSchema])
  ).min(1)
});

const htmlContentSchema = z.object({
  format: z.literal('html'),
  html: z.string().min(1)
});

const articleContentSchema = z.union([htmlContentSchema, blockContentSchema]);

const adminArticleCreateSchema = z.object({
  slug: z.string().min(1),
  titleEn: z.string().min(1),
  titleRu: z.string().min(1),
  excerptEn: z.string().min(1),
  excerptRu: z.string().min(1),
  contentEn: articleContentSchema,
  contentRu: articleContentSchema,
  coverImageUrl: z.string().min(1),
  coverAltEn: z.string().min(1).optional(),
  coverAltRu: z.string().min(1).optional(),
  tagsEn: z.array(z.string().min(1)).default([]),
  tagsRu: z.array(z.string().min(1)).default([]),
  authorName: z.string().min(1).default('Picoria Editorial'),
  readingMinutes: z.number().int().min(1).max(120).default(5),
  isPublished: z.boolean().default(true),
  publishedAt: z.string().datetime().nullable().optional()
});

const adminArticleUpdateSchema = adminArticleCreateSchema.partial();

@Controller('/api')
export class ArticlesController {
  constructor(@Inject(ArticlesService) private readonly articlesService: ArticlesService) {}

  @Get('/blog/articles')
  async list(@Query('lang') lang?: string) {
    const resolvedLang = parseOrThrow(langSchema, lang ?? 'en');
    return this.articlesService.listPublished(resolvedLang);
  }

  @Get('/blog/articles/:slug')
  async detail(@Param('slug') slug: string, @Query('lang') lang?: string) {
    const resolvedLang = parseOrThrow(langSchema, lang ?? 'en');
    return this.articlesService.getBySlug(slug, resolvedLang);
  }

  @Get('/admin/blog/articles')
  @UseGuards(AdminGuard)
  async adminList() {
    return this.articlesService.adminList();
  }

  @Post('/admin/blog/articles')
  @UseGuards(AdminGuard)
  async adminCreate(@Body() body: unknown) {
    const dto = parseOrThrow(adminArticleCreateSchema, body);
    return this.articlesService.adminCreate({
      slug: dto.slug,
      titleEn: dto.titleEn,
      titleRu: dto.titleRu,
      excerptEn: dto.excerptEn,
      excerptRu: dto.excerptRu,
      contentEn: dto.contentEn,
      contentRu: dto.contentRu,
      coverImageUrl: dto.coverImageUrl,
      coverAltEn: dto.coverAltEn,
      coverAltRu: dto.coverAltRu,
      tagsEn: dto.tagsEn,
      tagsRu: dto.tagsRu,
      authorName: dto.authorName,
      readingMinutes: dto.readingMinutes,
      isPublished: dto.isPublished,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null
    });
  }

  @Put('/admin/blog/articles/:id')
  @UseGuards(AdminGuard)
  async adminUpdate(@Param('id') id: string, @Body() body: unknown) {
    const dto = parseOrThrow(adminArticleUpdateSchema, body);
    return this.articlesService.adminUpdate(id, {
      slug: dto.slug,
      titleEn: dto.titleEn,
      titleRu: dto.titleRu,
      excerptEn: dto.excerptEn,
      excerptRu: dto.excerptRu,
      contentEn: dto.contentEn,
      contentRu: dto.contentRu,
      coverImageUrl: dto.coverImageUrl,
      coverAltEn: dto.coverAltEn,
      coverAltRu: dto.coverAltRu,
      tagsEn: dto.tagsEn,
      tagsRu: dto.tagsRu,
      authorName: dto.authorName,
      readingMinutes: dto.readingMinutes,
      isPublished: dto.isPublished,
      publishedAt:
        typeof dto.publishedAt === 'string'
          ? new Date(dto.publishedAt)
          : dto.publishedAt === null
            ? null
            : undefined
    });
  }

  @Delete('/admin/blog/articles/:id')
  @UseGuards(AdminGuard)
  async adminDelete(@Param('id') id: string) {
    return this.articlesService.adminDelete(id);
  }
}
