import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual
} from 'node:crypto';
import { promisify } from 'node:util';
import { prisma, type User } from '@picoria/db';
import type { Locale, SessionClaims, UserRole, UserType } from '@picoria/shared';
import { validateTelegramInitData } from '@picoria/shared';
import { CreditsService } from '../credits/credits.service';

const scrypt = promisify(scryptCallback);

type OAuthProvider = 'telegram' | 'vk' | 'yandex';

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET ?? 'dev-secret';
  private readonly cookieSecure = (process.env.COOKIE_SECURE ?? 'false') === 'true';
  private readonly cookieDomain = process.env.COOKIE_DOMAIN || undefined;
  private readonly appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:8090';
  private readonly telegramAuthMode =
    (process.env.TELEGRAM_AUTH_MODE as 'strict' | 'mock' | undefined) ?? 'mock';
  private readonly welcomeCredits = Number.parseInt(process.env.NEW_USER_CREDITS ?? '10', 10);

  constructor(@Inject(CreditsService) private readonly creditsService: CreditsService) {}

  parseSessionToken(token?: string): SessionClaims | undefined {
    if (!token) {
      return undefined;
    }

    try {
      return jwt.verify(token, this.jwtSecret) as SessionClaims;
    } catch {
      return undefined;
    }
  }

  private signSessionToken(claims: SessionClaims): string {
    return jwt.sign(claims, this.jwtSecret, { expiresIn: '30d' });
  }

  private setSessionCookie(reply: FastifyReply, claims: SessionClaims): void {
    reply.setCookie('pc_sid', this.signSessionToken(claims), {
      path: '/',
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: 'lax',
      domain: this.cookieDomain,
      maxAge: 60 * 60 * 24 * 30
    });
  }

  private clearSessionCookie(reply: FastifyReply): void {
    reply.clearCookie('pc_sid', {
      path: '/',
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: 'lax',
      domain: this.cookieDomain
    });
  }

  private ensureAnonCookie(request: FastifyRequest, reply: FastifyReply): string {
    const existing = request.cookies.pc_anon;
    if (existing) {
      request.anonId = existing;
      return existing;
    }

    const anonId = randomUUID();
    reply.setCookie('pc_anon', anonId, {
      path: '/',
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: 'lax',
      domain: this.cookieDomain,
      maxAge: 60 * 60 * 24 * 365
    });
    request.anonId = anonId;
    return anonId;
  }

  private buildClaims(user: User): SessionClaims {
    return {
      sub: user.id,
      type: user.type as UserType,
      role: user.role as UserRole,
      locale: user.locale as Locale,
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      tgId: user.telegramId ? String(user.telegramId) : undefined
    };
  }

  private async applySession(request: FastifyRequest, reply: FastifyReply, user: User): Promise<void> {
    const claims = this.buildClaims(user);
    request.sessionClaims = claims;
    this.setSessionCookie(reply, claims);
  }

  private resolveClaims(request: FastifyRequest): SessionClaims | undefined {
    if (request.sessionClaims?.sub) {
      return request.sessionClaims;
    }

    const cookieToken = request.cookies?.pc_sid;
    const parsed = this.parseSessionToken(typeof cookieToken === 'string' ? cookieToken : undefined);
    if (parsed) {
      request.sessionClaims = parsed;
    }
    return parsed;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private normalizeRedirectPath(value?: string): string {
    if (!value || !value.startsWith('/')) {
      return '/';
    }
    if (value.startsWith('//')) {
      return '/';
    }
    return value;
  }

  private hashResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const hash = (await scrypt(password, salt, 64)) as Buffer;
    return `scrypt:${salt}:${hash.toString('hex')}`;
  }

  private async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [algo, salt, hashHex] = storedHash.split(':');
    if (algo !== 'scrypt' || !salt || !hashHex) {
      return false;
    }

    const candidate = (await scrypt(password, salt, 64)) as Buffer;
    const expected = Buffer.from(hashHex, 'hex');
    if (candidate.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(candidate, expected);
  }

  private isSafeEqual(a: string, b: string): boolean {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ab.length !== bb.length) {
      return false;
    }
    return timingSafeEqual(ab, bb);
  }

  private maybeBuildConfiguredOauthUrl(
    provider: OAuthProvider,
    state: string,
    redirectPath: string,
    locale: Locale
  ): string | null {
    const envKey = `OAUTH_${provider.toUpperCase()}_START_URL`;
    const template = process.env[envKey];
    if (!template) {
      return null;
    }

    const callback = `${this.appBaseUrl}/api/auth/oauth/${provider}/callback`;
    return template
      .replace('{state}', encodeURIComponent(state))
      .replace('{redirect_uri}', encodeURIComponent(callback))
      .replace('{redirect}', encodeURIComponent(redirectPath))
      .replace('{locale}', encodeURIComponent(locale));
  }

  private buildMockOauthUrl(
    provider: OAuthProvider,
    state: string,
    redirectPath: string,
    locale: Locale
  ): string {
    const baseId = Date.now().toString();
    if (provider === 'telegram') {
      const telegramId = /^[0-9]+$/.test(baseId) ? baseId : '777777';
      return `${this.appBaseUrl}/api/auth/oauth/telegram/callback?state=${encodeURIComponent(
        state
      )}&externalId=${telegramId}&name=${encodeURIComponent(
        'Telegram User'
      )}&redirect=${encodeURIComponent(redirectPath)}&locale=${encodeURIComponent(locale)}`;
    }

    const email = `${provider}_${baseId}@oauth.picoria.local`;
    return `${this.appBaseUrl}/api/auth/oauth/${provider}/callback?state=${encodeURIComponent(
      state
    )}&externalId=${encodeURIComponent(baseId)}&name=${encodeURIComponent(
      provider === 'vk' ? 'VK User' : 'Yandex User'
    )}&email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(
      redirectPath
    )}&locale=${encodeURIComponent(locale)}`;
  }

  private async grantWelcomeCredits(userId: string): Promise<void> {
    if (!Number.isFinite(this.welcomeCredits) || this.welcomeCredits <= 0) {
      return;
    }

    await this.creditsService.addLedgerEntry(userId, this.welcomeCredits, 'admin', 'welcome_credits');
  }

  private resolveRoleForNewUser(): 'user' {
    return 'user';
  }

  private toTelegramId(value: string): bigint {
    const trimmed = value.trim();
    if (/^[0-9]+$/.test(trimmed)) {
      return BigInt(trimmed);
    }

    const digest = createHash('sha1').update(trimmed).digest('hex').slice(0, 14);
    return BigInt(`9${digest}`);
  }

  async resolveSessionUser(request: FastifyRequest): Promise<User | null> {
    const claims = this.resolveClaims(request);
    if (!claims?.sub) {
      return null;
    }
    return prisma.user.findUnique({ where: { id: claims.sub } });
  }

  async ensureUser(
    request: FastifyRequest,
    reply: FastifyReply,
    locale: Locale = 'en'
  ): Promise<User> {
    const sessionUser = await this.resolveSessionUser(request);
    if (sessionUser && !sessionUser.isBlocked) {
      if (sessionUser.type === 'guest') {
        this.ensureAnonCookie(request, reply);
      }
      return sessionUser;
    }

    const guest = await prisma.user.create({
      data: {
        type: 'guest',
        role: 'user',
        locale
      }
    });

    this.ensureAnonCookie(request, reply);
    await this.applySession(request, reply, guest);

    return guest;
  }

  async authTelegram(initData: string, request: FastifyRequest, reply: FastifyReply): Promise<User> {
    const validated = validateTelegramInitData(
      initData,
      this.telegramAuthMode,
      process.env.TELEGRAM_BOT_TOKEN
    );

    const telegramId = BigInt(validated.telegramId);
    const existing = await prisma.user.findUnique({ where: { telegramId } });

    const user = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            type: 'telegram',
            locale: 'ru'
          }
        })
      : await prisma.user.create({
          data: {
            type: 'telegram',
            role: this.resolveRoleForNewUser(),
            locale: 'ru',
            telegramId
          }
        });

    if (!existing) {
      await this.grantWelcomeCredits(user.id);
    }

    await this.applySession(request, reply, user);
    return user;
  }

  async registerEmail(
    request: FastifyRequest,
    reply: FastifyReply,
    input: { email: string; password: string; name?: string; locale?: Locale }
  ): Promise<User> {
    const email = this.normalizeEmail(input.email);
    const locale = input.locale ?? 'en';

    const sessionUser = await this.resolveSessionUser(request);
    const existingByEmail = await prisma.user.findUnique({ where: { email } });

    if (existingByEmail && (!sessionUser || existingByEmail.id !== sessionUser.id)) {
      throw new BadRequestException('EMAIL_TAKEN');
    }

    const passwordHash = await this.hashPassword(input.password);
    const role = this.resolveRoleForNewUser();
    const payload = {
      type: 'local' as const,
      role,
      locale,
      email,
      passwordHash,
      name: input.name?.trim() || null
    };

    const user =
      sessionUser && sessionUser.type === 'guest' && !sessionUser.isBlocked
        ? await prisma.user.update({
            where: { id: sessionUser.id },
            data: {
              ...payload,
              telegramId: null,
              vkId: null,
              yandexId: null
            }
          })
        : await prisma.user.create({ data: payload });

    await this.grantWelcomeCredits(user.id);
    await this.applySession(request, reply, user);
    return user;
  }

  async loginEmail(
    request: FastifyRequest,
    reply: FastifyReply,
    input: { email: string; password: string; locale?: Locale }
  ): Promise<User> {
    const email = this.normalizeEmail(input.email);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash || user.isBlocked) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const valid = await this.verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        type: 'local',
        locale: input.locale ?? user.locale
      }
    });

    await this.applySession(request, reply, updated);
    return updated;
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    request.sessionClaims = undefined;
    this.clearSessionCookie(reply);
  }

  async requestPasswordReset(emailInput: string): Promise<{ ok: true; token?: string }> {
    const email = this.normalizeEmail(emailInput);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isBlocked) {
      return { ok: true };
    }

    const rawToken = randomBytes(24).toString('hex');
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashResetToken(rawToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60)
      }
    });

    return {
      ok: true,
      token: process.env.NODE_ENV === 'production' ? undefined : rawToken
    };
  }

  async confirmPasswordReset(
    request: FastifyRequest,
    reply: FastifyReply,
    input: { token: string; password: string }
  ): Promise<User> {
    const tokenHash = this.hashResetToken(input.token);
    const token = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!token || token.usedAt || token.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('RESET_TOKEN_INVALID');
    }

    const passwordHash = await this.hashPassword(input.password);

    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: token.userId },
        data: {
          passwordHash,
          type: token.user.type === 'guest' ? 'local' : token.user.type
        }
      });

      await tx.passwordResetToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() }
      });

      return updatedUser;
    });

    await this.applySession(request, reply, user);
    return user;
  }

  async beginOauth(
    provider: OAuthProvider,
    reply: FastifyReply,
    input: { redirectPath?: string; locale?: Locale }
  ): Promise<{ url: string }> {
    const state = randomBytes(16).toString('hex');
    const redirectPath = this.normalizeRedirectPath(input.redirectPath);
    const locale = input.locale ?? 'en';

    reply.setCookie('pc_oauth_state', state, {
      path: '/',
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: 'lax',
      domain: this.cookieDomain,
      maxAge: 60 * 10
    });

    const configured = this.maybeBuildConfiguredOauthUrl(provider, state, redirectPath, locale);
    if (configured) {
      return { url: configured };
    }

    return { url: this.buildMockOauthUrl(provider, state, redirectPath, locale) };
  }

  async finishOauth(
    provider: OAuthProvider,
    request: FastifyRequest,
    reply: FastifyReply,
    input: {
      state?: string;
      externalId?: string;
      code?: string;
      email?: string;
      name?: string;
      redirectPath?: string;
      locale?: Locale;
    }
  ): Promise<{ redirectTo: string; user: User }> {
    const cookieState = request.cookies.pc_oauth_state;
    if (!cookieState || !input.state || !this.isSafeEqual(cookieState, input.state)) {
      throw new UnauthorizedException('OAUTH_STATE_INVALID');
    }

    reply.clearCookie('pc_oauth_state', {
      path: '/',
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: 'lax',
      domain: this.cookieDomain
    });

    const externalId = (input.externalId ?? input.code ?? randomUUID()).trim();
    const locale = input.locale ?? (provider === 'telegram' ? 'ru' : 'en');
    const name = input.name?.trim() || `${provider.toUpperCase()} User`;
    const email = input.email ? this.normalizeEmail(input.email) : null;

    let user: User;
    if (provider === 'telegram') {
      const telegramId = this.toTelegramId(externalId);
      const existing = await prisma.user.findUnique({ where: { telegramId } });

      user = existing
        ? await prisma.user.update({
            where: { id: existing.id },
            data: {
              type: 'telegram',
              locale,
              name
            }
          })
        : await prisma.user.create({
            data: {
              type: 'telegram',
              role: this.resolveRoleForNewUser(),
              locale,
              name,
              telegramId
            }
          });

      if (!existing) {
        await this.grantWelcomeCredits(user.id);
      }
    } else {
      const existingByProvider =
        provider === 'vk'
          ? await prisma.user.findFirst({ where: { vkId: externalId } })
          : await prisma.user.findFirst({ where: { yandexId: externalId } });

      if (existingByProvider) {
        user = await prisma.user.update({
          where: { id: existingByProvider.id },
          data: {
            type: provider,
            locale,
            name,
            email: email ?? existingByProvider.email
          }
        });
      } else {
        const existingByEmail = email
          ? await prisma.user.findUnique({ where: { email } })
          : null;

        if (existingByEmail) {
          user = await prisma.user.update({
            where: { id: existingByEmail.id },
            data:
              provider === 'vk'
                ? {
                    type: provider,
                    locale,
                    name,
                    vkId: externalId
                  }
                : {
                    type: provider,
                    locale,
                    name,
                    yandexId: externalId
                  }
          });
        } else {
          user = await prisma.user.create({
            data:
              provider === 'vk'
                ? {
                    type: provider,
                    role: this.resolveRoleForNewUser(),
                    locale,
                    name,
                    email,
                    vkId: externalId
                  }
                : {
                    type: provider,
                    role: this.resolveRoleForNewUser(),
                    locale,
                    name,
                    email,
                    yandexId: externalId
                  }
          });
          await this.grantWelcomeCredits(user.id);
        }
      }
    }

    await this.applySession(request, reply, user);
    return {
      redirectTo: this.normalizeRedirectPath(input.redirectPath),
      user
    };
  }

  async requireUser(request: FastifyRequest): Promise<User> {
    const user = await this.resolveSessionUser(request);
    if (!user || user.isBlocked) {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }

  async requireRegisteredUser(request: FastifyRequest): Promise<User> {
    const user = await this.requireUser(request);
    if (user.type === 'guest') {
      throw new UnauthorizedException('Authentication required');
    }
    return user;
  }

  async updateProfile(
    request: FastifyRequest,
    input: { email?: string; name?: string | null; locale?: Locale }
  ): Promise<User> {
    const user = await this.requireRegisteredUser(request);
    const data: Partial<Pick<User, 'email' | 'name' | 'locale'>> = {};

    if (input.email !== undefined) {
      const email = this.normalizeEmail(input.email);
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== user.id) {
        throw new BadRequestException('EMAIL_TAKEN');
      }
      data.email = email;
    }

    if (input.name !== undefined) {
      const name = input.name?.trim() ?? '';
      data.name = name.length > 0 ? name : null;
    }

    if (input.locale !== undefined) {
      data.locale = input.locale;
    }

    if (Object.keys(data).length === 0) {
      return user;
    }

    return prisma.user.update({
      where: { id: user.id },
      data
    });
  }

  async changePassword(
    request: FastifyRequest,
    input: { currentPassword?: string; newPassword: string }
  ): Promise<User> {
    const user = await this.requireRegisteredUser(request);

    if (user.passwordHash) {
      if (!input.currentPassword) {
        throw new BadRequestException('CURRENT_PASSWORD_REQUIRED');
      }
      const valid = await this.verifyPassword(input.currentPassword, user.passwordHash);
      if (!valid) {
        throw new UnauthorizedException('INVALID_CREDENTIALS');
      }
    }

    const passwordHash = await this.hashPassword(input.newPassword);
    return prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });
  }

  async requireAdminUser(request: FastifyRequest): Promise<User> {
    const user = await this.requireUser(request);
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }
    return user;
  }

  async requireTelegramUser(request: FastifyRequest): Promise<User> {
    const user = await this.requireUser(request);
    if (user.type !== 'telegram') {
      throw new UnauthorizedException('Telegram authentication required');
    }
    return user;
  }
}
