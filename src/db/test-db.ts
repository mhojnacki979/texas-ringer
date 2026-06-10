/**
 * Test-only helper: provision an isolated Postgres schema (unique per run)
 * with the current Prisma schema pushed, so tests never touch dev/prod data.
 *
 * Requires TEST_DATABASE_URL (a Postgres connection string). DB test suites
 * are skipped entirely when it is not set — see hasTestDb.
 */
import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { PrismaClient } from '@prisma/client'

export interface TestDb {
  client: PrismaClient
  /** Drop the isolated schema and disconnect. */
  dispose: () => Promise<void>
}

export function hasTestDb(): boolean {
  const url = process.env.TEST_DATABASE_URL
  return url !== undefined && url !== ''
}

export function createTestDb(): TestDb {
  const base = process.env.TEST_DATABASE_URL
  if (base === undefined || base === '') {
    throw new Error('TEST_DATABASE_URL must be set to run database tests')
  }

  const schema = `test_${randomBytes(6).toString('hex')}`
  const url = new URL(base)
  url.searchParams.set('schema', schema)
  const dbUrl = url.toString()

  execFileSync('npx', ['prisma', 'db', 'push', '--skip-generate'], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: 'pipe',
  })

  const client = new PrismaClient({ datasourceUrl: dbUrl })
  return {
    client,
    dispose: async () => {
      await client.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
      await client.$disconnect()
    },
  }
}
