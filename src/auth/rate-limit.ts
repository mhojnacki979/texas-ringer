/**
 * Minimal in-memory login throttle. Adequate for this single-instance
 * deployment; would need a shared store if the app ever scales horizontally.
 *
 * 5 failed attempts per IP open a 15-minute lockout window.
 */
const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES = 5

interface Bucket {
  failures: number
  windowStart: number
}

const buckets = new Map<string, Bucket>()

function bucketFor(ip: string, now: number): Bucket {
  const existing = buckets.get(ip)
  if (existing !== undefined && now - existing.windowStart < WINDOW_MS) return existing
  const fresh: Bucket = { failures: 0, windowStart: now }
  buckets.set(ip, fresh)
  return fresh
}

export function isLockedOut(ip: string, now: number = Date.now()): boolean {
  return bucketFor(ip, now).failures >= MAX_FAILURES
}

export function recordFailure(ip: string, now: number = Date.now()): void {
  bucketFor(ip, now).failures++
  // Opportunistic sweep so the map cannot grow unbounded under abuse.
  if (buckets.size > 10_000) {
    for (const [key, bucket] of buckets) {
      if (now - bucket.windowStart >= WINDOW_MS) buckets.delete(key)
    }
  }
}

export function clearFailures(ip: string): void {
  buckets.delete(ip)
}
