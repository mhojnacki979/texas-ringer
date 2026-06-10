/**
 * Data-access entry point for the public site (see types.ts for the contract).
 *
 * CURRENT IMPLEMENTATION: CSV-backed stub reading examples/sample-series.csv,
 * so the UI can build and render real shapes. Will be swapped to the
 * Prisma-backed implementation (standings-db.ts) once persistence lands.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { importCsv } from '../import/import'
import { rankSeries } from '../ranking/engine'
import type { ArcherEntry } from '../ranking/types'
import { slugify } from './slug'
import type { ArcherDetail, SeriesStandings, SeriesSummary } from './types'

function loadSample(): ReturnType<typeof importCsv> {
  const csvPath = path.join(process.cwd(), 'examples', 'sample-series.csv')
  return importCsv(readFileSync(csvPath, 'utf8'))
}

function summarize(name: string, roundFormat: string, entries: ArcherEntry[]): SeriesSummary {
  const eventIds = new Set(entries.flatMap((e) => e.scores.map((s) => s.eventId)))
  return {
    slug: slugify(name),
    name,
    roundFormat,
    eventCount: eventIds.size,
    archerCount: new Set(entries.map((e) => e.usaArcheryNo)).size,
  }
}

export async function listSeries(): Promise<SeriesSummary[]> {
  const data = loadSample()
  return [...data.entriesBySeries.entries()].map(([name, entries]) =>
    summarize(name, data.roundFormatBySeries.get(name) ?? '?', entries),
  )
}

export async function getSeriesStandings(slug: string): Promise<SeriesStandings | null> {
  const data = loadSample()
  for (const [name, entries] of data.entriesBySeries) {
    if (slugify(name) !== slug) continue
    const boards = [...rankSeries(entries).entries()].map(([key, rankings]) => ({
      key,
      segment: rankings[0]?.segment ?? { division: '?', gender: '?', ageClass: '?' },
      rankings,
    }))
    return { series: summarize(name, data.roundFormatBySeries.get(name) ?? '?', entries), boards }
  }
  return null
}

export async function getArcherDetail(
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
