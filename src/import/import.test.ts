import { describe, it, expect } from 'vitest'
import { importCsv } from './import.js'

const HEADER =
  'series,round_format,usa_archery_no,archer_name,division,gender,age_class,event_id,event_name,event_date,total_score,arrows'

function row(parts: Partial<Record<string, string>>): string {
  const d: Record<string, string> = {
    series: 'Spring 2026',
    round_format: '300',
    usa_archery_no: 'USA100',
    archer_name: 'Doc Archer',
    division: 'Compound',
    gender: 'Male',
    age_class: 'Senior',
    event_id: 'E1',
    event_name: 'Event 1',
    event_date: '2026-01-01',
    total_score: '290',
    arrows: '',
    ...parts,
  }
  return [
    d.series, d.round_format, d.usa_archery_no, d.archer_name, d.division, d.gender,
    d.age_class, d.event_id, d.event_name, d.event_date, d.total_score, d.arrows,
  ].join(',')
}

describe('importCsv — happy path', () => {
  it('groups one archer\'s events into a single entry under the series', () => {
    const csv = [
      HEADER,
      row({ event_id: 'E1', total_score: '290' }),
      row({ event_id: 'E2', total_score: '285' }),
      row({ event_id: 'E3', total_score: '292' }),
    ].join('\n')

    const result = importCsv(csv)
    expect(result.errors).toEqual([])
    expect(result.rowCount).toBe(3)

    const entries = result.entriesBySeries.get('Spring 2026')!
    expect(entries).toHaveLength(1)
    expect(entries[0]!.usaArcheryNo).toBe('USA100')
    expect(entries[0]!.scores.map((s) => s.total).sort((a, b) => a - b)).toEqual([285, 290, 292])
    expect(result.roundFormatBySeries.get('Spring 2026')).toBe('300')
  })

  it('parses the arrows column into per-arrow integers', () => {
    const csv = [HEADER, row({ arrows: '10 9 9 7' })].join('\n')
    const entries = importCsv(csv).entriesBySeries.get('Spring 2026')!
    expect(entries[0]!.scores[0]!.arrows).toEqual([10, 9, 9, 7])
  })

  it('keeps the same archer in two divisions as two separate entries', () => {
    const csv = [
      HEADER,
      row({ division: 'Compound', event_id: 'E1' }),
      row({ division: 'Recurve', event_id: 'E1' }),
    ].join('\n')
    const entries = importCsv(csv).entriesBySeries.get('Spring 2026')!
    expect(entries).toHaveLength(2)
  })
})

describe('importCsv — validation', () => {
  it('reports an error with the line number for a bad date, and skips the row', () => {
    const csv = [HEADER, row({ event_date: '01/02/2026' })].join('\n')
    const result = importCsv(csv)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]!.line).toBe(2)
    expect(result.errors[0]!.message).toMatch(/event_date/)
  })

  it('reports an error for a non-numeric total score', () => {
    const csv = [HEADER, row({ total_score: 'NaN' })].join('\n')
    expect(importCsv(csv).errors[0]!.message).toMatch(/total_score/)
  })

  it('flags a series that mixes round formats (must be locked to one)', () => {
    const csv = [
      HEADER,
      row({ event_id: 'E1', round_format: '300' }),
      row({ event_id: 'E2', round_format: '720' }),
    ].join('\n')
    const result = importCsv(csv)
    expect(result.errors.some((e) => /round_format|format/i.test(e.message))).toBe(true)
  })

  it('flags a missing required header', () => {
    const csv = ['series,round_format,usa_archery_no\nSpring,300,USA100'].join('\n')
    const result = importCsv(csv)
    expect(result.errors.some((e) => /header/i.test(e.message))).toBe(true)
  })

  it('flags a duplicate event for the same archer', () => {
    const csv = [
      HEADER,
      row({ event_id: 'E1', total_score: '290' }),
      row({ event_id: 'E1', total_score: '288' }),
    ].join('\n')
    const result = importCsv(csv)
    expect(result.errors.some((e) => /duplicate/i.test(e.message))).toBe(true)
  })
})
