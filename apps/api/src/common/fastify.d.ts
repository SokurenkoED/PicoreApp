import type { SessionClaims } from '@picoria/shared';

declare module 'fastify' {
  interface FastifyRequest {
    sessionClaims?: SessionClaims;
    anonId?: string;
  }
}
