/**
 * Prisma-backed implementation of the data-access contract (see types.ts).
 *
 * Mirrors the CSV stub (standings.ts) signature-for-signature so the UI can
 * swap imports without changes. Scores are read from the DB, rebuilt into
 * ArcherEntry[] per series, and ranked by the pure engine — ranking logic
 * lives ONLY in src/ranking/engine.
 */
import type { PrismaClient } from '@prisma/client'
import { rankSeries, segmentBucketKey } from '../ranking/engine'
import type { ArcherEntry, EventScore } from '../ranking/types'
import { prisma } from '../db/client'
import type { ArcherDetail, SeriesStandings, SeriesSummary } from './types'

type ScoreWithEvent = {
  usaArcheryNo: string
  archerName: string
  division: string
  gender: string
  ageClass: string
  total: number
  arrows: string
  event: { externalId: string; name: string; date: string }
}

function toEventScore(row: ScoreWithEvent): EventScore {
  const arrows = row.arrows.split(' ').filter((a) => a !== '').map(Number)
  return {
    eventId: row.event.externalId,
    eventName: row.event.name,
    eventDate: row.event.date,
    total: row.total,
    ...(arrows.length > 0 ? { arrows } : {}),
  }
}

/** Rebuild ArcherEntry[] (one per archer per segment) from a series' score rows. */
function buildEntries(rows: ScoreWithEvent[]): ArcherEntry[] {
  const byArcherSegment = new Map<string, ArcherEntry>()
  for (const row of rows) {
    const segment = { division: row.division, gender: row.gender, ageClass: row.ageClass }
    const key = `${segmentBucketKey(segment)} ${row.usaArcheryNo}`
    let entry = byArcherSegment.get(key)
    if (entry === undefined) {
      entry = { usaArcheryNo: row.usaArcheryNo, name: row.archerName, segment, scores: [] }
      byArcherSegment.set(key, entry)
    }
    entry.scores.push(toEventScore(row))
  }
  return [...byArcherSegment.values()]
}

async function loadSeriesRows(db: PrismaClient, seriesId: string): Promise<ScoreWithEvent[]> {
  return db.score.findMany({
    where: { seriesId },
    select: {
      usaArcheryNo: true,
      archerName: true,
      division: true,
      gender: true,
      ageClass: true,
      total: true,
      arrows: true,
      event: { select: { externalId: true, name: true, date: true } },
    },
    orderBy: [{ event: { date: 'asc' } }, { usaArcheryNo: 'asc' }],
  })
}

/** Build the contract implementation against a specific client (tests inject a temp DB). */
export function createStandingsDb(db: PrismaClient): {
  listSeries: () => Promise<SeriesSummary[]>
  getSeriesStandings: (slug: string) => Promise<SeriesStandings | null>
  getArcherDetail: (slug: string, usaArcheryNo: string) => Promise<ArcherDetail | null>
} {
  async function summarize(series: {
    id: string
    slug: string
    name: string
    roundFormat: string
  }): Promise<SeriesSummary> {
    const [eventCount, archers] = await Promise.all([
      db.event.count({ where: { seriesId: series.id } }),
      db.score.findMany({
        where: { seriesId: series.id },
        select: { usaArcheryNo: true },
        distinct: ['usaArcheryNo'],
      }),
    ])
    return {
      slug: series.slug,
      name: series.name,
      roundFormat: series.roundFormat,
      eventCount,
      archerCount: archers.length,
    }
  }

  async function listSeries(): Promise<SeriesSummary[]> {
    const all = await db.series.findMany({ orderBy: { name: 'asc' } })
    return Promise.all(all.map(summarize))
  }

  async function getSeriesStandings(slug: string): Promise<SeriesStandings | null> {
    const series = await db.series.findUnique({ where: { slug } })
    if (series === null) return null

    const entries = buildEntries(await loadSeriesRows(db, series.id))
    const boards = [...rankSeries(entries).entries()].map(([key, rankings]) => ({
      key,
      segment: rankings[0]?.segment ?? { division: '?', gender: '?', ageClass: '?' },
      rankings,
    }))
    return { series: await summarize(series), boards }
  }

  async function getArcherDetail(
    slug: string,
    usaArcheryNo: string,
  ): Promise<ArcherDetail | null> {
    const standings = await getSeriesStandings(slug)
    if (standings === null) return null

    const rankings = standings.boards
      .flatMap((b) => b.rankings)
      .filter((r) => r.usaArcheryNo === usaArcheryNo)
    if (rankings.length === 0) return null

    return {
      seriesSlug: standings.series.slug,
      seriesName: standings.series.name,
      usaArcheryNo,
      name: rankings[0]?.name ?? usaArcheryNo,
      rankings,
    }
  }

  return { listSeries, getSeriesStandings, getArcherDetail }
}

const defaultDb = createStandingsDb(prisma)

export const listSeries = defaultDb.listSeries
export const getSeriesStandings = defaultDb.getSeriesStandings
export const getArcherDetail = defaultDb.getArcherDetail
