'use client'

import { useEffect, useRef, useState } from 'react'
import type { EventDivision } from '@/data/events'
import { fetchLive, fetchShooterEnds, type LiveData, type ShooterDetail } from '@/lib/eos'
import type { LiveTournament } from '@/lib/live-config'
import { DivisionBracket } from '../events/[year]/division-bracket'

const POLL_MS = 20_000

interface Selected {
  id: string
  name: string
}

function StandingsTable({
  division,
  onSelect,
}: {
  division: EventDivision
  onSelect: (sel: Selected) => void
}) {
  const rows = [...division.qualification].sort((a, b) => a.rank - b.rank)
  return (
    <div className="table-wrap">
      <table className="board-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Archer</th>
            <th className="cell-num">Arrow Avg</th>
            <th className="cell-num">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const sid = r.shooterId
            return (
              <tr key={`${r.rank}-${r.name}`}>
                <td>
                  {r.rank <= 3 && r.rank > 0 ? (
                    <span className={`rank-badge rank-${r.rank}`}>{r.rank}</span>
                  ) : (
                    <span className="rank-rest">{r.rank || '—'}</span>
                  )}
                </td>
                <td>
                  {sid ? (
                    <button
                      type="button"
                      className="archer-link"
                      onClick={() => onSelect({ id: sid, name: r.name })}
                    >
                      {r.name}
                    </button>
                  ) : (
                    <span className="archer-name">{r.name}</span>
                  )}
                </td>
                <td className="cell-num mono">{r.avg || '—'}</td>
                <td className="cell-num">
                  <span className="score-total">{r.score}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ShooterModal({
  selected,
  detail,
  error,
  onClose,
}: {
  selected: Selected
  detail: ShooterDetail | null
  error: boolean
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <span className="eyebrow">Scorecard</span>
        <h2 className="modal-name">{detail?.name ?? selected.name}</h2>
        {detail && (
          <p className="modal-meta mono">
            {detail.target ? `Target ${detail.target} · ` : ''}Total {detail.total} · Avg {detail.avg}
          </p>
        )}
        {error && <p className="muted">Could not load this archer's scorecard.</p>}
        {!error && detail === null && <p className="muted">Loading scorecard…</p>}
        {detail && detail.ends.length === 0 && <p className="muted">No ends scored yet.</p>}
        {detail && detail.ends.length > 0 && (
          <div className="table-wrap">
            <table className="board-table">
              <thead>
                <tr>
                  <th>End</th>
                  <th>Arrows</th>
                  <th className="cell-num">End</th>
                  <th className="cell-num">Total</th>
                </tr>
              </thead>
              <tbody>
                {detail.ends.map((e) => (
                  <tr key={e.label}>
                    <td>{e.label}</td>
                    <td className="mono">{e.arrows.join('  ')}</td>
                    <td className="cell-num mono">{e.score}</td>
                    <td className="cell-num">
                      <span className="score-total">{e.running}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export function LiveBoard({ tournament }: { tournament: LiveTournament }) {
  const [data, setData] = useState<LiveData | null>(null)
  const [error, setError] = useState(false)
  const [activeName, setActiveName] = useState('')
  const [selected, setSelected] = useState<Selected | null>(null)
  const [detail, setDetail] = useState<ShooterDetail | null>(null)
  const [detailError, setDetailError] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const next = await fetchLive(tournament.id)
        if (alive) {
          setData(next)
          setError(false)
        }
      } catch {
        if (alive) setError(true)
      }
    }
    load()
    timer.current = setInterval(load, POLL_MS)
    return () => {
      alive = false
      if (timer.current) clearInterval(timer.current)
    }
  }, [tournament.id])

  const openShooter = (sel: Selected) => {
    setSelected(sel)
    setDetail(null)
    setDetailError(false)
    fetchShooterEnds(tournament.id, sel.id)
      .then(setDetail)
      .catch(() => setDetailError(true))
  }

  if (data === null) {
    return (
      <p className="muted">
        {error ? 'Could not reach live scoring — retrying…' : 'Loading live scores…'}
      </p>
    )
  }

  const active = data.divisions.find((d) => d.name === activeName) ?? data.divisions[0]
  if (active === undefined) {
    return <p className="muted">No scores posted yet.</p>
  }
  const updated = new Date(data.updatedAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <section aria-label="Live scores">
      <div className="live-status">
        <span className="live-dot" aria-hidden="true" />
        <span className="live-label">Live</span>
        <span className="live-updated">
          updated {updated}
          {error ? ' · reconnecting…' : ''}
        </span>
      </div>

      {data.divisions.length > 1 && (
        <label className="segment-picker">
          <span className="segment-picker-label">Division</span>
          <select
            className="segment-select"
            value={active.name}
            onChange={(e) => setActiveName(e.target.value)}
            aria-label="Choose a division"
          >
            {data.divisions.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {active.bracket !== null && active.bracket.rounds.length > 0 && (
        <>
          <h2 className="section-title">Bracket</h2>
          <DivisionBracket division={active} />
          <h2 className="section-title" style={{ marginTop: '2rem' }}>
            Qualification
          </h2>
        </>
      )}
      <p className="standings-hint muted">Tap an archer to see their end-by-end scorecard.</p>
      <StandingsTable division={active} onSelect={openShooter} />

      {selected && (
        <ShooterModal
          selected={selected}
          detail={detail}
          error={detailError}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  )
}
