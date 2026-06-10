/**
 * Data-access contract for the public site.
 *
 * UI pages import ONLY from src/data — never from Prisma or the import layer
 * directly. The backing implementation (CSV stub now, Prisma later) can swap
 * without touching any page.
 */
import type { ArcherRanking, Segment } from '../ranking/types'

export interface SeriesSummary {
  /** URL-safe identifier derived from the series name. */
  slug: string
  name: string
  roundFormat: string
  eventCount: number
  archerCount: number
}

/** One segment leaderboard (division x gender x age) within a series. */
export interface SegmentBoard {
  /** Stable key, e.g. "Compound / Male / Senior". */
  key: string
  segment: Segment
  rankings: ArcherRanking[]
}

export interface SeriesStandings {
  series: SeriesSummary
  boards: SegmentBoard[]
}

/** An archer's full picture within one series (may span multiple segments). */
export interface ArcherDetail {
  seriesSlug: string
  seriesName: string
  usaArcheryNo: string
  name: string
  /** One ranking per segment the archer appears in. */
  rankings: ArcherRanking[]
}
