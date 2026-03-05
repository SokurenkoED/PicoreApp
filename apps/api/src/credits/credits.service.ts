import { Injectable } from '@nestjs/common';
import { prisma, type PrismaClient } from '@picoria/db';

type CreditsDb = Pick<PrismaClient, '$transaction' | 'creditsLedger'>;

@Injectable()
export class CreditsService {
  constructor(private readonly db: CreditsDb = prisma) {}

  async getBalance(userId: string): Promise<number> {
    const result = await this.db.creditsLedger.aggregate({
      where: { userId },
      _sum: { delta: true }
    });
    return result._sum.delta ?? 0;
  }

  async addPurchase(userId: string, credits: number, paymentId: string): Promise<void> {
    await this.addLedgerEntry(userId, credits, 'purchase', paymentId);
  }

  async spendForJob(userId: string, jobId: string, credits = 1): Promise<void> {
    await this.db.$transaction(async (tx: any) => {
      const aggregate = await tx.creditsLedger.aggregate({
        where: { userId },
        _sum: { delta: true }
      });
      const balance = aggregate._sum.delta ?? 0;
      if (balance < credits) {
        throw new Error('INSUFFICIENT_CREDITS');
      }

      await tx.creditsLedger.create({
        data: {
          userId,
          delta: -Math.abs(credits),
          reason: 'spend',
          refId: jobId
        }
      });
    });
  }

  async refundForJob(userId: string, jobId: string, credits = 1): Promise<void> {
    await this.addLedgerEntry(userId, Math.abs(credits), 'refund', jobId);
  }

  async addLedgerEntry(
    userId: string,
    delta: number,
    reason: 'purchase' | 'spend' | 'refund' | 'admin',
    refId?: string
  ): Promise<void> {
    try {
      await this.db.creditsLedger.create({
        data: {
          userId,
          delta,
          reason,
          refId
        }
      });
    } catch (error) {
      if ((error as { code?: string })?.code === 'P2002') {
        return;
      }
      throw error;
    }
  }
}
