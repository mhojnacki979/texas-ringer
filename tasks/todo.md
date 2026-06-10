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

## Audit fixes (swarm audit 2026-06-09) — fix all
- [x] A. CSV parser: BOM strip, CR-only row endings, unterminated-quote + trailing-after-quote diagnostics
- [x] B. Schema: strict total_score (no empty->0), real calendar dates, usa_archery_no normalization (zero-width strip + uppercase)
- [x] C. Import: duplicate headers, slug collisions, conflicting event metadata, all Zod issues per row, arrows 0-12 + must sum to total, total capped by numeric round_format
- [x] D. DB: wrap each series import in a transaction
- [x] E. Engine: structural segment bucketing (no delimiter collision), deterministic final tiebreak (usa no), tests for recent-event direction / 2nd-3rd tiebreaks / boundary ties / avg rounding / empty scores
- [x] F. Auth: login rate limit + failure delay, login body cap, sec-fetch-site guard on cookie paths, double-HMAC safeEqual, strict token parse, __Host- cookie prefix in prod
- [x] G. Routes: byte-accurate 2MB cap, /api/health (no DB)
- [x] H. Deploy: healthcheck -> /api/health, packageManager + node 20.x pins + .nvmrc, boot-time env assertion, removed 2 empty migration dirs (+ prod migration-table cleanup), README de-SQLite
- [x] I. Full validation + deploy + prod smoke — 59 tests green; prod verified:
       login redirects, __Host- cookie, session import (1579 rows), cross-site
       cookie 401, bearer unaffected, lockout engages after 5 failures

Deliberately NOT changed (spec questions, not bugs — confirm with Michael):
- Tied archers get distinct ranks (1,2) not shared (T-1); now deterministic by USA number
- Recency/most-7s tiebreakers consider counted scores only (dropped events give no credit)
- Missing arrow data = zero 7s in the tiebreaker (asymmetric across mixed-capture events)

## Production notes
- Prod secrets: PROD_ADMIN_PASSWORD / PROD_ADMIN_TOKEN stored in local .env (rotated
  after a CLI echo leak; the leaked values are dead)
- Local dev + tests point DATABASE_URL/TEST_DATABASE_URL at the Railway Postgres
  public URL; tests isolate via per-run schemas. Consider local docker postgres later.

## CSV format (one row per archer per event)
series, round_format, usa_archery_no, archer_name, division, gender, age_class,
event_id, event_name, event_date (YYYY-MM-DD), total_score, arrows (optional; e.g. "10 9 9 7")
