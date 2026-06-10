/**
 * Minimal, dependency-free CSV parser (RFC 4180 subset).
 *
 * Handles quoted fields, escaped double-quotes (""), commas and newlines inside
 * quotes, and CRLF/LF line endings. Fully blank lines are skipped. Returns rows
 * of raw string cells; validation and typing happen downstream in schema.ts.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  let fieldStarted = false

  const endField = () => {
    row.push(field)
    field = ''
    fieldStarted = false
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
      // swallow; the following \n (if any) triggers endRow
    } else {
      field += ch
      fieldStarted = true
    }
  }

  // Flush the final field/row if the file did not end with a newline.
  if (field !== '' || row.length > 0) endRow()

  return rows
}
