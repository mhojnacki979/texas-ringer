/**
 * Test-only helper: provision an isolated temp SQLite database with the
 * current Prisma schema pushed, so tests never touch (or depend on) dev.db.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'

export interface TestDb {
  client: PrismaClient
  /** Disconnect and delete the temp database. */
  dispose: () => Promise<void>
}

export function createTestDb(): TestDb {
  const dir = mkdtempSync(path.join(tmpdir(), 'series-rankings-test-'))
  const url = `file:${path.join(dir, 'test.db')}`

  execFileSync('npx', ['prisma', 'db', 'push', '--skip-generate'], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe',
  })

  const client = new PrismaClient({ datasourceUrl: url })
  return {
    client,
    dispose: async () => {
      await client.$disconnect()
      rmSync(dir, { recursive: true, force: true })
    },
  }
}
