'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SegmentBoard } from '@/data/types'
import type { ArcherRanking, EventScore } from '@/ranking/types'

interface SegmentBoardsProps {
  seriesSlug: string
  boards: SegmentBoard[]
}

function scoreList(scores: EventScore[]): string {
  return scores.length > 0 ? scores.map((s) => s.total).join(' / ') : '—'
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
  const tier = ranking.rank <= 3 ? `rank-badge rank-${ranking.rank}` : 'rank-rest mono'
  return <span className={tier}>{ranking.rank}</span>
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
                <Link href={`/series/${seriesSlug}/archer/${encodeURIComponent(r.usaArcheryNo)}`}>
                  {r.name}
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

export function SegmentBoards({ seriesSlug, boards }: SegmentBoardsProps) {
  const [activeKey, setActiveKey] = useState(boards[0]?.key ?? '')
  const active = boards.find((b) => b.key === activeKey) ?? boards[0]

  if (active === undefined) {
    return <p className="muted">No standings recorded for this series yet.</p>
  }

  return (
    <section aria-label="Segment leaderboards">
      <div className="segment-tabs" role="tablist" aria-label="Segments">
        {boards.map((b) => (
          <button
            key={b.key}
            type="button"
            role="tab"
            aria-selected={b.key === active.key}
            className="segment-pill"
            onClick={() => setActiveKey(b.key)}
          >
            {b.key}
          </button>
        ))}
      </div>
      <BoardTable seriesSlug={seriesSlug} board={active} />
    </section>
  )
}
