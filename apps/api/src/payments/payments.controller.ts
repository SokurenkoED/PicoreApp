import { Body, Controller, Get, Header, HttpCode, Inject, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { PaymentsService } from './payments.service';

@Controller('/api/ru')
export class PaymentsController {
  constructor(@Inject(PaymentsService) private readonly paymentsService: PaymentsService) {}

  @Get('/packages')
  async packages() {
    return this.paymentsService.listPackages();
  }

  @Post('/payments/create')
  async create(@Req() request: FastifyRequest, @Body() body: unknown) {
    return this.paymentsService.createPayment(request, body);
  }

  @Post('/payments/webhook')
  @HttpCode(200)
  @Header('Content-Type', 'text/plain; charset=utf-8')
  async webhook(@Body() body: Record<string, unknown>) {
    return this.paymentsService.webhook(body);
  }
}
