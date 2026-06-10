/** POST /api/logout — clears the admin session cookie. */
import { NextRequest, NextResponse } from 'next/server'
import { sessionCookieName } from '@/auth/session'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Relative Location: absolute URLs built from request.url resolve to the
  // internal host behind Railway's proxy.
  const response = new NextResponse(null, { status: 303, headers: { Location: '/admin/login' } })

  // Ignore cross-site form posts so third-party pages cannot force a logout.
  const site = request.headers.get('sec-fetch-site')
  if (site !== null && site !== 'same-origin' && site !== 'none') return response

  response.cookies.set(sessionCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return response
}
