/**
 * Minimal, dependency-free CSV parser (RFC 4180 subset).
 *
 * Handles quoted fields, escaped double-quotes (""), commas and newlines inside
 * quotes, LF/CRLF/CR-only line endings, and a leading UTF-8 BOM. Fully blank
 * lines are skipped. Structural problems that can silently swallow data
 * (unterminated quotes, junk after a closing quote) are reported as
 * diagnostics rather than ignored. Validation and typing happen downstream.
 */

export interface CsvParseResult {
  rows: string[][]
  /** Parse-level problems that make part of the file unreadable. */
  diagnostics: string[]
}

export function parseCsv(input: string): CsvParseResult {
  // Strip a UTF-8 BOM so the first header cell matches its plain name.
  const text = input.startsWith('﻿') ? input.slice(1) : input

  const rows: string[][] = []
  const diagnostics: string[] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  let fieldStarted = false
  let afterClosingQuote = false

  const endField = () => {
    row.push(field)
    field = ''
    fieldStarted = false
    afterClosingQuote = false
  }
  const endRow = () => {
    endField()
    // Skip rows that are entirely empty (single blank cell, never quoted).
    if (!(row.length === 1 && row[0] === '')) rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
          afterClosingQuote = true
        }
      } else {
        field += ch
      }
      continue
    }

    if (ch === '"' && !fieldStarted) {
      inQuotes = true
      fieldStarted = true
    } else if (ch === ',') {
      endField()
    } else if (ch === '\n') {
      endRow()
    } else if (ch === '\r') {
      // CR-only (classic Mac/old Excel) and CRLF both terminate the row.
      endRow()
      if (text[i + 1] === '\n') i++
    } else {
      if (afterClosingQuote) {
        diagnostics.push(
          `row ${rows.length + 1}: unexpected characters after a closing quote`,
        )
        afterClosingQuote = false // report once per field
      }
      field += ch
      fieldStarted = true
    }
  }

  if (inQuotes) {
    diagnostics.push(
      'unterminated quoted field — the remainder of the file could not be read',
    )
  }

  // Flush the final field/row if the file did not end with a newline.
  if (field !== '' || row.length > 0) endRow()

  return { rows, diagnostics }
}
