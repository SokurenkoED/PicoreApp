import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import sharp from 'sharp';
import { Prisma, prisma } from '@picoria/db';
import { IMAGE_GENERATION_QUEUE, StorageService } from '@picoria/shared';
import { createImageProvider } from './providers/provider.factory';

const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

const storage = new StorageService({
  endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
  region: process.env.S3_REGION ?? 'us-east-1',
  bucket: process.env.S3_BUCKET ?? 'picoria',
  accessKeyId: process.env.S3_ACCESS_KEY ?? 'minioadmin',
  secretAccessKey: process.env.S3_SECRET_KEY ?? 'minioadmin',
  forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true') === 'true'
});

const provider = createImageProvider();
const outputCount = Number.parseInt(process.env.MOCK_OUTPUT_COUNT ?? '6', 10);
const maxBytes = Number.parseInt(process.env.MAX_UPLOAD_BYTES ?? '15728640', 10);
const generationCreditsCost = Number.parseInt(process.env.GENERATION_CREDITS_COST ?? '1', 10);

function getJobInputAssetIds(params: Prisma.JsonValue): string[] {
  if (!params || typeof params !== 'object' || !('inputAssetIds' in params)) {
    return [];
  }
  const value = (params as { inputAssetIds?: unknown }).inputAssetIds;
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((v): v is string => typeof v === 'string');
}

async function loadInputUrls(userId: string, inputAssetIds: string[]): Promise<Array<{ assetId: string; url: string; mime?: string }>> {
  const assets = await prisma.asset.findMany({
    where: {
      id: { in: inputAssetIds },
      userId,
      kind: 'input'
    }
  });

  return Promise.all(
    assets.map(async (asset) => ({
      assetId: asset.id,
      url: await storage.presignGet(asset.storageKey, 1800),
      mime: asset.mime
    }))
  );
}

async function toImageBuffer(image: { data: string; mime?: string } | { url: string; mime?: string }): Promise<{ buffer: Buffer; mime: string }> {
  if ('data' in image) {
    const buffer = Buffer.from(image.data, 'base64');
    return { buffer, mime: image.mime ?? 'image/jpeg' };
  }

  const response = await fetch(image.url);
  if (!response.ok) {
    throw new Error(`Failed to download generated image from URL ${image.url}`);
  }

  const contentType = response.headers.get('content-type') ?? image.mime ?? 'application/octet-stream';
  if (!contentType.startsWith('image/')) {
    throw new Error(`Invalid generated image MIME type ${contentType}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.byteLength > maxBytes) {
    throw new Error('Generated image exceeds MAX_UPLOAD_BYTES');
  }

  return { buffer, mime: contentType };
}

async function saveOutputAndPreview(args: {
  userId: string;
  jobId: string;
  index: number;
  buffer: Buffer;
  mime: string;
}): Promise<void> {
  const image = sharp(args.buffer).rotate();
  const metadata = await image.metadata();
  const outputId = randomUUID();
  const outputKey = `users/${args.userId}/jobs/${args.jobId}/outputs/${outputId}.jpg`;

  const normalizedOutput = await image.jpeg({ quality: 92 }).toBuffer();
  await storage.putObject(outputKey, normalizedOutput, 'image/jpeg');

  await prisma.asset.create({
    data: {
      id: outputId,
      userId: args.userId,
      jobId: args.jobId,
      kind: 'output',
      storageKey: outputKey,
      mime: 'image/jpeg',
      sizeBytes: normalizedOutput.byteLength,
      width: metadata.width ?? null,
      height: metadata.height ?? null
    }
  });

  const previewId = randomUUID();
  const previewKey = `users/${args.userId}/jobs/${args.jobId}/previews/${previewId}.jpg`;
  const previewBuffer = await sharp(normalizedOutput)
    .resize({ width: 768, withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();

  const previewMetadata = await sharp(previewBuffer).metadata();

  await storage.putObject(previewKey, previewBuffer, 'image/jpeg');
  await prisma.asset.create({
    data: {
      id: previewId,
      userId: args.userId,
      jobId: args.jobId,
      kind: 'preview',
      storageKey: previewKey,
      mime: 'image/jpeg',
      sizeBytes: previewBuffer.byteLength,
      width: previewMetadata.width ?? null,
      height: previewMetadata.height ?? null
    }
  });

  await prisma.job.update({
    where: { id: args.jobId },
    data: {
      progress: Math.min(95, 25 + args.index * 10)
    }
  });
}

async function failJobAndRefund(jobId: string, error: unknown): Promise<void> {
  const existing = await prisma.job.findUnique({
    where: { id: jobId },
    include: { user: true }
  });
  if (!existing) {
    return;
  }

  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: 'failed',
      errorCode: 'GENERATION_FAILED',
      errorMessage: error instanceof Error ? error.message.slice(0, 1000) : String(error).slice(0, 1000),
      finishedAt: new Date()
    }
  });

  if (existing.user.type !== 'guest') {
    try {
      await prisma.creditsLedger.create({
        data: {
          userId: existing.userId,
          delta: Math.max(1, generationCreditsCost),
          reason: 'refund',
          refId: existing.id
        }
      });
    } catch {
      // idempotent by unique(userId, reason, refId)
    }
  }
}

const worker = new Worker(
  IMAGE_GENERATION_QUEUE,
  async (queueJob) => {
    const jobId = String(queueJob.data.jobId);
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { style: true, user: true }
    });

    if (!job) {
      return;
    }

    try {
      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'processing', startedAt: new Date(), progress: 10 }
      });

      const inputAssetIds = getJobInputAssetIds(job.params);
      const inputs = await loadInputUrls(job.userId, inputAssetIds);

      const providerResult = await provider.generate({
        jobId: job.id,
        styleSlug: job.style.slug,
        promptTemplate: JSON.stringify(job.style.promptTemplate),
        params: (job.params ?? {}) as Record<string, unknown>,
        inputs,
        outputCount
      });

      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'uploading_results', progress: 55 }
      });

      const images =
        providerResult.mode === 'base64'
          ? providerResult.images
          : providerResult.images;

      let index = 0;
      for (const image of images) {
        index += 1;
        const { buffer, mime } = await toImageBuffer(image as any);
        await saveOutputAndPreview({
          userId: job.userId,
          jobId: job.id,
          index,
          buffer,
          mime
        });
      }

      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'done',
          progress: 100,
          finishedAt: new Date(),
          errorCode: null,
          errorMessage: null
        }
      });
    } catch (error) {
      await failJobAndRefund(jobId, error);
      throw error;
    }
  },
  {
    connection: redis as any,
    concurrency: 2
  }
);

worker.on('ready', () => {
  console.log(`Worker ready for queue ${IMAGE_GENERATION_QUEUE} using provider ${provider.key}`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id ?? 'unknown'} failed`, err);
});

const healthPort = Number.parseInt(process.env.WORKER_PORT ?? '3002', 10);
const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'worker' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(healthPort, '0.0.0.0', () => {
  console.log(`Worker health endpoint listening on ${healthPort}`);
});

const shutdown = async () => {
  await worker.close();
  await redis.quit();
  await prisma.$disconnect();
  server.close();
};

process.on('SIGINT', () => {
  shutdown().finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
  shutdown().finally(() => process.exit(0));
});
