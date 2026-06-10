import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEvent } from '@/data/events'
import { EventBoards } from './event-boards'

export const metadata: Metadata = {
  robots: { index: true, follow: true },
}

interface EventPageProps {
  params: Promise<{ year: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { year } = await params
  const event = getEvent(Number(year))
  if (event === null) notFound()

  return (
    <>
      <Link href="/events" className="back-link">
        ← All events
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
