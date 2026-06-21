'use client'

import { useEffect, useRef, useState } from 'react'
import type { EventDivision } from '@/data/events'
import { fetchLive, type LiveData } from '@/lib/eos'
import type { LiveTournament } from '@/lib/live-config'
import { DivisionBracket } from '../events/[year]/division-bracket'

const POLL_MS = 20_000

function StandingsTable({ division }: { division: EventDivision }) {
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
          {rows.map((r) => (
            <tr key={`${r.rank}-${r.name}`}>
              <td>
                {r.rank <= 3 && r.rank > 0 ? (
                  <span className={`rank-badge rank-${r.rank}`}>{r.rank}</span>
                ) : (
                  <span className="rank-rest">{r.rank || '—'}</span>
                )}
              </td>
              <td className="archer-name">{r.name}</td>
              <td className="cell-num mono">{r.avg || '—'}</td>
              <td className="cell-num">
                <span className="score-total">{r.score}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function LiveBoard({ tournament }: { tournament: LiveTournament }) {
  const [data, setData] = useState<LiveData | null>(null)
  const [error, setError] = useState(false)
  const [activeName, setActiveName] = useState('')
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

  if (data === null) {
    return <p className="muted">{error ? 'Could not reach live scoring — retrying…' : 'Loading live scores…'}</p>
  }

  const active = data.divisions.find((d) => d.name === activeName) ?? data.divisions[0]
  if (active === undefined) {
    return <p className="muted">No scores posted yet.</p>
  }
  const updated = new Date(data.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })

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
      <StandingsTable division={active} />
    </section>
  )
}
