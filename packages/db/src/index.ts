import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __picoriaPrisma__: PrismaClient | undefined;
}

export const prisma = global.__picoriaPrisma__ ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__picoriaPrisma__ = prisma;
}

export * from '@prisma/client';
export type { PrismaClient } from '@prisma/client';
