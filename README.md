# The Texas Ringer — Series Rankings

Standalone public leaderboard ("The Texas Ringer") that aggregates completed
tournament scores from Eyes on Score into **best-3-of-N** series rankings.

An archer needs at least **3 events** in a series to be officially ranked. Their
ranking total is the sum of their **best 3 scores**; additional events only count
if they beat the current lowest counted score. Leaderboards are segmented by
**division × gender × age class**, and archers are matched across events by their
**USA Archery number**.

## Status

- ✅ Ranking engine (best-3, tiebreakers, provisional handling) — fully tested
- ✅ CSV import (parse + validate + group + rank) — fully tested
- ✅ Persistence — Prisma + SQLite (Postgres-compatible schema), idempotent CSV import
- ✅ Public web UI — Next.js 15: series index, segmented leaderboards, archer detail
- ✅ Admin upload — `/admin` page + token-protected `POST /api/import`
- ⏳ Railway deploy, auto-pull from Eyes on Score

Data is imported manually via CSV for now. Automated pull/webhooks from Eyes on
Score will plug in behind the same import boundary later.

## Usage

```bash
pnpm install
pnpm db:generate                # generate the Prisma client
pnpm db:migrate                 # create/update the local SQLite db
pnpm db:import <path-to.csv>    # import scores into the database (idempotent)
pnpm dev                        # run the site at http://localhost:3000

pnpm test                       # run the suite
pnpm standings <path-to.csv>    # offline: rank a CSV and print standings (no db)
pnpm standings examples/sample-series.csv
```

## Admin import

Set `ADMIN_TOKEN` in `.env` (see `.env.example`). Then either:

- **Browser:** visit `/admin`, paste the token, pick a CSV, import.
- **API:** `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -F "file=@scores.csv" <site>/api/import`
  (a raw `text/csv` body also works — this is the future webhook entry point).

Responses include rows imported and any skipped rows with line numbers.

## CSV format

One row per archer per event. Header required; column order does not matter.

| Column | Required | Notes |
|---|---|---|
| `series` | yes | Series name; groups events together |
| `round_format` | yes | Must be identical for every row in a series (e.g. `300`) |
| `usa_archery_no` | yes | Stable archer identity across events |
| `archer_name` | yes | Display name |
| `division` | yes | e.g. `Compound`, `Recurve`, `Barebow` |
| `gender` | yes | e.g. `Male`, `Female` |
| `age_class` | yes | e.g. `Senior`, `Cub`, `Master` |
| `event_id` | yes | Unique per tournament; dedupes per archer |
| `event_name` | yes | Display name |
| `event_date` | yes | ISO `YYYY-MM-DD` |
| `total_score` | yes | Whole number |
| `arrows` | no | Space/semicolon-separated arrow values (e.g. `10 9 9 7`); enables the "most 7s" tiebreaker |

See [`examples/sample-series.csv`](examples/sample-series.csv).

## Ranking & tiebreakers

Sort order within a segment: best-3 total → highest single → 2nd → 3rd →
most 7s (when arrow data present) → most recent event.

## Layout

```
src/ranking/   pure ranking engine (no I/O)
src/import/    CSV parse + Zod validation + grouping
scripts/       CLI entry points
examples/      sample CSV
```
