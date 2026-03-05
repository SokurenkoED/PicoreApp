import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { prisma } from '@picoria/db';
import { createPaymentDtoSchema, createTBankToken, verifyTBankWebhookToken } from '@picoria/shared';
import { parseOrThrow } from '../common/http-error';
import { AuthService } from '../auth/auth.service';
import { CreditsService } from '../credits/credits.service';

function makeOrderId(): string {
  return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePaymentStatus(status: string): 'created' | 'pending' | 'paid' | 'failed' | 'canceled' {
  const upper = status.toUpperCase();
  if (upper === 'CONFIRMED') {
    return 'paid';
  }
  if (upper === 'AUTHORIZED' || upper === 'NEW' || upper === 'FORM_SHOWED') {
    return 'pending';
  }
  if (upper === 'REJECTED') {
    return 'failed';
  }
  if (upper === 'CANCELED') {
    return 'canceled';
  }
  return 'pending';
}

@Injectable()
export class PaymentsService {
  private readonly paymentProvider = process.env.PAYMENT_PROVIDER ?? 'mock';

  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(CreditsService) private readonly creditsService: CreditsService
  ) {}

  async listPackages() {
    return prisma.package.findMany({
      where: { isActive: true },
      orderBy: { sort: 'asc' }
    });
  }

  async createPayment(request: FastifyRequest, body: unknown) {
    const user = await this.authService.requireUser(request);
    if (user.type === 'guest') {
      throw new UnauthorizedException('Authentication required');
    }

    const dto = parseOrThrow(createPaymentDtoSchema, body);
    const pkg = await prisma.package.findUnique({ where: { id: dto.packageId } });
    if (!pkg || !pkg.isActive) {
      throw new BadRequestException('Package not found');
    }

    const orderId = makeOrderId();

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        packageId: pkg.id,
        provider: 'tbank',
        orderId,
        amountRub: pkg.priceRub,
        status: 'created',
        payload: {
          packageTitle: pkg.title,
          credits: pkg.credits
        }
      }
    });

    if (this.paymentProvider === 'mock') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: `mock_${orderId}`,
          status: 'paid',
          paidAt: new Date(),
          payload: {
            mock: true,
            packageTitle: pkg.title,
            credits: pkg.credits
          }
        }
      });
      await this.creditsService.addPurchase(user.id, pkg.credits, payment.id);

      return {
        orderId,
        paymentUrl: `${process.env.APP_BASE_URL ?? 'http://localhost:8080'}/ru/pay?paid=1&orderId=${orderId}`,
        mock: true
      };
    }

    const terminalKey = process.env.TBANK_TERMINAL_KEY;
    const password = process.env.TBANK_PASSWORD;
    if (!terminalKey || !password) {
      throw new InternalServerErrorException('TBANK credentials are missing');
    }

    const payload: Record<string, unknown> = {
      TerminalKey: terminalKey,
      Amount: pkg.priceRub * 100,
      OrderId: orderId,
      Description: `Picoria package ${pkg.title}`,
      NotificationURL: process.env.TBANK_NOTIFICATION_URL,
      SuccessURL: process.env.TBANK_SUCCESS_URL,
      FailURL: process.env.TBANK_FAIL_URL,
      Language: 'ru'
    };

    const token = createTBankToken(payload, password);
    const requestBody = {
      ...payload,
      Token: token
    };

    const response = await fetch(process.env.TBANK_INIT_URL ?? 'https://securepay.tinkoff.ru/v2/Init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new InternalServerErrorException('Failed to init payment');
    }

    const result = (await response.json()) as {
      Success?: boolean;
      PaymentId?: string | number;
      PaymentURL?: string;
      Status?: string;
      Message?: string;
    };

    if (!result.Success || !result.PaymentURL || !result.PaymentId) {
      throw new InternalServerErrorException(result.Message ?? 'Invalid Init response');
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: String(result.PaymentId),
        status: normalizePaymentStatus(result.Status ?? 'NEW'),
        payload: result
      }
    });

    return {
      orderId,
      paymentUrl: result.PaymentURL,
      mock: false
    };
  }

  async webhook(payload: Record<string, unknown>) {
    if (this.paymentProvider !== 'mock') {
      const password = process.env.TBANK_PASSWORD;
      if (!password || !verifyTBankWebhookToken(payload, password)) {
        throw new BadRequestException('INVALID_TOKEN');
      }
    }

    const orderId = String(payload.OrderId ?? '');
    if (!orderId) {
      throw new BadRequestException('OrderId is required');
    }

    const providerPaymentId = payload.PaymentId ? String(payload.PaymentId) : undefined;
    const status = normalizePaymentStatus(String(payload.Status ?? 'NEW'));

    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { orderId },
        include: { package: true }
      });
      if (!payment) {
        return;
      }

      if (payment.status === 'paid') {
        return;
      }

      const updates: Record<string, unknown> = {
        status,
        payload
      };
      if (providerPaymentId) {
        updates.providerPaymentId = providerPaymentId;
      }
      if (status === 'paid') {
        updates.paidAt = new Date();
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: updates
      });

      if (status === 'paid' && payment.package) {
        try {
          await tx.creditsLedger.create({
            data: {
              userId: payment.userId,
              delta: payment.package.credits,
              reason: 'purchase',
              refId: payment.id
            }
          });
        } catch {
          // idempotent by unique(userId, reason, refId)
        }
      }
    });

    return 'OK';
  }
}
