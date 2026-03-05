import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { prisma } from '@picoria/db';
import {
  completeAssetDtoSchema,
  presignUploadDtoSchema,
  StorageService
} from '@picoria/shared';
import { parseOrThrow } from '../common/http-error';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AssetsService {
  private readonly maxUploadBytes = Number.parseInt(process.env.MAX_UPLOAD_BYTES ?? '15728640', 10);
  private readonly presignTtl = Number.parseInt(process.env.PRESIGN_TTL_SECONDS ?? '600', 10);
  private readonly storage = new StorageService({
    endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
    region: process.env.S3_REGION ?? 'us-east-1',
    bucket: process.env.S3_BUCKET ?? 'picoria',
    accessKeyId: process.env.S3_ACCESS_KEY ?? 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY ?? 'minioadmin',
    forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true') === 'true',
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL || undefined
  });

  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  async presignUpload(request: FastifyRequest, reply: FastifyReply, body: unknown) {
    const dto = parseOrThrow(presignUploadDtoSchema, body);
    if (dto.sizeBytes > this.maxUploadBytes) {
      throw new BadRequestException('File too large');
    }

    const user = await this.authService.ensureUser(request, reply, 'en');
    const assetId = randomUUID();
    const objectKey = `users/${user.id}/inputs/${assetId}`;
    const uploadUrl = await this.storage.presignPut(objectKey, this.presignTtl, dto.mime);

    await prisma.asset.create({
      data: {
        id: assetId,
        userId: user.id,
        kind: 'input',
        storageKey: objectKey,
        mime: dto.mime,
        sizeBytes: dto.sizeBytes
      }
    });

    return { assetId, uploadUrl, objectKey };
  }

  async completeUpload(request: FastifyRequest, body: unknown) {
    const user = await this.authService.requireUser(request);
    const dto = parseOrThrow(completeAssetDtoSchema, body);

    const asset = await prisma.asset.findUnique({ where: { id: dto.assetId } });
    if (!asset || asset.userId !== user.id) {
      throw new NotFoundException('Asset not found');
    }

    await prisma.asset.update({
      where: { id: dto.assetId },
      data: {
        width: dto.width,
        height: dto.height
      }
    });

    return { ok: true };
  }

  async getAssetUrl(request: FastifyRequest, assetId: string, ttl?: number) {
    const user = await this.authService.requireUser(request);
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || asset.userId !== user.id) {
      throw new NotFoundException('Asset not found');
    }

    const url = await this.storage.presignGet(asset.storageKey, ttl ?? this.presignTtl);
    return { assetId: asset.id, url };
  }
}
