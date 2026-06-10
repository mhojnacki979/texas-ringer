import { describe, it, expect } from 'vitest'
import { parseCsv } from './csv'

function rows(text: string): string[][] {
  return parseCsv(text).rows
}

describe('parseCsv', () => {
  it('parses a simple header + rows', () => {
    expect(rows('a,b,c\n1,2,3\n4,5,6')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
      ['4', '5', '6'],
    ])
  })

  it('handles quoted fields containing commas', () => {
    expect(rows('name,note\n"Smith, John",hello')).toEqual([
      ['name', 'note'],
      ['Smith, John', 'hello'],
    ])
  })

  it('handles escaped double-quotes inside quoted fields', () => {
    expect(rows('q\n"she said ""hi"""')).toEqual([['q'], ['she said "hi"']])
  })

  it('handles CRLF line endings and ignores a trailing newline', () => {
    expect(rows('a,b\r\n1,2\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('handles CR-only line endings (classic Mac / old Excel)', () => {
    expect(rows('a,b\r1,2\r3,4')).toEqual([
      ['a', 'b'],
      ['1', '2'],
      ['3', '4'],
    ])
  })

  it('strips a leading UTF-8 BOM, including before a quoted field', () => {
    expect(rows('﻿a,b\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
    expect(rows('﻿"a",b\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('skips fully blank lines', () => {
    expect(rows('a\n\n1\n')).toEqual([['a'], ['1']])
  })

  it('preserves quoted fields that contain newlines and carriage returns', () => {
    expect(rows('a,b\n"line1\nline2",x')).toEqual([
      ['a', 'b'],
      ['line1\nline2', 'x'],
    ])
    expect(rows('a\n"keep\rcr"')).toEqual([['a'], ['keep\rcr']])
  })

  it('reports an unterminated quote as a diagnostic', () => {
    const result = parseCsv('a,b\n"unclosed,oops\nmore,data')
    expect(result.diagnostics.some((d) => d.includes('unterminated'))).toBe(true)
  })

  it('reports junk after a closing quote as a diagnostic but keeps parsing', () => {
    const result = parseCsv('a\n"abc"def')
    expect(result.rows).toEqual([['a'], ['abcdef']])
    expect(result.diagnostics.some((d) => d.includes('closing quote'))).toBe(true)
  })

  it('returns no diagnostics for a clean file', () => {
    expect(parseCsv('a,b\n1,2\n').diagnostics).toEqual([])
  })
})
