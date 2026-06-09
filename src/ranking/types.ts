/**
 * Domain types for the series ranking engine.
 *
 * The engine is pure: it takes archers' completed event scores (already grouped
 * by USA Archery number and segment) and produces ranked standings. It performs
 * no I/O — the pull job and Prisma layer feed it plain objects.
 */

/** Minimum events an archer must shoot in a series to receive an official rank. */
export const MIN_EVENTS_FOR_RANK = 3

/** Number of best scores that count toward the ranking total. */
export const COUNTED_SCORES = 3

/** A single completed event score for one archer in one series. */
export interface EventScore {
  eventId: string
  eventName: string
  /** ISO date (YYYY-MM-DD). Used for the "most recent event" tiebreaker. */
  eventDate: string
  /** Final event total. */
  total: number
  /**
   * Per-arrow values, when available. Enables the "most 7s" tiebreaker.
   * Omitted when arrow-level data was not captured for the event.
   */
  arrows?: number[]
}

/** Ranking segment: archers only compete within the same segment. */
export interface Segment {
  division: string
  gender: string
  ageClass: string
}

/** An archer's full set of scores in a series, keyed by stable identity. */
export interface ArcherEntry {
  usaArcheryNo: string
  name: string
  segment: Segment
  scores: EventScore[]
}

/** Computed ranking result for a single archer within a segment. */
export interface ArcherRanking {
  usaArcheryNo: string
  name: string
  segment: Segment
  eventsShot: number
  /** True once eventsShot >= MIN_EVENTS_FOR_RANK. */
  ranked: boolean
  /** Sum of counted scores (best 3, or all available when fewer than 3). */
  best3Total: number
  /** Average of counted scores, rounded to 2 decimals. Null when no scores. */
  best3Average: number | null
  /** The scores that count toward best3Total, highest first. */
  counted: EventScore[]
  /** Recorded scores that do not count (beyond the best 3, or lower duplicates). */
  dropped: EventScore[]
  /** 1-based position within the segment among ranked archers; null if unranked. */
  rank: number | null
}
