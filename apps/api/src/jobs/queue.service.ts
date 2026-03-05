import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import type { ImageGenerationJobPayload } from '@picoria/shared';
import { IMAGE_GENERATION_QUEUE } from '@picoria/shared';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: null
  });
  private readonly queue: Queue<ImageGenerationJobPayload>;

  constructor() {
    this.queue = new Queue<ImageGenerationJobPayload>(IMAGE_GENERATION_QUEUE, {
      connection: this.redis as any
    });
  }

  async enqueueImageGeneration(payload: ImageGenerationJobPayload): Promise<void> {
    await this.queue.add(payload.jobId, payload, {
      removeOnComplete: 100,
      removeOnFail: 100,
      attempts: 2
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
    await this.redis.quit();
  }
}
