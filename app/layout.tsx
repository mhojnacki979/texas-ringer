import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Anton, Barlow, Playfair_Display, Saira_Condensed } from 'next/font/google'
import Image from 'next/image'
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

/** Official Texas Ringer arrowhead mark (Texas flag + feather). */
function RingerMark() {
  return (
    <Image
      src="/brand/ringer-antlers-white.png"
      alt=""
      width={42}
      height={38}
      className="wordmark-target"
      priority
    />
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
