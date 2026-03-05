import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Res
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { Locale } from '@picoria/shared';
import { parseOrThrow } from '../common/http-error';
import { AuthService } from './auth.service';
import { CreditsService } from '../credits/credits.service';
import { FreeLimitService } from '../limits/free-limit.service';

const localeSchema = z.enum(['en', 'ru']).default('en');

const telegramAuthDtoSchema = z.object({
  initData: z.string().min(1)
});

const registerDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  name: z.string().min(1).max(100).optional(),
  locale: localeSchema.optional()
});

const loginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  locale: localeSchema.optional()
});

const forgotPasswordDtoSchema = z.object({
  email: z.string().email()
});

const resetPasswordDtoSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(200)
});

const updateProfileDtoSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(100).nullable().optional(),
  locale: localeSchema.optional()
});

const changePasswordDtoSchema = z.object({
  currentPassword: z.string().min(1).max(200).optional(),
  newPassword: z.string().min(8).max(200)
});

const oauthStartQuerySchema = z.object({
  redirect: z.string().optional(),
  locale: localeSchema.optional()
});

const oauthCallbackQuerySchema = z.object({
  state: z.string().optional(),
  externalId: z.string().optional(),
  code: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  redirect: z.string().optional(),
  locale: localeSchema.optional()
});

const oauthProviderSchema = z.enum(['telegram', 'vk', 'yandex']);

@Controller('/api')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(CreditsService) private readonly creditsService: CreditsService,
    @Inject(FreeLimitService) private readonly freeLimitService: FreeLimitService
  ) {}

  @Post('/ru/auth/telegram')
  async authTelegram(
    @Req() request: FastifyRequest,
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    const dto = parseOrThrow(telegramAuthDtoSchema, body);
    const user = await this.authService.authTelegram(dto.initData, request, reply);
    const balance = await this.creditsService.getBalance(user.id);
    return {
      userId: user.id,
      type: user.type,
      role: user.role,
      locale: user.locale,
      email: user.email,
      name: user.name,
      balance
    };
  }

  @Post('/auth/register')
  async register(
    @Req() request: FastifyRequest,
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    const dto = parseOrThrow(registerDtoSchema, body);
    const user = await this.authService.registerEmail(request, reply, dto);
    const balance = await this.creditsService.getBalance(user.id);
    return {
      id: user.id,
      type: user.type,
      role: user.role,
      locale: user.locale,
      email: user.email,
      name: user.name,
      balance
    };
  }

  @Post('/auth/login')
  async login(
    @Req() request: FastifyRequest,
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    const dto = parseOrThrow(loginDtoSchema, body);
    const user = await this.authService.loginEmail(request, reply, dto);
    const balance = await this.creditsService.getBalance(user.id);
    return {
      id: user.id,
      type: user.type,
      role: user.role,
      locale: user.locale,
      email: user.email,
      name: user.name,
      balance
    };
  }

  @Post('/auth/logout')
  async logout(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    await this.authService.logout(request, reply);
    return { ok: true };
  }

  @Post('/auth/password/forgot')
  async forgotPassword(@Body() body: unknown) {
    const dto = parseOrThrow(forgotPasswordDtoSchema, body);
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('/auth/password/reset')
  async resetPassword(
    @Req() request: FastifyRequest,
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    const dto = parseOrThrow(resetPasswordDtoSchema, body);
    const user = await this.authService.confirmPasswordReset(request, reply, dto);
    const balance = await this.creditsService.getBalance(user.id);
    return {
      id: user.id,
      type: user.type,
      role: user.role,
      locale: user.locale,
      email: user.email,
      name: user.name,
      balance
    };
  }

  @Post('/auth/profile')
  async updateProfile(@Req() request: FastifyRequest, @Body() body: unknown) {
    const dto = parseOrThrow(updateProfileDtoSchema, body);
    const user = await this.authService.updateProfile(request, dto);
    const balance = await this.creditsService.getBalance(user.id);
    return {
      id: user.id,
      type: user.type,
      role: user.role,
      locale: user.locale,
      email: user.email,
      name: user.name,
      balance
    };
  }

  @Post('/auth/password/change')
  async changePassword(@Req() request: FastifyRequest, @Body() body: unknown) {
    const dto = parseOrThrow(changePasswordDtoSchema, body);
    const user = await this.authService.changePassword(request, dto);
    const balance = await this.creditsService.getBalance(user.id);
    return {
      id: user.id,
      type: user.type,
      role: user.role,
      locale: user.locale,
      email: user.email,
      name: user.name,
      balance
    };
  }

  @Get('/auth/oauth/:provider/start')
  async oauthStart(
    @Param('provider') providerParam: string,
    @Query() query: Record<string, string | undefined>,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    const provider = parseOrThrow(oauthProviderSchema, providerParam);
    const input = parseOrThrow(oauthStartQuerySchema, query);
    return this.authService.beginOauth(provider, reply, {
      redirectPath: input.redirect,
      locale: input.locale as Locale | undefined
    });
  }

  @Get('/auth/oauth/:provider/callback')
  async oauthCallback(
    @Param('provider') providerParam: string,
    @Query() query: Record<string, string | undefined>,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    const provider = parseOrThrow(oauthProviderSchema, providerParam);
    const input = parseOrThrow(oauthCallbackQuerySchema, query);

    const result = await this.authService.finishOauth(provider, request, reply, {
      state: input.state,
      externalId: input.externalId,
      code: input.code,
      email: input.email,
      name: input.name,
      redirectPath: input.redirect,
      locale: input.locale as Locale | undefined
    });

    reply.redirect(result.redirectTo);
    return { ok: true };
  }

  @Get('/me')
  async me(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const user = await this.authService.ensureUser(request, reply, 'en');
    const balance = user.type === 'guest' ? null : await this.creditsService.getBalance(user.id);

    const remainingFreeAttempts =
      user.type === 'guest'
        ? await this.freeLimitService.getRemaining(
            request.anonId ?? request.cookies.pc_anon ?? 'none',
            request.ip
          )
        : null;

    return {
      id: user.id,
      type: user.type,
      role: user.role,
      locale: user.locale,
      email: user.email,
      name: user.name,
      balance,
      remainingFreeAttempts
    };
  }
}
