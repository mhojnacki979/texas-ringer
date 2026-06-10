/**
 * CLI: pnpm db:import <path-to.csv>
 * Reads a CSV file, persists it via the idempotent DB import, prints a summary.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { prisma } from '../src/db/client'
import { importScoresFromCsv } from '../src/db/import-scores'

async function main(): Promise<void> {
  const file = process.argv[2]
  if (file === undefined) {
    console.error('usage: pnpm db:import <path-to.csv>')
    process.exitCode = 1
    return
  }

  const text = readFileSync(path.resolve(file), 'utf8')
  const summary = await importScoresFromCsv(text)

  console.log(`series imported: ${summary.seriesImported}`)
  console.log(`rows imported:   ${summary.rowsImported}`)
  if (summary.errors.length > 0) {
    console.log(`errors (${summary.errors.length}):`)
    for (const err of summary.errors) {
      console.log(`  line ${err.line}: ${err.message}`)
    }
  }

  const [seriesCount, eventCount, scoreCount] = await Promise.all([
    prisma.series.count(),
    prisma.event.count(),
    prisma.score.count(),
  ])
  console.log(`db totals: ${seriesCount} series, ${eventCount} events, ${scoreCount} scores`)
}

main()
  .catch((err: unknown) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
