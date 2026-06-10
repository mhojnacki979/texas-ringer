/** POST /api/logout — clears the admin session cookie. */
import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE } from '@/auth/session'

export const dynamic = 'force-dynamic'

export async function POST(): Promise<NextResponse> {
  // Relative Location: absolute URLs built from request.url resolve to the
  // internal host behind Railway's proxy.
  const response = new NextResponse(null, { status: 303, headers: { Location: '/admin/login' } })
  response.cookies.delete(ADMIN_SESSION_COOKIE)
  return response
}
