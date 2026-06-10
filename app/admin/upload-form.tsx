'use client'

import { useState, type FormEvent } from 'react'
import type { DbImportSummary } from '@/db/import-scores'

type UploadState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'done'; summary: DbImportSummary }
  | { status: 'failed'; message: string }

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<UploadState>({ status: 'idle' })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (file === null) return
    setState({ status: 'submitting' })
    try {
      const body = new FormData()
      body.append('file', file)
      // Auth: the httpOnly session cookie rides along automatically.
      const res = await fetch('/api/import', { method: 'POST', body })
      const text = await res.text()
      let json: unknown = null
      try {
        json = JSON.parse(text)
      } catch {
        // non-JSON body (e.g. a bare 500) — fall through to status-based message
      }
      if (!res.ok) {
        const message =
          typeof json === 'object' && json !== null && 'error' in json
            ? String((json as { error: unknown }).error)
            : `upload failed (HTTP ${res.status})`
        setState({ status: 'failed', message })
        return
      }
      setState({ status: 'done', summary: json as DbImportSummary })
    } catch {
      setState({ status: 'failed', message: 'could not reach the server — check your connection and retry' })
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label className="form-field">
        <span className="stat-label">Scores CSV</span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="file-input"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />
      </label>
      <button type="submit" className="button" disabled={state.status === 'submitting'}>
        {state.status === 'submitting' ? 'Importing…' : 'Import scores'}
      </button>
      <UploadResult state={state} />
    </form>
  )
}

function UploadResult({ state }: { state: UploadState }) {
  if (state.status === 'failed') {
    return <p className="result-box result-error">{state.message}</p>
  }
  if (state.status !== 'done') return null

  const { summary } = state
  return (
    <div className="result-box">
      <p className="mono">
        Imported {summary.rowsImported} row(s) across {summary.seriesImported} series.
      </p>
      {summary.errors.length > 0 && (
        <>
          <p className="muted">{summary.errors.length} row(s) skipped:</p>
          <ul className="error-list mono">
            {summary.errors.map((e) => (
              <li key={`${e.line}-${e.message}`}>
                line {e.line}: {e.message}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
