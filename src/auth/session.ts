/**
 * Stateless admin sessions: an HMAC-signed expiry timestamp in an httpOnly
 * cookie. No session table needed — the signature (keyed by SESSION_SECRET)
 * proves the cookie was issued by us, and the embedded timestamp bounds it.
 * Revocation = rotate SESSION_SECRET in the environment (logs everyone out).
 */
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

/**
 * __Host- prefix in production: the browser then enforces Secure + Path=/ and
 * rejects subdomain cookie planting. Plain name in dev (the prefix requires
 * HTTPS, which next dev does not serve).
 */
export function sessionCookieName(): string {
  return process.env.NODE_ENV === 'production' ? '__Host-tr_admin' : 'tr_admin'
}

/** Random per-process key — only equality of inputs matters, not stability. */
const EQ_KEY = randomBytes(32)

/**
 * Constant-time string comparison for secrets. Both inputs are HMAC'd first so
 * the buffers compared always have equal length — no input-length timing leak.
 */
export function safeEqual(a: string, b: string): boolean {
  const hashedA = createHmac('sha256', EQ_KEY).update(a).digest()
  const hashedB = createHmac('sha256', EQ_KEY).update(b).digest()
  return timingSafeEqual(hashedA, hashedB)
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
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [expiry, mac] = parts
  if (expiry === undefined || mac === undefined || expiry === '' || mac === '') return false
  const expiresAt = Number(expiry)
  if (!Number.isFinite(expiresAt) || expiresAt < now) return false
  return safeEqual(mac, sign(expiry, secret))
}
