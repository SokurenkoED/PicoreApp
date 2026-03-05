import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Delete,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { z } from 'zod';
import { Prisma } from '@picoria/db';
import { parseOrThrow } from '../common/http-error';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';

const langSchema = z.enum(['en', 'ru']).default('en');
const roleSchema = z.enum(['user', 'admin']);

const updateRoleSchema = z.object({
  role: roleSchema
});

const updateUserSchema = z.object({
  role: roleSchema.optional(),
  isBlocked: z.boolean().optional(),
  locale: z.enum(['en', 'ru']).optional(),
  email: z.string().email().nullable().optional(),
  name: z.string().max(100).nullable().optional()
});

const adjustCreditsSchema = z.object({
  delta: z.number().int().refine((value) => value !== 0, 'delta must be non-zero'),
  refId: z.string().max(128).optional()
});

const modelCreateSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  providerKey: z.string().min(1),
  isActive: z.boolean().default(true)
});

const modelUpdateSchema = modelCreateSchema.partial();

const presetCategoryCreateSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1)
});

const presetCategoryUpdateSchema = presetCategoryCreateSchema.partial();

const presetCreateSchema = z.object({
  slug: z.string().min(1),
  titleEn: z.string().min(1),
  titleRu: z.string().min(1),
  descriptionEn: z.string().min(1),
  descriptionRu: z.string().min(1),
  promptTemplate: z.any().default({}),
  defaultParams: z.any().default({}),
  coverAssetKey: z.string().min(1).nullable().optional(),
  sampleAssetKeys: z.array(z.string().min(1)).default([]),
  modelId: z.string().uuid().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  isPublished: z.boolean().default(true)
});

const presetUpdateSchema = presetCreateSchema.partial();

const photoshootCreateSchema = z.object({
  slug: z.string().min(1),
  titleEn: z.string().min(1),
  titleRu: z.string().min(1),
  descriptionEn: z.string().min(1),
  descriptionRu: z.string().min(1),
  coverAssetKey: z.string().min(1).nullable().optional(),
  galleryAssetKeys: z.array(z.string().min(1)).default([]),
  presetId: z.string().uuid().nullable().optional(),
  modelId: z.string().uuid().nullable().optional(),
  isPublished: z.boolean().default(true)
});

const photoshootUpdateSchema = photoshootCreateSchema.partial();

const mediaPresignSchema = z.object({
  mime: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  sizeBytes: z.number().int().positive().max(50 * 1024 * 1024)
});

const mediaCompleteSchema = z.object({
  assetId: z.string().uuid(),
  width: z.number().int().positive(),
  height: z.number().int().positive()
});

