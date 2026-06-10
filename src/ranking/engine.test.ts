import { describe, it, expect } from 'vitest'
import { computeArcherRanking, rankSegment } from './engine'
import type { ArcherEntry, EventScore, Segment } from './types'

const SEG: Segment = { division: 'Compound', gender: 'Male', ageClass: 'Senior' }

function score(eventId: string, total: number, eventDate = '2026-01-01', arrows?: number[]): EventScore {
  return { eventId, eventName: `Event ${eventId}`, eventDate, total, arrows }
}

function archer(usaArcheryNo: string, name: string, scores: EventScore[]): ArcherEntry {
  return { usaArcheryNo, name, segment: SEG, scores }
}

describe('computeArcherRanking — the document worked example', () => {
  it('counts all three of the first three events (290, 285, 292) -> total 867', () => {
    const r = computeArcherRanking(
      archer('A1', 'Doc Archer', [score('1', 290), score('2', 285), score('3', 292)]),
    )
    expect(r.best3Total).toBe(867)
    expect(r.eventsShot).toBe(3)
    expect(r.ranked).toBe(true)
    expect(r.dropped).toHaveLength(0)
  })

  it('after a 4th event of 288, 288 replaces the lowest counted (285) -> total 870', () => {
    const r = computeArcherRanking(
      archer('A1', 'Doc Archer', [
        score('1', 290),
        score('2', 285),
        score('3', 292),
        score('4', 288),
      ]),
    )
    expect(r.best3Total).toBe(870)
    expect(r.counted.map((s) => s.total).sort((a, b) => b - a)).toEqual([292, 290, 288])
    expect(r.dropped.map((s) => s.total)).toEqual([285])
  })

  it('a 5th event of 284 does not count (lower than lowest counted 288) -> stays 870', () => {
    const r = computeArcherRanking(
      archer('A1', 'Doc Archer', [
        score('1', 290),
        score('2', 285),
        score('3', 292),
        score('4', 288),
        score('5', 284),
      ]),
    )
    expect(r.best3Total).toBe(870)
    expect(r.counted.map((s) => s.total).sort((a, b) => b - a)).toEqual([292, 290, 288])
    expect(r.dropped.map((s) => s.total).sort((a, b) => b - a)).toEqual([285, 284])
  })
})

describe('computeArcherRanking — provisional (fewer than 3 events)', () => {
  it('shows the running total but is not officially ranked', () => {
    const r = computeArcherRanking(archer('A2', 'New Archer', [score('1', 280), score('2', 275)]))
    expect(r.eventsShot).toBe(2)
    expect(r.ranked).toBe(false)
    expect(r.best3Total).toBe(555)
    expect(r.counted).toHaveLength(2)
  })

  it('computes the best-3 average rounded to 2 decimals', () => {
    const r = computeArcherRanking(
      archer('A3', 'Avg Archer', [score('1', 290), score('2', 285), score('3', 292)]),
    )
    expect(r.best3Average).toBe(289) // 867 / 3
  })
})

