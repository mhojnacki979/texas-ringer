/**
 * POST /api/login — native HTML form target. Validates ADMIN_PASSWORD and
 * sets the signed session cookie, then redirects back into the admin area.
 *
 * Brute-force posture: per-IP lockout (5 fails / 15 min) plus a fixed delay
 * on every failure; bodies over 4KB are rejected before parsing.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  SESSION_TTL_SECONDS,
  createSessionToken,
  safeEqual,
  sessionCookieName,
} from '@/auth/session'
import { clearFailures, isLockedOut, recordFailure } from '@/auth/rate-limit'

export const dynamic = 'force-dynamic'

const MAX_LOGIN_BODY_BYTES = 4096
const FAILURE_DELAY_MS = 500

/**
 * Relative-Location redirect. Building an absolute URL from request.url
 * breaks behind Railway's proxy (it resolves to the internal localhost
 * address); browsers resolve a relative Location against the public origin.
 */
function seeOther(location: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { Location: location } })
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? 'unknown'
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (!Number.isFinite(contentLength) || contentLength > MAX_LOGIN_BODY_BYTES) {
    return seeOther('/admin/login?error=1')
  }

  const ip = clientIp(request)
  if (isLockedOut(ip)) {
    return seeOther('/admin/login?error=locked')
  }

  const form = await request.formData()
  const password = form.get('password')
  const expected = process.env.ADMIN_PASSWORD ?? ''
  const secret = process.env.SESSION_SECRET ?? ''

  const valid =
    typeof password === 'string' && expected !== '' && secret !== '' && safeEqual(password, expected)
  if (!valid) {
    recordFailure(ip)
    await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS))
    return seeOther('/admin/login?error=1')
  }

  clearFailures(ip)
  const response = seeOther('/admin')
  response.cookies.set(sessionCookieName(), createSessionToken(secret), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
  return response
}