@Controller('/api/admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(@Inject(AdminService) private readonly adminService: AdminService) {}

  @Get('/dashboard')
  async dashboard() {
    return this.adminService.getDashboard();
  }

  @Get('/users')
  async users() {
    return this.adminService.listUsers();
  }

  @Put('/users/:id/role')
  async updateRole(@Req() request: FastifyRequest, @Param('id') id: string, @Body() body: unknown) {
    const dto = parseOrThrow(updateRoleSchema, body);
    return this.adminService.updateUserRole(request, id, dto.role);
  }

  @Put('/users/:id')
  async updateUser(@Req() request: FastifyRequest, @Param('id') id: string, @Body() body: unknown) {
    const dto = parseOrThrow(updateUserSchema, body);
    return this.adminService.updateUser(request, id, dto);
  }

  @Post('/users/:id/credits')
  async adjustCredits(@Req() request: FastifyRequest, @Param('id') id: string, @Body() body: unknown) {
    const dto = parseOrThrow(adjustCreditsSchema, body);
    return this.adminService.adjustUserCredits(request, id, dto);
  }

  @Delete('/users/:id')
  async deleteUser(@Req() request: FastifyRequest, @Param('id') id: string) {
    return this.adminService.deleteUser(request, id);
  }

  @Get('/models')
  async models() {
    return this.adminService.adminListModels();
  }

  @Post('/models')
  async createModel(@Body() body: unknown) {
    const dto = parseOrThrow(modelCreateSchema, body);
    return this.adminService.adminCreateModel(dto);
  }

  @Put('/models/:id')
  async updateModel(@Param('id') id: string, @Body() body: unknown) {
    const dto = parseOrThrow(modelUpdateSchema, body);
    return this.adminService.adminUpdateModel(id, dto);
  }

  @Delete('/models/:id')
  async deleteModel(@Param('id') id: string) {
    return this.adminService.adminDeleteModel(id);
  }

  @Get('/preset-categories')
  async presetCategories() {
    return this.adminService.adminListPresetCategories();
  }

  @Post('/preset-categories')
  async createPresetCategory(@Body() body: unknown) {
    const dto = parseOrThrow(presetCategoryCreateSchema, body);
    return this.adminService.adminCreatePresetCategory(dto);
  }

  @Put('/preset-categories/:id')
  async updatePresetCategory(@Param('id') id: string, @Body() body: unknown) {
    const dto = parseOrThrow(presetCategoryUpdateSchema, body);
    return this.adminService.adminUpdatePresetCategory(id, dto);
  }

  @Delete('/preset-categories/:id')
  async deletePresetCategory(@Param('id') id: string) {
    return this.adminService.adminDeletePresetCategory(id);
  }

  @Get('/presets')
  async presets() {
    return this.adminService.adminListPresets();
  }

  @Post('/presets')
  async createPreset(@Body() body: unknown) {
    const dto = parseOrThrow(presetCreateSchema, body);
    return this.adminService.adminCreatePreset({
      slug: dto.slug,
      titleEn: dto.titleEn,
      titleRu: dto.titleRu,
      descriptionEn: dto.descriptionEn,
      descriptionRu: dto.descriptionRu,
      promptTemplate: dto.promptTemplate as Prisma.InputJsonValue,
      defaultParams: dto.defaultParams as Prisma.InputJsonValue,
      coverAssetKey: dto.coverAssetKey,
      sampleAssetKeys: dto.sampleAssetKeys as Prisma.InputJsonValue,
      modelId: dto.modelId,
      categoryId: dto.categoryId,
      isPublished: dto.isPublished
    });
  }

  @Put('/presets/:id')
  async updatePreset(@Param('id') id: string, @Body() body: unknown) {
    const dto = parseOrThrow(presetUpdateSchema, body);
    return this.adminService.adminUpdatePreset(id, {
      slug: dto.slug,
      titleEn: dto.titleEn,
      titleRu: dto.titleRu,
      descriptionEn: dto.descriptionEn,
      descriptionRu: dto.descriptionRu,
      promptTemplate: dto.promptTemplate as Prisma.InputJsonValue | undefined,
      defaultParams: dto.defaultParams as Prisma.InputJsonValue | undefined,
      coverAssetKey: dto.coverAssetKey,
      sampleAssetKeys: dto.sampleAssetKeys as Prisma.InputJsonValue | undefined,
      modelId: dto.modelId,
      categoryId: dto.categoryId,
      isPublished: dto.isPublished
    });
  }

  @Delete('/presets/:id')
  async deletePreset(@Param('id') id: string) {
    return this.adminService.adminDeletePreset(id);
  }

  @Get('/photoshoots')
  async photoshoots() {
    return this.adminService.adminListPhotoshoots();
  }

  @Post('/photoshoots')
  async createPhotoshoot(@Body() body: unknown) {
    const dto = parseOrThrow(photoshootCreateSchema, body);
    return this.adminService.adminCreatePhotoshoot({
      slug: dto.slug,
      titleEn: dto.titleEn,
      titleRu: dto.titleRu,
      descriptionEn: dto.descriptionEn,
      descriptionRu: dto.descriptionRu,
      coverAssetKey: dto.coverAssetKey,
      galleryAssetKeys: dto.galleryAssetKeys as Prisma.InputJsonValue,
      presetId: dto.presetId,
      modelId: dto.modelId,
      isPublished: dto.isPublished
    });
  }

  @Put('/photoshoots/:id')
  async updatePhotoshoot(@Param('id') id: string, @Body() body: unknown) {
    const dto = parseOrThrow(photoshootUpdateSchema, body);
    return this.adminService.adminUpdatePhotoshoot(id, {
      slug: dto.slug,
      titleEn: dto.titleEn,
      titleRu: dto.titleRu,
      descriptionEn: dto.descriptionEn,
      descriptionRu: dto.descriptionRu,
      coverAssetKey: dto.coverAssetKey,
      galleryAssetKeys: dto.galleryAssetKeys as Prisma.InputJsonValue | undefined,
      presetId: dto.presetId,
      modelId: dto.modelId,
      isPublished: dto.isPublished
    });
  }

  @Delete('/photoshoots/:id')
  async deletePhotoshoot(@Param('id') id: string) {
    return this.adminService.adminDeletePhotoshoot(id);
  }

  @Post('/media/presign-upload')
  async presignUpload(@Req() request: FastifyRequest, @Body() body: unknown) {
    const dto = parseOrThrow(mediaPresignSchema, body);
    return this.adminService.adminPresignMediaUpload(request, dto);
  }

  @Post('/media/complete')
  async completeUpload(@Req() request: FastifyRequest, @Body() body: unknown) {
    const dto = parseOrThrow(mediaCompleteSchema, body);
    return this.adminService.adminCompleteMediaUpload(request, dto);
  }
}

@Controller('/api')
export class CatalogController {
  constructor(@Inject(AdminService) private readonly adminService: AdminService) {}

  @Get('/presets')
  async listPresets(@Query('lang') lang?: string) {
    const resolvedLang = parseOrThrow(langSchema, lang ?? 'en');
    return this.adminService.listPublishedPresets(resolvedLang);
  }

  @Get('/photoshoots')
  async listPhotoshoots(@Query('lang') lang?: string) {
    const resolvedLang = parseOrThrow(langSchema, lang ?? 'en');
    return this.adminService.listPublishedPhotoshoots(resolvedLang);
  }
}
