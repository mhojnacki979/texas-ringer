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

/**
 * Schema for one raw CSV record (header-keyed). Validates at the import
 * boundary; messages name the offending column so errors are actionable.
 */
export const scoreRowSchema = z.object({
  series: z.string().trim().min(1, 'series is required'),
  round_format: z.string().trim().min(1, 'round_format is required'),
  usa_archery_no: z.string().trim().min(1, 'usa_archery_no is required'),
  archer_name: z.string().trim().min(1, 'archer_name is required'),
  division: z.string().trim().min(1, 'division is required'),
  gender: z.string().trim().min(1, 'gender is required'),
  age_class: z.string().trim().min(1, 'age_class is required'),
  event_id: z.string().trim().min(1, 'event_id is required'),
  event_name: z.string().trim().min(1, 'event_name is required'),
  event_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'event_date must be ISO format YYYY-MM-DD'),
  total_score: z.coerce
    .number({ invalid_type_error: 'total_score must be a number' })
    .int('total_score must be a whole number')
    .nonnegative('total_score must be zero or positive'),
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
