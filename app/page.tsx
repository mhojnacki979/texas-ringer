import Link from 'next/link'
import { listEvents } from '@/data/events'

export default function HomePage() {
  const events = listEvents()

  return (
    <>
      <span className="eyebrow">The Texas Ringer</span>
      <h1 className="page-title">Results</h1>
      <p className="page-subtitle">
        Brackets, champions, and qualification standings from every Texas Ringer
      </p>
      <div className="series-grid">
        {events.map((e) =>
          e.comingSoon ? (
            <Link
              key={e.year}
              href={`/events/${e.year}`}
              className="series-card series-card-soon"
            >
              <h2 className="series-card-name">{e.name}</h2>
              <span className="series-card-soon-badge">Scores coming soon!</span>
            </Link>
          ) : (
            <Link key={e.year} href={`/events/${e.year}`} className="series-card">
              <h2 className="series-card-name">{e.name}</h2>
              <p className="series-card-format">
                {e.venue} · {e.date}
              </p>
              <div className="series-card-stats">
                <div>
                  <span className="stat-label">Divisions</span>
                  <span className="stat-value">{e.divisions.length}</span>
                </div>
                <div>
                  <span className="stat-label">Archers</span>
                  <span className="stat-value">{e.archers}</span>
                </div>
              </div>
            </Link>
          ),
        )}
      </div>
    </>
  )
}
