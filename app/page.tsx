import Link from 'next/link'
import { listSeries } from '@/data/standings'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const series = await listSeries()

  return (
    <>
      <span className="eyebrow">Live Standings</span>
      <h1 className="page-title">The Texas Ringer</h1>
      <p className="page-subtitle">
        Best 3 of N — only an archer&apos;s three highest event scores count toward their rank.
      </p>

      <div className="series-grid">
        {series.map((s) => (
          <Link key={s.slug} href={`/series/${s.slug}`} className="series-card">
            <h2 className="series-card-name">{s.name}</h2>
            <p className="series-card-format">{s.roundFormat} round</p>
            <div className="series-card-stats">
              <div>
                <span className="stat-label">Events</span>
                <span className="stat-value">{s.eventCount}</span>
              </div>
              <div>
                <span className="stat-label">Archers</span>
                <span className="stat-value">{s.archerCount}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {series.length === 0 && <p className="muted">No series available yet. Check back soon.</p>}
    </>
  )
}
