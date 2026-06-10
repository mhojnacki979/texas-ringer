/** POST /api/logout — clears the admin session cookie. */
import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE } from '@/auth/session'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), 303)
  response.cookies.delete(ADMIN_SESSION_COOKIE)
  return response
}
