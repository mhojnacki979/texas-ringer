/**
 * CLI: import a CSV of completed scores and print series standings.
 *
 *   pnpm standings <path-to.csv>
 *
 * Read-only and offline — parses, validates, ranks, and prints. Persisting to a
 * database (Prisma) is a later phase; this proves the pipeline works now.
 */
import { readFileSync } from 'node:fs'
import { importCsv } from '../src/import/import'
import { rankSeries, segmentKey } from '../src/ranking/engine'

const path = process.argv[2]
if (path === undefined) {
  console.error('Usage: pnpm standings <path-to.csv>')
  process.exit(1)
}

const text = readFileSync(path, 'utf8')
const result = importCsv(text)

console.log(`\nImported ${result.rowCount} score row(s).`)

if (result.errors.length > 0) {
  console.log(`\n${result.errors.length} error(s):`)
  for (const e of result.errors) {
    console.log(`  line ${e.line}: ${e.message}`)
  }
}

for (const [series, entries] of result.entriesBySeries) {
  const format = result.roundFormatBySeries.get(series) ?? '?'
  console.log(`\n=== Series: ${series}  (round: ${format}) ===`)

  const segments = rankSeries(entries)
  for (const [, rankings] of segments) {
    const seg = rankings[0]?.segment
    const label = seg ? segmentKey(seg) : '(empty segment)'
    console.log(`\n  ${label}`)
    console.log('  Rank  Archer                USA#       Best3   Avg     Events  Counted')
    for (const r of rankings) {
      const rank = r.rank === null ? 'prov' : String(r.rank)
      const counted = r.counted.map((s) => s.total).sort((a, b) => b - a).join('/')
      console.log(
        `  ${rank.padEnd(5)} ${r.name.padEnd(20)} ${r.usaArcheryNo.padEnd(10)} ` +
          `${String(r.best3Total).padEnd(7)} ${String(r.best3Average ?? '-').padEnd(7)} ` +
          `${String(r.eventsShot).padEnd(7)} ${counted}`,
      )
    }
  }
}

console.log('')