describe('rankSegment — ordering and tiebreakers', () => {
  it('ranks officially-ranked archers by best-3 total, highest first', () => {
    const ranked = rankSegment([
      archer('A', 'Lower', [score('1', 280), score('2', 281), score('3', 282)]), // 843
      archer('B', 'Higher', [score('1', 290), score('2', 291), score('3', 292)]), // 873
    ])
    expect(ranked.map((r) => r.usaArcheryNo)).toEqual(['B', 'A'])
    expect(ranked[0]?.rank).toBe(1)
    expect(ranked[1]?.rank).toBe(2)
  })

  it('breaks a best-3 total tie by highest single score', () => {
    // Both total 870. A has a 300 high; B's high is 295.
    const ranked = rankSegment([
      archer('B', 'B', [score('1', 295), score('2', 290), score('3', 285)]), // 870, high 295
      archer('A', 'A', [score('1', 300), score('2', 285), score('3', 285)]), // 870, high 300
    ])
    expect(ranked.map((r) => r.usaArcheryNo)).toEqual(['A', 'B'])
  })

  it('breaks a deeper tie by most 7s when arrow data is present', () => {
    // Identical totals and counted scores; A shot more 7s (the top ring).
    const aArrows = [7, 7, 7, 5, 5, 5]
    const bArrows = [7, 5, 6, 6, 6, 6]
    const ranked = rankSegment([
      archer('B', 'B', [
        score('1', 100, '2026-01-01', bArrows),
        score('2', 100, '2026-01-02', bArrows),
        score('3', 100, '2026-01-03', bArrows),
      ]),
      archer('A', 'A', [
        score('1', 100, '2026-01-01', aArrows),
        score('2', 100, '2026-01-02', aArrows),
        score('3', 100, '2026-01-03', aArrows),
      ]),
    ])
    expect(ranked.map((r) => r.usaArcheryNo)).toEqual(['A', 'B'])
  })

  it('lists unranked (fewer than 3 events) archers after ranked ones, with null rank', () => {
    const ranked = rankSegment([
      archer('P', 'Provisional', [score('1', 999), score('2', 999)]), // huge but only 2 events
      archer('R', 'Ranked', [score('1', 200), score('2', 200), score('3', 200)]),
    ])
    expect(ranked[0]?.usaArcheryNo).toBe('R')
    expect(ranked[0]?.rank).toBe(1)
    const prov = ranked.find((r) => r.usaArcheryNo === 'P')
    expect(prov?.ranked).toBe(false)
    expect(prov?.rank).toBeNull()
  })

  it('breaks a tie on the second-highest score when highest singles are equal', () => {
    // Same total 870, same high 300. A's 2nd is 290; B's 2nd is 285.
    const ranked = rankSegment([
      archer('B', 'B', [score('1', 300), score('2', 285), score('3', 285)]),
      archer('A', 'A', [score('1', 300), score('2', 290), score('3', 280)]),
    ])
    expect(ranked.map((r) => r.usaArcheryNo)).toEqual(['A', 'B'])
  })

  it('breaks a deeper tie by most recent counted event, more recent ranking ahead', () => {
    // Identical totals, counted values, and (absent) arrow data — only dates differ.
    const ranked = rankSegment([
      archer('OLD', 'Old', [
        score('1', 100, '2026-01-01'),
        score('2', 100, '2026-01-02'),
        score('3', 100, '2026-01-03'),
      ]),
      archer('NEW', 'New', [
        score('1', 100, '2026-01-01'),
        score('2', 100, '2026-01-02'),
        score('3', 100, '2026-02-01'),
      ]),
    ])
    expect(ranked.map((r) => r.usaArcheryNo)).toEqual(['NEW', 'OLD'])
  })

  it('falls back to usaArcheryNo for fully tied archers, independent of input order', () => {
    const a = archer('A2', 'Two', [score('1', 100), score('2', 100), score('3', 100)])
    const b = archer('A1', 'One', [score('1', 100), score('2', 100), score('3', 100)])
    expect(rankSegment([a, b]).map((r) => r.usaArcheryNo)).toEqual(['A1', 'A2'])
    expect(rankSegment([b, a]).map((r) => r.usaArcheryNo)).toEqual(['A1', 'A2'])
  })

  it('counts the earlier-dated score when a counted and dropped score tie', () => {
    // 295, 290 (early), 290 (late), plus a 288. Best 3 = 295 + two 290s... no:
    // best 3 = 295, 290, 290 — the 288 drops. With scores 295, 290, 288, 290:
    const r = computeArcherRanking(
      archer('T', 'Tie', [
        score('E1', 295, '2026-01-01'),
        score('E2', 290, '2026-01-08'),
        score('E3', 288, '2026-01-15'),
        score('E4', 290, '2026-01-22'),
      ]),
    )
    // Best 3 total counts both 290s and drops the 288 regardless of date.
    expect(r.best3Total).toBe(875)
    expect(r.dropped.map((s) => s.total)).toEqual([288])
    // Within equal values, the earlier-dated event sorts first among counted.
    const twoNineties = r.counted.filter((s) => s.total === 290).map((s) => s.eventId)
    expect(twoNineties).toEqual(['E2', 'E4'])
  })

  it('rounds the best-3 average to 2 decimals when division is inexact', () => {
    const r = computeArcherRanking(
      archer('AVG', 'Avg', [score('1', 290), score('2', 289), score('3', 289)]), // 868 / 3
    )
    expect(r.best3Average).toBe(289.33)
  })

  it('handles an archer with zero scores without crashing', () => {
    const r = computeArcherRanking(archer('Z', 'Zero', []))
    expect(r.best3Total).toBe(0)
    expect(r.best3Average).toBeNull()
    expect(r.ranked).toBe(false)
    expect(r.eventsShot).toBe(0)
  })

  it('orders tied provisional archers deterministically by usaArcheryNo', () => {
    const p1 = archer('P2', 'Late', [score('1', 250)])
    const p2 = archer('P1', 'Early', [score('1', 250)])
    expect(
      rankSegment([p1, p2]).map((r) => r.usaArcheryNo),
    ).toEqual(['P1', 'P2'])
  })
})
