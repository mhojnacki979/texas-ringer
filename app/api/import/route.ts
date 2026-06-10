/**
 * POST /api/import — token-protected CSV score import.
 *
 * Accepts either multipart/form-data with a `file` field (the admin upload
 * page) or a raw text/csv body (future EyesonScore automation/webhooks).
 * Auth: `Authorization: Bearer <ADMIN_TOKEN>`.
 */
import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { importScoresFromCsv } from '@/db/import-scores'

export const dynamic = 'force-dynamic'

/** Hard cap on upload size — a season of scores is well under this. */
const MAX_CSV_BYTES = 2 * 1024 * 1024

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.ADMIN_TOKEN
  if (expected === undefined || expected === '') return false
  const header = request.headers.get('authorization') ?? ''
  const provided = header.startsWith('Bearer ') ? header.slice(7) : ''
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function readCsvBody(request: NextRequest): Promise<string | null> {
  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) return null
    if (file.size > MAX_CSV_BYTES) return null
    return file.text()
  }
  const text = await request.text()
  if (text.length > MAX_CSV_BYTES) return null
  return text
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const csv = await readCsvBody(request)
  if (csv === null || csv.trim() === '') {
    return NextResponse.json(
      { error: `missing or oversized CSV (max ${MAX_CSV_BYTES / 1024 / 1024}MB)` },
      { status: 400 },
    )
  }

  const summary = await importScoresFromCsv(csv)
  return NextResponse.json(summary)
}
