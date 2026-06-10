'use client'

import { useState } from 'react'
import type { EventDivision, EventElimRound } from '@/data/events'

function ElimRoundTable({ round, isFinal }: { round: EventElimRound; isFinal: boolean }) {
  const endCount = round.results[0]?.ends.length ?? 0
  return (
    <div className="elim-round">
      <h3 className="elim-round-title">
        {isFinal ? 'Finals' : `Elimination Round ${round.round}`}
      </h3>
      <div className="table-wrap">
        <table className="board-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Archer</th>
              {Array.from({ length: endCount }, (_, i) => (
                <th key={i} className="cell-num">{`End ${i + 1}`}</th>
              ))}
              <th className="cell-num">Total</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {round.results.map((r) => (
              <tr key={`${r.rank}-${r.name}`}>
                <td className="mono">{r.rank}</td>
                <td className="archer-name">{r.name}</td>
                {r.ends.map((e, i) => (
                  <td key={i} className="cell-num mono">
                    {e}
                  </td>
                ))}
                <td className="cell-num">
                  <span className="score-total">{r.score}</span>
                </td>
                <td>{r.winner ? <span className="badge badge-counted">Won</span> : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function EventBoards({ divisions }: { divisions: EventDivision[] }) {
  const [activeName, setActiveName] = useState(divisions[0]?.name ?? '')
  const active = divisions.find((d) => d.name === activeName) ?? divisions[0]

  if (active === undefined) {
    return <p className="muted">No results recorded for this event.</p>
  }

  return (
    <section aria-label="Event results">
      <label className="segment-picker">
        <span className="segment-picker-label">Division</span>
        <select
          className="segment-select"
          value={active.name}
          onChange={(e) => setActiveName(e.target.value)}
          aria-label="Choose a division"
        >
          {divisions.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </label>

      {active.champion !== null && (
        <div className="leader-card">
          <div className="leader-card-inner">
            <div>
              <span className="leader-eyebrow">{active.name} · Champion</span>
              <div className="leader-id">
                <span className="leader-rank">1</span>
                <div>
                  <span className="leader-name">{active.champion}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {active.eliminationRounds.map((round, i) => (
        <ElimRoundTable
          key={round.round}
          round={round}
          isFinal={i === active.eliminationRounds.length - 1}
        />
      ))}

      <div className="elim-round">
        <h3 className="elim-round-title">Qualification</h3>
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
              {active.qualification.map((r) => (
                <tr key={`${r.rank}-${r.name}`}>
                  <td className="mono">{r.rank}</td>
                  <td className="archer-name">{r.name}</td>
                  <td className="cell-num mono">{r.avg}</td>
                  <td className="cell-num">
                    <span className="score-total">{r.score}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
