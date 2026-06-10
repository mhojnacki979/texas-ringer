/**
 * POST /api/login — native HTML form target. Validates ADMIN_PASSWORD and
 * sets the signed session cookie, then redirects back into the admin area.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  safeEqual,
} from '@/auth/session'

export const dynamic = 'force-dynamic'

/**
 * Relative-Location redirect. Building an absolute URL from request.url
 * breaks behind Railway's proxy (it resolves to the internal localhost
 * address); browsers resolve a relative Location against the public origin.
 */
function seeOther(location: string): NextResponse {
  return new NextResponse(null, { status: 303, headers: { Location: location } })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const form = await request.formData()
  const password = form.get('password')
  const expected = process.env.ADMIN_PASSWORD ?? ''
  const secret = process.env.SESSION_SECRET ?? ''

  const valid =
    typeof password === 'string' && expected !== '' && secret !== '' && safeEqual(password, expected)
  if (!valid) {
    return seeOther('/admin/login?error=1')
  }

  const response = seeOther('/admin')
  response.cookies.set(ADMIN_SESSION_COOKIE, createSessionToken(secret), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
  return response
}
