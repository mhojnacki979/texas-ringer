import { z } from 'zod'

/** Columns required in an import CSV. Order in the file does not matter. */
export const REQUIRED_HEADERS = [
  'series',
  'round_format',
  'usa_archery_no',
  'archer_name',
  'division',
  'gender',
  'age_class',
  'event_id',
  'event_name',
  'event_date',
  'total_score',
] as const

/** Zero-width characters that survive trim() and split archer identities. */
const INVISIBLE_CHARS = /[​-‍⁠﻿]/g

/** Highest value a single arrow can score (12-ring exists in 3D rounds). */
export const MAX_ARROW_VALUE = 12

function isRealCalendarDate(iso: string): boolean {
  const [y, m, d] = iso.split('-').map(Number)
  if (y === undefined || m === undefined || d === undefined) return false
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

/**
 * Schema for one raw CSV record (header-keyed). Validates at the import
 * boundary; messages name the offending column so errors are actionable.
 *
 * total_score is intentionally strict-string-then-number: z.coerce would turn
 * an empty cell into 0 and silently corrupt rankings.
 */
export const scoreRowSchema = z.object({
  series: z.string().trim().min(1, 'series is required'),
  round_format: z.string().trim().min(1, 'round_format is required'),
  usa_archery_no: z
    .string()
    .transform((s) => s.replace(INVISIBLE_CHARS, '').trim().toUpperCase())
    .pipe(z.string().min(1, 'usa_archery_no is required')),
  archer_name: z.string().trim().min(1, 'archer_name is required'),
  division: z.string().trim().min(1, 'division is required'),
  gender: z.string().trim().min(1, 'gender is required'),
  age_class: z.string().trim().min(1, 'age_class is required'),
  event_id: z.string().trim().min(1, 'event_id is required'),
  event_name: z.string().trim().min(1, 'event_name is required'),
  event_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'event_date must be ISO format YYYY-MM-DD')
    .refine(isRealCalendarDate, 'event_date must be a real calendar date'),
  total_score: z
    .string()
    .trim()
    .regex(/^\d+$/, 'total_score must be a whole non-negative number')
    .transform(Number),
  arrows: z.string().optional().default(''),
})

export type ScoreRow = z.infer<typeof scoreRowSchema>

/** Parse the optional arrows cell ("10 9 9 7" / "10;9;9;7") into integers. */
export function parseArrows(raw: string): number[] {
  const trimmed = raw.trim()
  if (trimmed === '') return []
  return trimmed
    .split(/[\s;]+/)
    .filter((p) => p !== '')
    .map((p) => Number(p))
}
