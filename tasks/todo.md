# Eyes on Score — Series Rankings Site

Standalone public read-only leaderboard that aggregates completed scores from
EyesonScore into "best 3 of N" series rankings.

## Locked decisions
- Standalone Next.js + Prisma + Postgres site (own DB, never writes to EyesonScore)
- Archer identity = USA Archery number (exact match across events)
- Segmentation = division x gender x age class
- Visibility = public read-only (admin/series-config separate)
- Data pipeline = scheduled pull from an EyesonScore read-only export endpoint
- One round format locked per series (best-3 totals comparable)
- Per-arrow data available -> "most 7s" tiebreaker is buildable

## Ranking rule (from spec)
- Archer needs >= 3 events in a series for an official rank.
- Ranking score = sum of best 3 scores.
- New score replaces lowest counted only if higher; else recorded, not counted.
- Per archer: best-3 total, best-3 avg, events shot, counted[], dropped[].
- Sort: best-3 total -> highest single -> 2nd -> 3rd -> most 7s -> most recent.

## Phases
- [ ] 1. Ranking engine (TDD) — pure functions, proven against doc example (867 -> 870, Event 5 drops)
- [ ] 2. Repo scaffold — pnpm + TS + Vitest config
- [ ] 3. Prisma schema — Series, SeriesEvent, ImportedScore, RankingSnapshot
- [ ] 4. Scheduled pull job — import completed scores from EyesonScore export
- [ ] 5. Compute pipeline — engine over ImportedScore -> RankingSnapshot
- [ ] 6. Public UI — series index, leaderboard (segment switcher), archer detail
- [ ] 7. Admin path — create series, assign events (seeded config ok to start)

## External dependency
- EyesonScore must expose a read-only export endpoint returning completed scores:
  usa_archery_no, archer_name, division, gender, age_class, tournament_id,
  tournament_name, event_date, round_format, total_score, arrow_values
  (or count_of_7s + x_count), finalized_at
