import { describe, it, expect } from 'vitest'
import { parseCsv } from './csv.js'

describe('parseCsv', () => {
  it('parses a simple header + rows', () => {
    expect(parseCsv('a,b,c\n1,2,3\n4,5,6')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
      ['4', '5', '6'],
    ])
  })

  it('handles quoted fields containing commas', () => {
    expect(parseCsv('name,note\n"Smith, John",hello')).toEqual([
      ['name', 'note'],
      ['Smith, John', 'hello'],
    ])
  })

  it('handles escaped double-quotes inside quoted fields', () => {
    expect(parseCsv('q\n"she said ""hi"""')).toEqual([['q'], ['she said "hi"']])
  })

  it('handles CRLF line endings and ignores a trailing newline', () => {
    expect(parseCsv('a,b\r\n1,2\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('skips fully blank lines', () => {
    expect(parseCsv('a\n\n1\n')).toEqual([['a'], ['1']])
  })

  it('preserves quoted fields that contain newlines', () => {
    expect(parseCsv('a,b\n"line1\nline2",x')).toEqual([
      ['a', 'b'],
      ['line1\nline2', 'x'],
    ])
  })
})
