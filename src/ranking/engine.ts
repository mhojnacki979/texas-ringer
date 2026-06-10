/**
 * Pure series-ranking engine.
 *
 * "Best 3 of N": an archer's ranking total is the sum of their three highest
 * event scores. Selecting the top 3 by total is provably equivalent to the
 * spec's sequential "replace the lowest counted score only if higher" rule —
 * both yield the three largest values — so we compute it directly.
 */

import {
  COUNTED_SCORES,
  MIN_EVENTS_FOR_RANK,
  type ArcherEntry,
  type ArcherRanking,
  type EventScore,
  type Segment,
} from './types'

/** Stable, human-readable key for a segment leaderboard. */
export function segmentKey(s: Segment): string {
  return `${s.division} / ${s.gender} / ${s.ageClass}`
}

/** Count arrows worth exactly 7 across a set of scores (for the "most 7s" tiebreaker). */
function countSevens(scores: EventScore[]): number {
  return scores.reduce(
    (sum, s) => sum + (s.arrows?.filter((a) => a === 7).length ?? 0),
    0,
  )
}

/** Most recent event date (ISO string) across scores, or '' when none. */
function latestEventDate(scores: EventScore[]): string {
  return scores.reduce((latest, s) => (s.eventDate > latest ? s.eventDate : latest), '')
}

/**
 * Split an archer's scores into counted (best 3) and dropped (the rest).
 * Ties at the boundary are broken by earlier event date for determinism, which
 * never affects the total since tied scores are equal.
 */
function selectCounted(scores: EventScore[]): { counted: EventScore[]; dropped: EventScore[] } {
  const ordered = [...scores].sort((a, b) => b.total - a.total || a.eventDate.localeCompare(b.eventDate))
  return {
    counted: ordered.slice(0, COUNTED_SCORES),
    dropped: ordered.slice(COUNTED_SCORES),
  }
}

/** Compute the ranking summary for a single archer (rank is assigned later by rankSegment). */
export function computeArcherRanking(entry: ArcherEntry): ArcherRanking {
  const { counted, dropped } = selectCounted(entry.scores)
  const best3Total = counted.reduce((sum, s) => sum + s.total, 0)
  const best3Average =
    counted.length > 0 ? Math.round((best3Total / counted.length) * 100) / 100 : null

  return {
    usaArcheryNo: entry.usaArcheryNo,
    name: entry.name,
    segment: entry.segment,
    eventsShot: entry.scores.length,
    ranked: entry.scores.length >= MIN_EVENTS_FOR_RANK,
    best3Total,
    best3Average,
    counted,
    dropped,
    rank: null,
  }
}

/** Counted scores sorted high -> low, for positional tiebreakers. */
function countedDescending(r: ArcherRanking): number[] {
  return r.counted.map((s) => s.total).sort((a, b) => b - a)
}

/**
 * Ordering for two ranked archers. Returns negative if `a` should rank ahead.
 * Tiebreakers, in spec order: best-3 total, highest single, 2nd, 3rd,
 * most 7s, most recent event.
 */
function compareRanked(a: ArcherRanking, b: ArcherRanking): number {
  if (a.best3Total !== b.best3Total) return b.best3Total - a.best3Total

  const aScores = countedDescending(a)
  const bScores = countedDescending(b)
  for (let i = 0; i < Math.max(aScores.length, bScores.length); i++) {
    const av = aScores[i] ?? 0
    const bv = bScores[i] ?? 0
    if (av !== bv) return bv - av
  }

  const aSevens = countSevens(a.counted)
  const bSevens = countSevens(b.counted)
  if (aSevens !== bSevens) return bSevens - aSevens

  // Most recent event score ranks ahead.
  return latestEventDate(b.counted).localeCompare(latestEventDate(a.counted))
}

/**
 * Rank all archers within a single segment.
 *
 * Officially ranked archers (>= 3 events) come first, sorted by the tiebreaker
 * chain and assigned 1-based ranks. Provisional archers (< 3 events) follow,
 * sorted by running total, with a null rank.
 */
export function rankSegment(entries: ArcherEntry[]): ArcherRanking[] {
  const computed = entries.map(computeArcherRanking)

  const ranked = computed
    .filter((r) => r.ranked)
    .sort(compareRanked)
    .map((r, i) => ({ ...r, rank: i + 1 }))

  const provisional = computed
    .filter((r) => !r.ranked)
    .sort((a, b) => b.best3Total - a.best3Total)

  return [...ranked, ...provisional]
}

/**
 * Rank a whole series: bucket archer entries into their segment leaderboards
 * (division x gender x age) and rank each independently. Keyed by segmentKey.
 */
export function rankSeries(entries: ArcherEntry[]): Map<string, ArcherRanking[]> {
  const bySegment = new Map<string, ArcherEntry[]>()
  for (const entry of entries) {
    const key = segmentKey(entry.segment)
    const bucket = bySegment.get(key)
    if (bucket === undefined) bySegment.set(key, [entry])
    else bucket.push(entry)
  }

  const result = new Map<string, ArcherRanking[]>()
  for (const [key, segmentEntries] of bySegment) {
    result.set(key, rankSegment(segmentEntries))
  }
  return result
}
