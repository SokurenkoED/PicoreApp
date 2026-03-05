import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@picoria/db';
import { StorageService } from '@picoria/shared';
import { AuthService } from '../auth/auth.service';
import { CreditsService } from '../credits/credits.service';

@Injectable()
export class AdminService {
  private readonly maxUploadBytes = Number.parseInt(process.env.MAX_UPLOAD_BYTES ?? '15728640', 10);
  private readonly presignTtl = Number.parseInt(process.env.PRESIGN_TTL_SECONDS ?? '600', 10);
  private readonly outputUrlTtl = Number.parseInt(process.env.OUTPUT_URL_TTL_SECONDS ?? '600', 10);
  private readonly storage = new StorageService({
    endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
    region: process.env.S3_REGION ?? 'us-east-1',
    bucket: process.env.S3_BUCKET ?? 'picoria',
    accessKeyId: process.env.S3_ACCESS_KEY ?? 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY ?? 'minioadmin',
    forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true') === 'true',
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL || undefined
  });

  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(CreditsService) private readonly creditsService: CreditsService
  ) {}

  private asStringArray(input: unknown): string[] {
    if (!Array.isArray(input)) {
      return [];
    }
    return input.filter((item): item is string => typeof item === 'string' && item.length > 0);
  }

  private async presignObjectKey(objectKey?: string | null): Promise<string | null> {
    if (!objectKey) {
      return null;
    }
    return this.storage.presignGet(objectKey, this.outputUrlTtl);
  }

  private async presignObjectKeys(keys: unknown): Promise<string[]> {
    const list = this.asStringArray(keys);
    return Promise.all(list.map((key) => this.storage.presignGet(key, this.outputUrlTtl)));
  }

  private assertUuid(value: string | null | undefined, fieldName: string): string | null {
    if (!value) {
      return null;
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(value)) {
      throw new BadRequestException(`${fieldName} must be a valid UUID`);
    }

    return value;
  }

  async getDashboard() {
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24);

    const [
      usersTotal,
      adminsTotal,
      jobsTotal,
      jobsLast24h,
      presetsTotal,
      photoshootsTotal,
      modelsTotal,
      issued,
      spent
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.job.count(),
      prisma.job.count({ where: { createdAt: { gte: since } } }),
      prisma.preset.count(),
      prisma.photoshoot.count(),
      prisma.generationModel.count(),
      prisma.creditsLedger.aggregate({ where: { delta: { gt: 0 } }, _sum: { delta: true } }),
      prisma.creditsLedger.aggregate({ where: { delta: { lt: 0 } }, _sum: { delta: true } })
    ]);

    return {
      usersTotal,
      adminsTotal,
      jobsTotal,
      jobsLast24h,
      presetsTotal,
      photoshootsTotal,
      modelsTotal,
      creditsIssued: issued._sum.delta ?? 0,
      creditsSpent: Math.abs(spent._sum.delta ?? 0)
    };
  }

  async listUsers() {
    const [users, balances] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
        select: {
          id: true,
          email: true,
          name: true,
          type: true,
          role: true,
          locale: true,
          isBlocked: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.creditsLedger.groupBy({
        by: ['userId'],
        _sum: { delta: true }
      })
    ]);

    const balanceByUserId = new Map(balances.map((item) => [item.userId, item._sum.delta ?? 0]));

    return users.map((user) => ({
      ...user,
      balance: balanceByUserId.get(user.id) ?? 0
    }));
  }

  async updateUserRole(request: FastifyRequest, userId: string, role: 'user' | 'admin') {
    const admin = await this.authService.requireAdminUser(request);

    if (admin.id === userId && role !== 'admin') {
      throw new UnauthorizedException('You cannot remove your own admin role');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { role }
    });
  }

  async updateUser(
    request: FastifyRequest,
    userId: string,
    input: Partial<{
      role: 'user' | 'admin';
      isBlocked: boolean;
      locale: 'en' | 'ru';
      email: string | null;
      name: string | null;
    }>
  ) {
    const admin = await this.authService.requireAdminUser(request);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (admin.id === userId) {
      if (input.role === 'user') {
        throw new UnauthorizedException('You cannot remove your own admin role');
      }
      if (input.isBlocked === true) {
        throw new UnauthorizedException('You cannot block your own account');
      }
    }

    const data: Prisma.UserUpdateInput = {};

    if (input.role) {
      data.role = input.role;
    }

    if (typeof input.isBlocked === 'boolean') {
      data.isBlocked = input.isBlocked;
    }

    if (input.locale) {
      data.locale = input.locale;
    }

    if (input.email !== undefined) {
      const nextEmail = input.email?.trim().toLowerCase();
      data.email = nextEmail || null;
    }

    if (input.name !== undefined) {
      const nextName = input.name?.trim();
      data.name = nextName || null;
    }

    try {
      return await prisma.user.update({
        where: { id: userId },
        data
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async adjustUserCredits(
    request: FastifyRequest,
    userId: string,
    input: { delta: number; refId?: string }
  ) {
    await this.authService.requireAdminUser(request);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!Number.isFinite(input.delta) || input.delta === 0) {
      throw new BadRequestException('delta must be non-zero');
    }

    const delta = Math.trunc(input.delta);
    const refId = input.refId?.trim() || `admin_manual_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await this.creditsService.addLedgerEntry(userId, delta, 'admin', refId);

    const balance = await this.creditsService.getBalance(userId);
    return { ok: true, balance };
  }

  async deleteUser(request: FastifyRequest, userId: string) {
    const admin = await this.authService.requireAdminUser(request);
    if (admin.id === userId) {
      throw new UnauthorizedException('You cannot delete your own account');
    }

    await prisma.user.delete({ where: { id: userId } });
    return { ok: true };
  }

  async adminListModels() {
    return prisma.generationModel.findMany({
      orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }]
    });
  }

  async adminCreateModel(input: {
    key: string;
    title: string;
    description?: string;
    providerKey: string;
    isActive: boolean;
  }) {
    return prisma.generationModel.create({
      data: {
        key: input.key,
        title: input.title,
        description: input.description,
        providerKey: input.providerKey,
        isActive: input.isActive
      }
    });
  }

  async adminUpdateModel(
    id: string,
    input: Partial<{
      key: string;
      title: string;
      description: string;
      providerKey: string;
      isActive: boolean;
    }>
  ) {
    return prisma.generationModel.update({
      where: { id },
      data: input
    });
  }

  async adminDeleteModel(id: string) {
    return prisma.generationModel.delete({ where: { id } });
  }

  async adminListPresetCategories() {
    return prisma.presetCategory.findMany({
      include: {
        _count: {
          select: {
            presets: true
          }
        }
      },
      orderBy: [{ name: 'asc' }, { createdAt: 'desc' }]
    });
  }

  async adminCreatePresetCategory(input: { slug: string; name: string }) {
    return prisma.presetCategory.create({
      data: {
        slug: input.slug,
        name: input.name
      }
    });
  }

  async adminUpdatePresetCategory(
    id: string,
    input: Partial<{
      slug: string;
      name: string;
    }>
  ) {
    const data: Prisma.PresetCategoryUpdateInput = {};

    if (typeof input.slug === 'string') {
      data.slug = input.slug;
    }

    if (typeof input.name === 'string') {
      data.name = input.name;
    }

    return prisma.presetCategory.update({
      where: { id },
      data
    });
  }

  async adminDeletePresetCategory(id: string) {
    return prisma.presetCategory.delete({ where: { id } });
  }

  async adminListPresets() {
    const items = await prisma.preset.findMany({
      include: {
        model: {
          select: {
            id: true,
            key: true,
            title: true
          }
        },
        category: {
          select: {
            id: true,
            slug: true,
            name: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return Promise.all(
      items.map(async (item) => ({
        ...item,
        sampleImages: await this.presignObjectKeys(item.sampleAssetKeys),
        coverImage: await this.presignObjectKey(item.coverAssetKey)
      }))
    );
  }

  async adminCreatePreset(input: {
    slug: string;
    titleEn: string;
    titleRu: string;
    descriptionEn: string;
    descriptionRu: string;
    promptTemplate: Prisma.InputJsonValue;
    defaultParams: Prisma.InputJsonValue;
    coverAssetKey?: string | null;
    sampleAssetKeys: Prisma.InputJsonValue;
    modelId?: string | null;
    categoryId?: string | null;
    isPublished: boolean;
  }) {
    return prisma.preset.create({
      data: {
        slug: input.slug,
        titleEn: input.titleEn,
        titleRu: input.titleRu,
        descriptionEn: input.descriptionEn,
        descriptionRu: input.descriptionRu,
        promptTemplate: input.promptTemplate,
        defaultParams: input.defaultParams,
        coverAssetKey: input.coverAssetKey ?? null,
        sampleAssetKeys: input.sampleAssetKeys,
        modelId: this.assertUuid(input.modelId, 'modelId'),
        categoryId: this.assertUuid(input.categoryId, 'categoryId'),
        isPublished: input.isPublished
      } as Prisma.PresetUncheckedCreateInput
    });
  }

  async adminUpdatePreset(
    id: string,
    input: Partial<{
      slug: string;
      titleEn: string;
      titleRu: string;
      descriptionEn: string;
      descriptionRu: string;
      promptTemplate: Prisma.InputJsonValue;
      defaultParams: Prisma.InputJsonValue;
      coverAssetKey: string | null;
      sampleAssetKeys: Prisma.InputJsonValue;
      modelId: string | null;
      categoryId: string | null;
      isPublished: boolean;
    }>
  ) {
    const data: Record<string, unknown> = {};

    if (typeof input.slug === 'string') {
      data.slug = input.slug;
    }
    if (typeof input.titleEn === 'string') {
      data.titleEn = input.titleEn;
    }
    if (typeof input.titleRu === 'string') {
      data.titleRu = input.titleRu;
    }
    if (typeof input.descriptionEn === 'string') {
      data.descriptionEn = input.descriptionEn;
    }
    if (typeof input.descriptionRu === 'string') {
      data.descriptionRu = input.descriptionRu;
    }
    if (input.promptTemplate !== undefined) {
      data.promptTemplate = input.promptTemplate;
    }
    if (input.defaultParams !== undefined) {
      data.defaultParams = input.defaultParams;
    }
    if (input.coverAssetKey !== undefined) {
      data.coverAssetKey = input.coverAssetKey;
    }
    if (input.sampleAssetKeys !== undefined) {
      data.sampleAssetKeys = input.sampleAssetKeys;
    }
    if (input.modelId !== undefined) {
      data.modelId = this.assertUuid(input.modelId, 'modelId');
    }
    if (input.categoryId !== undefined) {
      data.categoryId = this.assertUuid(input.categoryId, 'categoryId');
    }
    if (typeof input.isPublished === 'boolean') {
      data.isPublished = input.isPublished;
    }

    return prisma.preset.update({
      where: { id },
      data: data as Prisma.PresetUncheckedUpdateInput
    });
  }

  async adminDeletePreset(id: string) {
    return prisma.preset.delete({ where: { id } });
  }

  async adminListPhotoshoots() {
    const items = await prisma.photoshoot.findMany({
      include: {
        model: {
          select: {
            id: true,
            key: true,
            title: true
          }
        },
        preset: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleRu: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return Promise.all(
      items.map(async (item) => ({
        ...item,
        galleryImages: await this.presignObjectKeys(item.galleryAssetKeys),
        coverImage: await this.presignObjectKey(item.coverAssetKey)
      }))
    );
  }

  async adminCreatePhotoshoot(input: {
    slug: string;
    titleEn: string;
    titleRu: string;
    descriptionEn: string;
    descriptionRu: string;
    coverAssetKey?: string | null;
    galleryAssetKeys: Prisma.InputJsonValue;
    presetId?: string | null;
    modelId?: string | null;
    isPublished: boolean;
  }) {
    return prisma.photoshoot.create({
      data: {
        slug: input.slug,
        titleEn: input.titleEn,
        titleRu: input.titleRu,
        descriptionEn: input.descriptionEn,
        descriptionRu: input.descriptionRu,
        coverAssetKey: input.coverAssetKey ?? null,
        galleryAssetKeys: input.galleryAssetKeys,
        presetId: this.assertUuid(input.presetId, 'presetId'),
        modelId: this.assertUuid(input.modelId, 'modelId'),
        isPublished: input.isPublished
      } as Prisma.PhotoshootUncheckedCreateInput
    });
  }

  async adminUpdatePhotoshoot(
    id: string,
    input: Partial<{
      slug: string;
      titleEn: string;
      titleRu: string;
      descriptionEn: string;
      descriptionRu: string;
      coverAssetKey: string | null;
      galleryAssetKeys: Prisma.InputJsonValue;
      presetId: string | null;
      modelId: string | null;
      isPublished: boolean;
    }>
  ) {
    const data: Record<string, unknown> = {};

    if (typeof input.slug === 'string') {
      data.slug = input.slug;
    }
    if (typeof input.titleEn === 'string') {
      data.titleEn = input.titleEn;
    }
    if (typeof input.titleRu === 'string') {
      data.titleRu = input.titleRu;
    }
    if (typeof input.descriptionEn === 'string') {
      data.descriptionEn = input.descriptionEn;
    }
    if (typeof input.descriptionRu === 'string') {
      data.descriptionRu = input.descriptionRu;
    }
    if (input.coverAssetKey !== undefined) {
      data.coverAssetKey = input.coverAssetKey;
    }
    if (input.galleryAssetKeys !== undefined) {
      data.galleryAssetKeys = input.galleryAssetKeys;
    }
    if (input.presetId !== undefined) {
      data.presetId = this.assertUuid(input.presetId, 'presetId');
    }
    if (input.modelId !== undefined) {
      data.modelId = this.assertUuid(input.modelId, 'modelId');
    }
    if (typeof input.isPublished === 'boolean') {
      data.isPublished = input.isPublished;
    }

    return prisma.photoshoot.update({
      where: { id },
      data: data as Prisma.PhotoshootUncheckedUpdateInput
    });
  }

  async adminDeletePhotoshoot(id: string) {
    return prisma.photoshoot.delete({ where: { id } });
  }

  async adminPresignMediaUpload(
    request: FastifyRequest,
    input: { mime: string; sizeBytes: number }
  ) {
    const user = await this.authService.requireAdminUser(request);

    if (input.sizeBytes <= 0 || input.sizeBytes > this.maxUploadBytes) {
      throw new BadRequestException('File too large');
    }

    const assetId = randomUUID();
    const objectKey = `admin/${user.id}/media/${assetId}`;
    const uploadUrl = await this.storage.presignPut(objectKey, this.presignTtl, input.mime);

    await prisma.asset.create({
      data: {
        id: assetId,
        userId: user.id,
        kind: 'preview',
        storageKey: objectKey,
        mime: input.mime,
        sizeBytes: input.sizeBytes
      }
    });

    return {
      assetId,
      uploadUrl,
      storageKey: objectKey
    };
  }

  async adminCompleteMediaUpload(
    request: FastifyRequest,
    input: { assetId: string; width: number; height: number }
  ) {
    const user = await this.authService.requireAdminUser(request);
    const asset = await prisma.asset.findUnique({ where: { id: input.assetId } });
    if (!asset || asset.userId !== user.id) {
      throw new NotFoundException('Asset not found');
    }

    await prisma.asset.update({
      where: { id: input.assetId },
      data: {
        width: input.width,
        height: input.height
      }
    });

    return {
      ok: true,
      storageKey: asset.storageKey,
      previewUrl: await this.storage.presignGet(asset.storageKey, this.outputUrlTtl)
    };
  }

  async listPublishedPresets(lang: 'en' | 'ru') {
    const items = await prisma.preset.findMany({
      where: { isPublished: true },
      include: {
        model: {
          select: {
            key: true,
            title: true
          }
        },
        category: {
          select: {
            slug: true,
            name: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return Promise.all(
      items.map(async (item) => ({
        id: item.id,
        slug: item.slug,
        title: lang === 'ru' ? item.titleRu : item.titleEn,
        description: lang === 'ru' ? item.descriptionRu : item.descriptionEn,
        modelKey: item.model?.key ?? null,
        modelTitle: item.model?.title ?? null,
        categorySlug: item.category?.slug ?? null,
        categoryName: item.category?.name ?? null,
        coverImage: await this.presignObjectKey(item.coverAssetKey),
        sampleImages: await this.presignObjectKeys(item.sampleAssetKeys)
      }))
    );
  }

  async getPublishedPresetBySlug(lang: 'en' | 'ru', slug: string) {
    const item = await prisma.preset.findFirst({
      where: {
        slug,
        isPublished: true
      },
      include: {
        model: {
          select: {
            key: true,
            title: true
          }
        },
        category: {
          select: {
            slug: true,
            name: true
          }
        }
      }
    });

    if (!item) {
      return null;
    }

    return {
      id: item.id,
      slug: item.slug,
      title: lang === 'ru' ? item.titleRu : item.titleEn,
      description: lang === 'ru' ? item.descriptionRu : item.descriptionEn,
      modelKey: item.model?.key ?? null,
      modelTitle: item.model?.title ?? null,
      categorySlug: item.category?.slug ?? null,
      categoryName: item.category?.name ?? null,
      promptTemplate: item.promptTemplate,
      defaultParams: item.defaultParams,
      coverImage: await this.presignObjectKey(item.coverAssetKey),
      sampleImages: await this.presignObjectKeys(item.sampleAssetKeys)
    };
  }

  async listPublishedPhotoshoots(lang: 'en' | 'ru') {
    const items = await prisma.photoshoot.findMany({
      where: { isPublished: true },
      include: {
        model: {
          select: {
            key: true,
            title: true
          }
        },
        preset: {
          select: {
            slug: true,
            titleEn: true,
            titleRu: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return Promise.all(
      items.map(async (item) => ({
        id: item.id,
        slug: item.slug,
        title: lang === 'ru' ? item.titleRu : item.titleEn,
        description: lang === 'ru' ? item.descriptionRu : item.descriptionEn,
        modelKey: item.model?.key ?? null,
        modelTitle: item.model?.title ?? null,
        presetSlug: item.preset?.slug ?? null,
        presetTitle: item.preset
          ? lang === 'ru'
            ? item.preset.titleRu
            : item.preset.titleEn
          : null,
        coverImage: await this.presignObjectKey(item.coverAssetKey),
        galleryImages: await this.presignObjectKeys(item.galleryAssetKeys)
      }))
    );
  }
}
