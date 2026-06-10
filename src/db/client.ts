/**
 * Prisma client singleton.
 *
 * Cached on globalThis so Next.js hot reloads in dev reuse the same client
 * instead of leaking a new connection pool per reload.
 */
import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var -- var is required for global augmentation
  var prismaSingleton: PrismaClient | undefined
}

export const prisma: PrismaClient = globalThis.prismaSingleton ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaSingleton = prisma
}
