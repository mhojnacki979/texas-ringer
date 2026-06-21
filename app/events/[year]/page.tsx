import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEvent } from '@/data/events'
import { listEvents } from '@/data/events'
import { EventBoards } from './event-boards'

export const metadata: Metadata = {
  robots: { index: true, follow: true },
}

// Pre-render one static page per event year; reject any other year.
export function generateStaticParams() {
  return listEvents().map((e) => ({ year: String(e.year) }))
}

export const dynamicParams = false

interface EventPageProps {
  params: Promise<{ year: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { year } = await params
  const event = getEvent(Number(year))
  if (event === null) notFound()

  if (event.comingSoon) {
    return (
      <>
        <Link href="/" className="back-link">
          ← All results
        </Link>
        <span className="eyebrow">{event.venue}</span>
        <h1 className="page-title">{event.name}</h1>
        <p className="page-subtitle">Scores coming soon!</p>
      </>
    )
  }

  return (
    <>
      <Link href="/" className="back-link">
        ← All results
      </Link>
      <span className="eyebrow">{event.venue} · {event.date}</span>
      <h1 className="page-title">{event.name}</h1>
      <p className="page-subtitle">
        {event.divisions.length} divisions · {event.archers} archers · single-elimination brackets
      </p>
      <EventBoards divisions={event.divisions} />
    </>
  )
}
