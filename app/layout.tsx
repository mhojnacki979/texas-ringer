import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Anton, Barlow, Playfair_Display, Saira_Condensed } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

// Editorial Didone headline — "More than Archery, It's an Experience" energy.
const playfair = Playfair_Display({
  weight: ['700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-playfair',
})

// Body copy.
const barlow = Barlow({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-barlow',
})

// Athletic condensed — scoreboard labels, tabular numbers, nav.
const saira = Saira_Condensed({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-saira',
})

// Heavy display — oversized rank/score numerals, the wordmark.
const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
})

export const metadata: Metadata = {
  title: 'The Texas Ringer — Series Rankings',
  description:
    'Official Best of Three Series archery standings for The Texas Ringer, powered by Eyes on Score.',
}

/** Concentric Ringer-target mark used in the wordmark. */
function RingerMark() {
  return (
    <svg className="wordmark-target" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#1b2a63" />
      <circle cx="16" cy="16" r="11" fill="#fff" />
      <circle cx="16" cy="16" r="7.5" fill="#d11f2d" />
      <circle cx="16" cy="16" r="3.4" fill="#fff" />
      <path
        d="M16 13.4l0.8 1.7 1.9 0.2-1.4 1.3 0.4 1.8L16 17.6l-1.7 0.8 0.4-1.8-1.4-1.3 1.9-0.2z"
        fill="#1b2a63"
      />
    </svg>
  )
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const fontClasses = `${playfair.variable} ${barlow.variable} ${saira.variable} ${anton.variable}`
  return (
    <html lang="en" className={fontClasses}>
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="wordmark" aria-label="The Texas Ringer">
              <span className="wordmark-year">2026</span>
              <span className="wordmark-lockup">
                <span className="wordmark-navy">TEXAS</span>
                <RingerMark />
                <span className="wordmark-red">RINGER</span>
              </span>
            </Link>
            <nav className="site-nav" aria-label="Primary">
              <Link href="/" className="site-nav-link is-active">
                Series
              </Link>
              <a href="https://www.texasringer.com/copy-of-rules" className="site-nav-link">
                Records
              </a>
              <a href="https://www.texasringer.com/blank" className="site-nav-link">
                Rules
              </a>
            </nav>
          </div>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          The Texas Ringer · Powered by Eyes on Score · Best of Three Series ·{' '}
          <Link href="/admin" className="muted">
            Admin
          </Link>
        </footer>
      </body>
    </html>
  )
}
