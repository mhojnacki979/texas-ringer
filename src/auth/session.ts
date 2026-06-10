/**
 * Stateless admin sessions: an HMAC-signed expiry timestamp in an httpOnly
 * cookie. No session table needed — the signature (keyed by SESSION_SECRET)
 * proves the cookie was issued by us, and the embedded timestamp bounds it.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_SESSION_COOKIE = 'tr_admin'
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

/** Constant-time string comparison for secrets. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

/** Token format: `<expiresAtMs>.<hmac(expiresAtMs)>`. */
export function createSessionToken(
  secret: string,
  now: number = Date.now(),
  ttlMs: number = SESSION_TTL_SECONDS * 1000,
): string {
  const expiresAt = now + ttlMs
  return `${expiresAt}.${sign(String(expiresAt), secret)}`
}

export function verifySessionToken(token: string, secret: string, now: number = Date.now()): boolean {
  if (secret === '') return false
  const [expiry, mac] = token.split('.')
  if (expiry === undefined || mac === undefined) return false
  const expiresAt = Number(expiry)
  if (!Number.isFinite(expiresAt) || expiresAt < now) return false
  return safeEqual(mac, sign(expiry, secret))
}
