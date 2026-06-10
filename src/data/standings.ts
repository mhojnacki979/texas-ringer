/**
 * Data-access entry point for the public site (see types.ts for the contract).
 *
 * Backed by the Prisma (Postgres) implementation. Seed or update data with:
 *   pnpm db:import <path-to.csv>
 */
export { listSeries, getSeriesStandings, getArcherDetail } from './standings-db'
