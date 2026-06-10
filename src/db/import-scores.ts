/**
 * Persist a CSV import into the database.
 *
 * Delegates ALL parsing/validation to the existing importCsv() boundary, then
 * writes the result with upserts keyed on the schema's natural unique
 * constraints — re-importing the same CSV is fully idempotent (no duplicates;
 * changed totals/names update in place).
 */
import type { Prisma, PrismaClient } from '@prisma/client'
import { importCsv, type ImportError } from '../import/import'
import type { ArcherEntry } from '../ranking/types'
import { slugify } from '../data/slug'
import { prisma } from './client'

/** persistSeries runs inside a transaction; tests may pass a bare client. */
type Db = PrismaClient | Prisma.TransactionClient

export interface DbImportSummary {
  seriesImported: number
  rowsImported: number
  errors: ImportError[]
}

/** Distinct events referenced by a series' entries, keyed by external event id. */
function collectEvents(entries: ArcherEntry[]): Map<string, { name: string; date: string }> {
  const events = new Map<string, { name: string; date: string }>()
  for (const entry of entries) {
    for (const score of entry.scores) {
      events.set(score.eventId, { name: score.eventName, date: score.eventDate })
    }
  }
  return events
}

async function persistSeries(
  db: Db,
  name: string,
  roundFormat: string,
  entries: ArcherEntry[],
): Promise<number> {
  const series = await db.series.upsert({
    where: { slug: slugify(name) },
    create: { slug: slugify(name), name, roundFormat },
    update: { name, roundFormat },
  })

  const eventIdByExternal = new Map<string, string>()
  for (const [externalId, meta] of collectEvents(entries)) {
    const event = await db.event.upsert({
      where: { seriesId_externalId: { seriesId: series.id, externalId } },
      create: { seriesId: series.id, externalId, name: meta.name, date: meta.date },
      update: { name: meta.name, date: meta.date },
    })
    eventIdByExternal.set(externalId, event.id)
  }

  let rows = 0
  for (const entry of entries) {
    for (const score of entry.scores) {
      const eventId = eventIdByExternal.get(score.eventId)
      if (eventId === undefined) continue // unreachable: events collected from these scores
      await db.score.upsert({
        where: {
          eventId_usaArcheryNo_division_gender_ageClass: {
            eventId,
            usaArcheryNo: entry.usaArcheryNo,
            division: entry.segment.division,
            gender: entry.segment.gender,
            ageClass: entry.segment.ageClass,
          },
        },
        create: {
          seriesId: series.id,
          eventId,
          usaArcheryNo: entry.usaArcheryNo,
          archerName: entry.name,
          division: entry.segment.division,
          gender: entry.segment.gender,
          ageClass: entry.segment.ageClass,
          total: score.total,
          arrows: score.arrows?.join(' ') ?? '',
        },
        update: {
          archerName: entry.name,
          total: score.total,
          arrows: score.arrows?.join(' ') ?? '',
        },
      })
      rows++
    }
  }
  return rows
}

/** Import CSV text into the database. Pass a client override for tests. */
export async function importScoresFromCsv(
  csvText: string,
  db: PrismaClient = prisma,
): Promise<DbImportSummary> {
  const result = importCsv(csvText)

  let seriesImported = 0
  let rowsImported = 0
  for (const [name, entries] of result.entriesBySeries) {
    const roundFormat = result.roundFormatBySeries.get(name) ?? '?'
    // Atomic per series: a mid-import failure leaves no partially-written
    // series live in the rankings.
    rowsImported += await db.$transaction(
      (tx) => persistSeries(tx, name, roundFormat, entries),
      { timeout: 120_000, maxWait: 10_000 },
    )
    seriesImported++
  }

  return { seriesImported, rowsImported, errors: result.errors }
}
