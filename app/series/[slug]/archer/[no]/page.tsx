import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArcherDetail } from '@/data/standings'
import type { ArcherRanking, EventScore } from '@/ranking/types'

export const dynamic = 'force-dynamic'

interface ArcherPageProps {
  params: Promise<{ slug: string; no: string }>
}

interface EventRow {
  score: EventScore
  counted: boolean
}

function eventHistory(ranking: ArcherRanking): EventRow[] {
  const rows = [
    ...ranking.counted.map((score) => ({ score, counted: true })),
    ...ranking.dropped.map((score) => ({ score, counted: false })),
  ]
  return rows.sort((a, b) => a.score.eventDate.localeCompare(b.score.eventDate))
}

function SegmentSection({ ranking }: { ranking: ArcherRanking }) {
  const segmentLabel = `${ranking.segment.division} / ${ranking.segment.gender} / ${ranking.segment.ageClass}`
  return (
    <section className="segment-section">
      <h2 className="segment-section-title">{segmentLabel}</h2>

      <div className="stat-cards">
        <div className="stat-card">
          <span className="stat-label">Rank</span>
          {ranking.ranked && ranking.rank !== null ? (
            <span className="stat-value accent">#{ranking.rank}</span>
          ) : (
            <span className="badge badge-provisional">Provisional</span>
          )}
        </div>
        <div className="stat-card">
          <span className="stat-label">Best 3 Total</span>
          <span className="stat-value accent mono">{ranking.best3Total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average</span>
          <span className="stat-value mono">
            {ranking.best3Average === null ? '—' : ranking.best3Average.toFixed(2)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Events Shot</span>
          <span className="stat-value mono">{ranking.eventsShot}</span>
        </div>
      </div>

      <div className="table-wrap">
        <table className="board-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th className="cell-num">Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {eventHistory(ranking).map(({ score, counted }) => (
              <tr key={score.eventId}>
                <td>{score.eventName}</td>
                <td className="mono muted">{score.eventDate}</td>
                <td className="cell-num">
                  <span className="score-total">{score.total}</span>
                </td>
                <td>
                  {counted ? (
                    <span className="badge badge-counted">Counted</span>
                  ) : (
                    <span className="badge badge-dropped">Dropped</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default async function ArcherPage({ params }: ArcherPageProps) {
  const { slug, no } = await params
  const detail = await getArcherDetail(slug, decodeURIComponent(no))
  if (detail === null) notFound()

  return (
    <>
      <Link href={`/series/${detail.seriesSlug}`} className="back-link">
        ← {detail.seriesName} standings
      </Link>
      <span className="eyebrow mono">USA Archery #{detail.usaArcheryNo}</span>
      <h1 className="page-title">{detail.name}</h1>
      <p className="page-subtitle">{detail.seriesName} · Best of Three Series</p>
      {detail.rankings.map((ranking) => (
        <SegmentSection
          key={`${ranking.segment.division}-${ranking.segment.gender}-${ranking.segment.ageClass}`}
          ranking={ranking}
        />
      ))}
    </>
  )
}
