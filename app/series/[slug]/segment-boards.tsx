'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SegmentBoard, SeriesSummary } from '@/data/types'
import type { ArcherRanking, EventScore } from '@/ranking/types'

interface SegmentBoardsProps {
  seriesSlug: string
  series: SeriesSummary
  boards: SegmentBoard[]
}

function scoreList(scores: EventScore[]): string {
  return scores.length > 0 ? scores.map((s) => s.total).join(' / ') : '—'
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .slice(0, 3)
}

function segmentLabel(board: SegmentBoard): string {
  const s = board.segment
  return `${s.division} / ${s.gender} / ${s.ageClass}`
}

/** Concentric Ringer-target mark, used as a watermark on the leader card. */
function RingerTarget({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#1b2a63" />
      <circle cx="16" cy="16" r="11" fill="#fff" />
      <circle cx="16" cy="16" r="7.5" fill="#d11f2d" />
      <circle cx="16" cy="16" r="3.4" fill="#fff" />
      <path
        d="M16 13.4l0.8 1.7 1.9 0.2-1.4 1.3 0.4 1.8L16 17.6l-1.7 0.8 0.4-1.8-1.4-1.3 1.9-0.2z"
        fill="#1b2a63"
      />
    </svg>
  )
}

function RankCell({ ranking }: { ranking: ArcherRanking }) {
  if (!ranking.ranked || ranking.rank === null) {
    return (
      <span>
        <span className="muted mono">—</span>{' '}
        <span className="badge badge-provisional">Provisional</span>
      </span>
    )
  }
  if (ranking.rank <= 3) {
    return <span className={`rank-badge rank-${ranking.rank}`}>{ranking.rank}</span>
  }
  return <span className="rank-rest">{ranking.rank}</span>
}

/** Series + segment metrics bar (Round · Events · Ranked · Provisional · Segment). */
function MetricStrip({ series, board }: { series: SeriesSummary; board: SegmentBoard }) {
  const ranked = board.rankings.filter((r) => r.ranked).length
  const provisional = board.rankings.length - ranked
  const cells: Array<[string, string | number]> = [
    ['Round', series.roundFormat],
    ['Events', series.eventCount],
    ['Ranked', ranked],
    ['Provisional', provisional],
  ]
  return (
    <div className="metric-strip">
      {cells.map(([label, value]) => (
        <div className="metric-cell" key={label}>
          <div className="metric-label">{label}</div>
          <div className="metric-value">{value}</div>
        </div>
      ))}
      <div className="metric-cell metric-grow">
        <div className="metric-label">Segment</div>
        <div className="metric-value is-red">{segmentLabel(board)}</div>
      </div>
    </div>
  )
}

/** Featured card for the segment leader (rank 1). */
function LeaderCard({ seriesSlug, board }: { seriesSlug: string; board: SegmentBoard }) {
  const leader = board.rankings.find((r) => r.ranked && r.rank === 1)
  if (leader === undefined) return null
  const top = leader.counted[0]?.total ?? 0
  return (
    <div className="leader-card">
      <RingerTarget className="leader-card-target" />
      <div className="leader-card-inner">
        <div>
          <span className="leader-eyebrow">{segmentLabel(board)} · Series Leader</span>
          <div className="leader-id">
            <span className="leader-rank">1</span>
            <div>
              <Link
                href={`/series/${seriesSlug}/archer/${encodeURIComponent(leader.usaArcheryNo)}`}
                className="leader-name"
              >
                {leader.name}
              </Link>
              <div className="leader-meta">
                #{leader.usaArcheryNo} · {leader.counted.map((e) => e.total).join(' / ')}
              </div>
            </div>
          </div>
        </div>
        <div className="leader-numbers">
          <div>
            <div className="leader-total">{leader.best3Total}</div>
            <div className="leader-total-label">Best 3 Total</div>
          </div>
          <div className="leader-tiles">
            <div className="leader-tile">
              <div className="leader-tile-value">
                {leader.best3Average === null ? '—' : leader.best3Average.toFixed(2)}
              </div>
              <div className="leader-tile-label">Avg</div>
            </div>
            <div className="leader-tile">
              <div className="leader-tile-value">{leader.eventsShot}</div>
              <div className="leader-tile-label">Events</div>
            </div>
            <div className="leader-tile">
              <div className="leader-tile-value is-gold">{top}</div>
              <div className="leader-tile-label">Top</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BoardTable({ seriesSlug, board }: { seriesSlug: string; board: SegmentBoard }) {
  return (
    <div className="table-wrap">
      <table className="board-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Archer</th>
            <th className="cell-num">Best 3 Total</th>
            <th className="cell-num">Avg</th>
            <th className="cell-num">Events</th>
            <th>Counted</th>
            <th>Dropped</th>
          </tr>
        </thead>
        <tbody>
          {board.rankings.map((r) => (
            <tr key={r.usaArcheryNo}>
              <td>
                <RankCell ranking={r} />
              </td>
              <td>
                <Link
                  href={`/series/${seriesSlug}/archer/${encodeURIComponent(r.usaArcheryNo)}`}
                  className="archer-cell"
                >
                  <span className="archer-avatar">{initials(r.name)}</span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span className="archer-name">{r.name}</span>
                    <span className="archer-sub">USA Archery #{r.usaArcheryNo}</span>
                  </span>
                </Link>
              </td>
              <td className="cell-num">
                <span className="score-total">{r.best3Total}</span>
              </td>
              <td className="cell-num mono">
                {r.best3Average === null ? '—' : r.best3Average.toFixed(2)}
              </td>
              <td className="cell-num mono">{r.eventsShot}</td>
              <td className="mono">{scoreList(r.counted)}</td>
              <td className="mono muted">{scoreList(r.dropped)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SegmentBoards({ seriesSlug, series, boards }: SegmentBoardsProps) {
  const [activeKey, setActiveKey] = useState(boards[0]?.key ?? '')
  const active = boards.find((b) => b.key === activeKey) ?? boards[0]

  if (active === undefined) {
    return <p className="muted">No standings recorded for this series yet.</p>
  }

  // One dropdown, grouped by division: 24 segments without a wall of buttons.
  const byDivision = new Map<string, SegmentBoard[]>()
  for (const b of boards) {
    const group = byDivision.get(b.segment.division)
    if (group === undefined) byDivision.set(b.segment.division, [b])
    else group.push(b)
  }

  return (
    <section aria-label="Segment leaderboards">
      <label className="segment-picker">
        <span className="segment-picker-label">Leaderboard</span>
        <select
          className="segment-select"
          value={active.key}
          onChange={(e) => setActiveKey(e.target.value)}
          aria-label="Choose a segment leaderboard"
        >
          {[...byDivision.entries()].map(([division, group]) => (
            <optgroup key={division} label={division}>
              {group.map((b) => (
                <option key={b.key} value={b.key}>
                  {b.segment.gender} · {b.segment.ageClass}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <MetricStrip series={series} board={active} />
      <LeaderCard seriesSlug={seriesSlug} board={active} />
      <BoardTable seriesSlug={seriesSlug} board={active} />
    </section>
  )
}
