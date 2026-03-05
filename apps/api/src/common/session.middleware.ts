import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import type { SessionClaims } from '@picoria/shared';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly jwtSecret = process.env.JWT_SECRET ?? 'dev-secret';

  private parseSessionToken(token?: string): SessionClaims | undefined {
    if (!token) {
      return undefined;
    }
    try {
      return jwt.verify(token, this.jwtSecret) as SessionClaims;
    } catch {
      return undefined;
    }
  }

  use(request: FastifyRequest, _reply: FastifyReply, next: () => void): void {
    const cookies = request.cookies ?? {};
    request.sessionClaims = this.parseSessionToken(cookies.pc_sid as string | undefined);
    request.anonId = cookies.pc_anon as string | undefined;
    next();
  }
}
