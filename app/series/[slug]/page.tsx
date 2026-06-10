import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSeriesStandings } from '@/data/standings'
import { SegmentBoards } from './segment-boards'

export const dynamic = 'force-dynamic'

interface SeriesPageProps {
  params: Promise<{ slug: string }>
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { slug } = await params
  const standings = await getSeriesStandings(slug)
  if (standings === null) notFound()

  const { series, boards } = standings

  return (
    <>
      <Link href="/" className="back-link">
        ← All series
      </Link>
      <span className="eyebrow">{series.roundFormat} round</span>
      <h1 className="page-title">{series.name}</h1>
      <p className="page-subtitle">
        {series.eventCount} events · {series.archerCount} archers · Best of Three Series
      </p>
      <SegmentBoards seriesSlug={series.slug} boards={boards} />
    </>
  )
}
