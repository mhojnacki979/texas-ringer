import { readFileSync } from 'node:fs'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { importScoresFromCsv } from './import-scores'
import { createTestDb, hasTestDb, type TestDb } from './test-db'

const sampleCsv = readFileSync(
  path.join(process.cwd(), 'examples', 'sample-series.csv'),
  'utf8',
)

// Runs only when TEST_DATABASE_URL (Postgres) is set; each run gets an isolated schema.
describe.runIf(hasTestDb())('importScoresFromCsv', () => {
  let db: TestDb

  beforeAll(() => {
    db = createTestDb()
  })

  afterAll(async () => {
    await db.dispose()
  })

  it('persists series, events, and scores from the sample CSV', async () => {
    const summary = await importScoresFromCsv(sampleCsv, db.client)

    expect(summary.seriesImported).toBe(1)
    expect(summary.rowsImported).toBe(13)
    expect(summary.errors).toEqual([])

    expect(await db.client.series.count()).toBe(1)
    expect(await db.client.event.count()).toBe(5)
    expect(await db.client.score.count()).toBe(13)

    const series = await db.client.series.findUnique({ where: { slug: 'spring-2026' } })
    expect(series?.name).toBe('Spring 2026')
    expect(series?.roundFormat).toBe('300')
  })

  it('is idempotent: re-importing the same CSV creates no duplicates', async () => {
    const summary = await importScoresFromCsv(sampleCsv, db.client)

    expect(summary.rowsImported).toBe(13)
    expect(await db.client.series.count()).toBe(1)
    expect(await db.client.event.count()).toBe(5)
    expect(await db.client.score.count()).toBe(13)
  })

  it('updates an existing score total instead of duplicating it', async () => {
    const updated = sampleCsv.replace(
      'Spring 2026,300,USA200,Robin Hood,Compound,Male,Senior,E1,Indoor Open,2026-01-10,295,',
      'Spring 2026,300,USA200,Robin Hood,Compound,Male,Senior,E1,Indoor Open,2026-01-10,299,',
    )
    await importScoresFromCsv(updated, db.client)

    expect(await db.client.score.count()).toBe(13)
    const score = await db.client.score.findFirst({
      where: { usaArcheryNo: 'USA200', event: { externalId: 'E1' } },
    })
    expect(score?.total).toBe(299)

    // Restore original state for any later assertions.
    await importScoresFromCsv(sampleCsv, db.client)
  })

  it('surfaces validation errors from importCsv without writing bad rows', async () => {
    const before = await db.client.score.count()
    const summary = await importScoresFromCsv('not,a,valid\nheader,row,here\n', db.client)

    expect(summary.seriesImported).toBe(0)
    expect(summary.rowsImported).toBe(0)
    expect(summary.errors.length).toBeGreaterThan(0)
    expect(await db.client.score.count()).toBe(before)
  })

  it('persists arrow values as space-separated strings round-trippable to numbers', async () => {
    const withArrows = [
      'series,round_format,usa_archery_no,archer_name,division,gender,age_class,event_id,event_name,event_date,total_score,arrows',
      'Arrow Series,420,USA900,Fletch Tester,Barebow,Men,Adults,A1,Arrow Open,2026-02-01,38,7 7 6 6 5 4 3',
    ].join('\n')
    await importScoresFromCsv(withArrows, db.client)

    const score = await db.client.score.findFirst({
      where: { usaArcheryNo: 'USA900' },
    })
    expect(score?.arrows).toBe('7 7 6 6 5 4 3')
  })
})
