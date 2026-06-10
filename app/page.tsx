import Image from 'next/image'
import Link from 'next/link'
import { listSeries } from '@/data/standings'

export const dynamic = 'force-dynamic'

const EVENT_FEATURES = [
  {
    title: 'Live Broadcast',
    body: 'Full live coverage of the tournament with Raising an Archer — every line, every shoot-off.',
  },
  {
    title: 'Player Cards',
    body: 'Every athlete is more than a competitor — custom player cards put archers at the center of the show.',
  },
  {
    title: 'Eyes on Score',
    body: 'Live digital scoring, arrow by arrow, end by end — follow qualification in real time.',
  },
  {
    title: '$10,000+ Payouts',
    body: 'Guaranteed cash and prizes on the line at the annual event.',
  },
] as const

function Hero() {
  return (
    <section className="hero">
      <Image
        src="/brand/ringer-antlers-white.png"
        alt=""
        width={442}
        height={400}
        className="hero-mark"
        priority
      />
      <div className="hero-copy">
        <span className="eyebrow">The Texas Ringer</span>
        <h1 className="hero-title">
          More than Archery.
          <br />
          It&apos;s an Experience.
        </h1>
        <p className="hero-sub">
          One target. Sixty arrows. The Texas Ringer is a season-long series and a flagship
          annual event — shoot the series, chase the rankings, and meet us at the big show.
        </p>
        <div className="cta-row">
          <Link href="#standings" className="button">
            Series Standings
          </Link>
          <a href="https://www.texasringer.com" className="button button-outline">
            The Annual Event
          </a>
        </div>
      </div>
    </section>
  )
}

function AnnualEvent() {
  return (
    <section className="home-section" id="event">
      <span className="eyebrow">The Annual Event</span>
      <h2 className="section-title">The Big Show</h2>
      <p className="section-sub">
        The annual Texas Ringer tournament — plus The Next Gen, a weekend built just for the
        next generation of archers.
      </p>
      <div className="feature-grid">
        {EVENT_FEATURES.map((f) => (
          <div className="feature-card" key={f.title}>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-body">{f.body}</p>
          </div>
        ))}
      </div>
      <a href="https://www.texasringer.com" className="button">
        Register at texasringer.com
      </a>
    </section>
  )
}

export default async function HomePage() {
  const series = await listSeries()

  return (
    <>
      <Hero />
      <AnnualEvent />
      <section className="home-section" id="standings">
        <span className="eyebrow">Live Standings</span>
        <h2 className="section-title">Series Rankings</h2>
        <p className="section-sub">
          Best of Three Series — an archer&apos;s three highest rounds count toward their rank.
        </p>
        <div className="series-grid">
          {series.map((s) => (
            <Link key={s.slug} href={`/series/${s.slug}`} className="series-card">
              <h3 className="series-card-name">{s.name}</h3>
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
      </section>
    </>
  )
}
