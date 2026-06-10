/**
 * GET /api/health — deploy healthcheck. Deliberately database-free so a DB
 * hiccup at boot does not fail the whole deployment.
 */
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET(): NextResponse {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}
