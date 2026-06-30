import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getHlsr } from '@/data/hlsr'
import { HlsrBoards } from './hlsr-boards'

export const metadata: Metadata = {
  title: '2025 HLSR Archery Competition',
  description:
    'Houston Livestock Show & Rodeo Archery Competition — qualification standings, single-elimination brackets, and 3D results, powered by Eyes on Score.',
  robots: { index: true, follow: true },
}

export default function HlsrPage() {
  const event = getHlsr(2025)
  if (event === null) notFound()

  return (
    <>
      <span className="eyebrow">
        {event.venue} · {event.date}
      </span>
      <h1 className="page-title">{event.name}</h1>
      <HlsrBoards segments={event.segments} />
    </>
  )
}
