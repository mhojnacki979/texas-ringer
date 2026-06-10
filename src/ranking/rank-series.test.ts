import { describe, it, expect } from 'vitest'
import { rankSeries, segmentKey } from './engine.js'
import type { ArcherEntry, EventScore } from './types.js'

function s(total: number, eventId: string): EventScore {
  return { eventId, eventName: eventId, eventDate: '2026-01-01', total }
}

function entry(no: string, division: string, gender: string, ageClass: string, totals: number[]): ArcherEntry {
  return {
    usaArcheryNo: no,
    name: no,
    segment: { division, gender, ageClass },
    scores: totals.map((t, i) => s(t, `${no}-E${i}`)),
  }
}

describe('rankSeries', () => {
  it('buckets entries into separate segment leaderboards and ranks each independently', () => {
    const result = rankSeries([
      entry('A', 'Compound', 'Male', 'Senior', [290, 291, 292]),
      entry('B', 'Compound', 'Male', 'Senior', [280, 281, 282]),
      entry('C', 'Recurve', 'Female', 'Cub', [200, 201, 202]),
    ])

    const cms = result.get(segmentKey({ division: 'Compound', gender: 'Male', ageClass: 'Senior' }))!
    expect(cms.map((r) => r.usaArcheryNo)).toEqual(['A', 'B'])
    expect(cms[0]!.rank).toBe(1)

    const rfc = result.get(segmentKey({ division: 'Recurve', gender: 'Female', ageClass: 'Cub' }))!
    expect(rfc).toHaveLength(1)
    expect(rfc[0]!.usaArcheryNo).toBe('C')
  })
})
