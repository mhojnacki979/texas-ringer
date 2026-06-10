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
    // Identical totals and counted scores; A shot more 7s.
    const aArrows = [7, 7, 7, 9, 9, 9]
    const bArrows = [7, 9, 9, 9, 9, 9]
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
})
