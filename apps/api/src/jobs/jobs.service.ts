import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ServiceUnavailableException,
  Inject
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '@picoria/db';
import { createJobDtoSchema, type JobStatus, StorageService } from '@picoria/shared';
import { parseOrThrow } from '../common/http-error';
import { AuthService } from '../auth/auth.service';
import { CreditsService } from '../credits/credits.service';
import { FreeLimitService } from '../limits/free-limit.service';
import { QueueService } from './queue.service';

@Injectable()
export class JobsService {
  private readonly outputUrlTtl = Number.parseInt(process.env.OUTPUT_URL_TTL_SECONDS ?? '600', 10);
  private readonly providerKey = process.env.IMAGE_PROVIDER ?? 'mock';
  private readonly generationCreditsCost = Number.parseInt(process.env.GENERATION_CREDITS_COST ?? '1', 10);
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
    @Inject(CreditsService) private readonly creditsService: CreditsService,
    @Inject(FreeLimitService) private readonly freeLimitService: FreeLimitService,
    @Inject(QueueService) private readonly queueService: QueueService
  ) {}

  async createJob(request: FastifyRequest, reply: FastifyReply, body: unknown) {
    const dto = parseOrThrow(createJobDtoSchema, body);
    const locale = request.url.startsWith('/api/ru') ? 'ru' : 'en';
    const user = await this.authService.ensureUser(request, reply, locale === 'ru' ? 'ru' : 'en');

    const style = await prisma.style.findUnique({ where: { slug: dto.styleSlug } });
    if (!style || !style.isPublished) {
      throw new NotFoundException('Style not found');
    }

    const inputs = await prisma.asset.findMany({
      where: {
        id: { in: dto.inputAssetIds },
        userId: user.id,
        kind: 'input'
      }
    });
    if (inputs.length !== dto.inputAssetIds.length) {
      throw new BadRequestException('Some input assets are invalid');
    }

    const job = await prisma.job.create({
      data: {
        userId: user.id,
        styleId: style.id,
        status: 'queued',
        providerKey: this.providerKey,
        params: {
          styleSlug: dto.styleSlug,
          inputAssetIds: dto.inputAssetIds,
          clientRequestId: dto.clientRequestId ?? null,
          presetSlug: dto.presetSlug ?? null,
          presetInputs: dto.presetInputs ?? null
        },
        progress: 0
      }
    });

    if (user.type !== 'guest') {
      try {
        await this.creditsService.spendForJob(user.id, job.id, Math.max(1, this.generationCreditsCost));
      } catch {
        await prisma.job.update({
          where: { id: job.id },
          data: { status: 'failed', errorCode: 'INSUFFICIENT_CREDITS', errorMessage: 'No credits' }
        });
        throw new ServiceUnavailableException('Insufficient credits');
      }
    } else {
      const anonId = request.anonId ?? request.cookies.pc_anon;
      if (!anonId) {
        throw new UnauthorizedException('Anon cookie missing');
      }
      await this.freeLimitService.consumeAttempt(anonId, request.ip);
    }

    await this.queueService.enqueueImageGeneration({ jobId: job.id });
    return { jobId: job.id };
  }

  async listMyJobs(request: FastifyRequest) {
    const user = await this.authService.requireRegisteredUser(request);
    const locale = user.locale === 'ru' ? 'ru' : 'en';

    const jobs = await prisma.job.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        style: {
          select: {
            slug: true,
            titleEn: true,
            titleRu: true
          }
        },
        assets: {
          where: { kind: 'output' },
          orderBy: { createdAt: 'asc' },
          take: 8
        }
      }
    });

    return Promise.all(
      jobs.map(async (job) => ({
        id: job.id,
        status: job.status as JobStatus,
        progress: job.progress,
        styleSlug: job.style.slug,
        styleTitle: locale === 'ru' ? job.style.titleRu : job.style.titleEn,
        createdAt: job.createdAt.toISOString(),
        startedAt: job.startedAt?.toISOString() ?? null,
        finishedAt: job.finishedAt?.toISOString() ?? null,
        errorCode: job.errorCode,
        errorMessage: job.errorMessage,
        outputs: await Promise.all(
          job.assets.map(async (asset) => ({
            assetId: asset.id,
            url: await this.storage.presignGet(asset.storageKey, this.outputUrlTtl)
          }))
        )
      }))
    );
  }

  async getJobStatus(request: FastifyRequest, reply: FastifyReply, jobId: string) {
    const user = await this.authService.ensureUser(request, reply, 'en');
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        assets: {
          where: { kind: 'output' },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!job || job.userId !== user.id) {
      throw new NotFoundException('Job not found');
    }

    const outputs = await Promise.all(
      job.assets.map(async (asset) => ({
        assetId: asset.id,
        url: await this.storage.presignGet(asset.storageKey, this.outputUrlTtl)
      }))
    );

    return {
      status: job.status as JobStatus,
      progress: job.progress,
      outputs
    };
  }
}
