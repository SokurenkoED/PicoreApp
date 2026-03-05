import { HttpException, HttpStatus, Injectable, OnModuleDestroy } from '@nestjs/common';
import { createHash } from 'node:crypto';
import IORedis from 'ioredis';

@Injectable()
export class FreeLimitService implements OnModuleDestroy {
  private readonly limit = Number.parseInt(process.env.EN_FREE_DAILY_LIMIT ?? '3', 10);
  private readonly redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: null
  });

  private key(date: string, anonId: string, ip: string): string {
    const ipHash = createHash('sha256').update(ip, 'utf8').digest('hex').slice(0, 16);
    return `daily:${date}:${anonId}:${ipHash}`;
  }

  async consumeAttempt(anonId: string, ip: string): Promise<void> {
    const date = new Date().toISOString().slice(0, 10);
    const key = this.key(date, anonId, ip);

    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, 60 * 60 * 24 * 2);
    }

    if (count > this.limit) {
      throw new HttpException('Daily free limit reached', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  async getRemaining(anonId: string, ip: string): Promise<number> {
    const date = new Date().toISOString().slice(0, 10);
    const key = this.key(date, anonId, ip);
    const count = Number.parseInt((await this.redis.get(key)) ?? '0', 10);
    return Math.max(0, this.limit - count);
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
