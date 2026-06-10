# Eyes on Score — Series Rankings Site

Standalone public read-only leaderboard that aggregates completed scores from
EyesonScore into "best 3 of N" series rankings.

## Locked decisions
- Standalone Next.js + Prisma + Postgres site (own DB, never writes to EyesonScore)
- Archer identity = USA Archery number (exact match across events)
- Segmentation = division x gender x age class
- Visibility = public read-only (admin/series-config separate)
- Data pipeline = MANUAL CSV IMPORT for now (auto-pull/webhooks deferred; same import boundary)
- One round format locked per series (best-3 totals comparable)
- Per-arrow data available -> "most 7s" tiebreaker is buildable

## Ranking rule (from spec)
- Archer needs >= 3 events in a series for an official rank.
- Ranking score = sum of best 3 scores.
- New score replaces lowest counted only if higher; else recorded, not counted.
- Per archer: best-3 total, best-3 avg, events shot, counted[], dropped[].
- Sort: best-3 total -> highest single -> 2nd -> 3rd -> most 7s -> most recent.

## Phases
- [x] 1. Ranking engine (TDD) — pure functions, proven against doc example (867 -> 870, Event 5 drops)
- [x] 2. Repo scaffold — pnpm + TS + Vitest config
- [x] 3. CSV import (TDD) — quote-aware parser + Zod row validation + group into ArcherEntry per segment
- [x] 4. rankSeries — split entries by segment, rank each; CLI to import a CSV and print standings
- [x] 5. Prisma persistence — SQLite (Postgres-compatible schema), Series/Event/Score models,
       idempotent `pnpm db:import <csv>`, DB-backed data contract (standings computed on read;
       RankingSnapshot deferred until data volume demands it)
- [x] 6. Public UI — series index, leaderboard (segment switcher), archer detail, branded 404
- [x] 7. Admin path — /admin upload page + token-protected POST /api/import
       (Bearer ADMIN_TOKEN, multipart or raw text/csv — raw body is the future webhook entry)
- [x] 7b. Admin login — /admin/login (ADMIN_PASSWORD) sets HMAC-signed httpOnly session
       cookie (SESSION_SECRET, 7-day TTL); /admin gated; footer Admin link; logout
- [x] 8. Deploy — Railway project "texas-ringer" (web + Postgres-TvgT), GitHub auto-deploy
       from mhojnacki979/texas-ringer, live at https://web-production-1fe80.up.railway.app
- [ ] 8b. Domain — add www.eyesonscore.biz in Railway dashboard (CLI token lacks scope),
       then HostGator: CNAME www -> Railway target + 301 redirect apex -> www
- [ ] 9. LATER: auto-pull / webhooks from EyesonScore behind the same import boundary

## Production notes
- Prod secrets: PROD_ADMIN_PASSWORD / PROD_ADMIN_TOKEN stored in local .env (rotated
  after a CLI echo leak; the leaked values are dead)
- Local dev + tests point DATABASE_URL/TEST_DATABASE_URL at the Railway Postgres
  public URL; tests isolate via per-run schemas. Consider local docker postgres later.

## CSV format (one row per archer per event)
series, round_format, usa_archery_no, archer_name, division, gender, age_class,
event_id, event_name, event_date (YYYY-MM-DD), total_score, arrows (optional; e.g. "10 9 9 7")
