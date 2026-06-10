import type { Metadata } from 'next'
import Link from 'next/link'
import { listEvents } from '@/data/events'

export const metadata: Metadata = {
  title: 'Previous Events — The Texas Ringer',
}

export default function EventsPage() {
  const events = listEvents()

  return (
    <>
      <span className="eyebrow">The Annual Event</span>
      <h1 className="page-title">Previous Events</h1>
      <p className="page-subtitle">
        Brackets, champions, and qualification standings from every Texas Ringer
      </p>
      <div className="series-grid">
        {events.map((e) => (
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
        ))}
      </div>
    </>
  )
}
