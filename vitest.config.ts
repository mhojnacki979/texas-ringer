import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // DB tests run against remote Railway Postgres; WAN latency over ~40
    // sequential upserts needs more than the 5s default.
    testTimeout: 30_000,
  },
})
