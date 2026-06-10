'use client'

import { useMemo, useState } from 'react'
import type { EventDivision } from '@/data/events'
import { roundLabel } from '@/data/events'

/** Tabs across a division: Qualification, then each shoot-off round. */
interface RoundTab {
  key: string
  label: string
  kind: 'qualification' | 'elimination'
  roundIndex: number
}

function buildTabs(division: EventDivision): RoundTab[] {
  const tabs: RoundTab[] = [
    { key: 'qual', label: 'Qualification', kind: 'qualification', roundIndex: -1 },
  ]
  const total = division.eliminationRounds.length
  division.eliminationRounds.forEach((_, i) => {
    tabs.push({
      key: `r${i}`,
      label: roundLabel(i, total),
      kind: 'elimination',
      roundIndex: i,
    })
  })
  return tabs
}

function QualTable({ division }: { division: EventDivision }) {
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
          {division.qualification.map((r) => (
            <tr key={`${r.rank}-${r.name}`}>
              <td>
                {r.rank <= 3 ? (
                  <span className={`rank-badge rank-${r.rank}`}>{r.rank}</span>
                ) : (
                  <span className="rank-rest">{r.rank}</span>
                )}
              </td>
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
  )
}

function ElimTable({ division, roundIndex }: { division: EventDivision; roundIndex: number }) {
  const round = division.eliminationRounds[roundIndex]
  if (round === undefined) return null
  const endCount = round.results[0]?.ends.length ?? 0
  return (
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
            <tr key={`${r.rank}-${r.name}`} className={r.winner ? 'is-winner-row' : ''}>
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
              <td>{r.winner ? <span className="badge badge-counted">Advanced</span> : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function EventBoards({ divisions }: { divisions: EventDivision[] }) {
  const [activeName, setActiveName] = useState(divisions[0]?.name ?? '')
  const active = divisions.find((d) => d.name === activeName) ?? divisions[0]
  const tabs = useMemo(() => (active ? buildTabs(active) : []), [active])
  // Default to the Finals tab — the result everyone wants first.
  const [activeTab, setActiveTab] = useState('')
  const currentTab = tabs.find((t) => t.key === activeTab) ?? tabs[tabs.length - 1] ?? tabs[0]

  if (active === undefined || currentTab === undefined) {
    return <p className="muted">No results recorded for this event.</p>
  }

  function onDivisionChange(name: string) {
    setActiveName(name)
    setActiveTab('') // reset to Finals for the newly selected division
  }

  return (
    <section aria-label="Event results">
      <label className="segment-picker">
        <span className="segment-picker-label">Division</span>
        <select
          className="segment-select"
          value={active.name}
          onChange={(e) => onDivisionChange(e.target.value)}
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
        <div className="champion-card">
          <span className="champion-eyebrow">{active.name} · Champion</span>
          <span className="champion-name">{active.champion}</span>
        </div>
      )}

      <div className="round-tabs" role="tablist" aria-label="Rounds">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === currentTab.key}
            className="round-tab"
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {currentTab.kind === 'qualification' ? (
        <QualTable division={active} />
      ) : (
        <ElimTable division={active} roundIndex={currentTab.roundIndex} />
      )}
    </section>
  )
}
