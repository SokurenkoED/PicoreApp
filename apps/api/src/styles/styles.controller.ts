import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { Prisma } from '@picoria/db';
import { parseOrThrow } from '../common/http-error';
import { AdminGuard } from '../auth/admin.guard';
import { StylesService } from './styles.service';

const langSchema = z.enum(['en', 'ru']).default('en');

const adminStyleCreateSchema = z.object({
  slug: z.string().min(1),
  titleEn: z.string().min(1),
  titleRu: z.string().min(1),
  descriptionEn: z.string().min(1),
  descriptionRu: z.string().min(1),
  faqEn: z.any(),
  faqRu: z.any(),
  sampleImages: z.any(),
  promptTemplate: z.any(),
  defaultParams: z.any(),
  isPublished: z.boolean().default(true)
});

const adminStyleUpdateSchema = adminStyleCreateSchema.partial();

@Controller('/api')
export class StylesController {
  constructor(@Inject(StylesService) private readonly stylesService: StylesService) {}

  @Get('/styles')
  async list(@Query('lang') lang?: string) {
    const resolvedLang = parseOrThrow(langSchema, lang ?? 'en');
    return this.stylesService.listPublished(resolvedLang);
  }

  @Get('/styles/:slug')
  async detail(@Param('slug') slug: string, @Query('lang') lang?: string) {
    const resolvedLang = parseOrThrow(langSchema, lang ?? 'en');
    return this.stylesService.getBySlug(slug, resolvedLang);
  }

  @Get('/admin/styles')
  @UseGuards(AdminGuard)
  async adminList() {
    return this.stylesService.adminList();
  }

  @Post('/admin/styles')
  @UseGuards(AdminGuard)
  async adminCreate(@Body() body: unknown) {
    const dto = parseOrThrow(adminStyleCreateSchema, body);
    return this.stylesService.adminCreate({
      slug: dto.slug,
      titleEn: dto.titleEn,
      titleRu: dto.titleRu,
      descriptionEn: dto.descriptionEn,
      descriptionRu: dto.descriptionRu,
      faqEn: (dto.faqEn ?? []) as Prisma.InputJsonValue,
      faqRu: (dto.faqRu ?? []) as Prisma.InputJsonValue,
      sampleImages: (dto.sampleImages ?? []) as Prisma.InputJsonValue,
      promptTemplate: (dto.promptTemplate ?? {}) as Prisma.InputJsonValue,
      defaultParams: (dto.defaultParams ?? {}) as Prisma.InputJsonValue,
      isPublished: dto.isPublished
    });
  }

  @Put('/admin/styles/:id')
  @UseGuards(AdminGuard)
  async adminUpdate(@Param('id') id: string, @Body() body: unknown) {
    const dto = parseOrThrow(adminStyleUpdateSchema, body);
    return this.stylesService.adminUpdate(id, dto);
  }

  @Delete('/admin/styles/:id')
  @UseGuards(AdminGuard)
  async adminDelete(@Param('id') id: string) {
    return this.stylesService.adminDelete(id);
  }
}
