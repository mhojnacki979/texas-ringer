import Link from 'next/link'
import { listEvents } from '@/data/events'
import { asset } from '@/lib/asset'

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
      <img
        src={asset('/brand/ringer-antlers-white.png')}
        alt=""
        width={442}
        height={400}
        className="hero-mark"
      />
      <div className="hero-copy">
        <span className="eyebrow">The Texas Ringer</span>
        <h1 className="hero-title">
          More than Archery.
          <br />
          It&apos;s an Experience.
        </h1>
        <p className="hero-sub">
          The Texas Ringer is a flagship annual archery tournament — a live-broadcast show with
          player cards, real-time scoring, and $10,000+ on the line.
        </p>
        <div className="cta-row">
          <a href="https://www.texasringer.com" className="button">
            Register at texasringer.com
          </a>
          <Link href="/events" className="button button-outline">
            View Results
          </Link>
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className="home-section" id="event">
      <span className="eyebrow">The Annual Event</span>
      <h2 className="section-title">The Big Show</h2>
      <p className="section-sub">
        The annual Texas Ringer tournament — plus The Next Gen, a weekend built just for the next
        generation of archers.
      </p>
      <div className="feature-grid">
        {EVENT_FEATURES.map((f) => (
          <div className="feature-card" key={f.title}>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-body">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  const events = listEvents()

  return (
    <>
      <Hero />
      <Features />
      <section className="home-section" id="results">
        <span className="eyebrow">Previous Events</span>
        <h2 className="section-title">Brackets &amp; Champions</h2>
        <p className="section-sub">Every division, every shoot-off — see how each Ringer was won.</p>
        <div className="series-grid">
          {events.map((e) => (
            <Link key={e.year} href={`/events/${e.year}`} className="series-card">
              <h3 className="series-card-name">{e.name}</h3>
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
      </section>
    </>
  )
}
