import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Anton, Barlow, Playfair_Display, Saira_Condensed } from 'next/font/google'
import Link from 'next/link'
import { asset } from '@/lib/asset'
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
  title: 'The Texas Ringer — Archery Tournament',
  description:
    'The Texas Ringer — a flagship annual archery tournament. Brackets, champions, and results, powered by Eyes on Score.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const fontClasses = `${playfair.variable} ${barlow.variable} ${saira.variable} ${anton.variable}`
  return (
    <html lang="en" className={fontClasses}>
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="wordmark" aria-label="The Texas Ringer">
              <img
                src={asset('/brand/ringer-wordmark.png')}
                alt="2026 Texas Ringer"
                className="wordmark-logo"
              />
            </Link>
            <nav className="site-nav" aria-label="Primary">
              <a href="https://www.texasringer.com" className="site-nav-link">
                Home
              </a>
              <Link href="/" className="site-nav-link">
                Results
              </Link>
            </nav>
          </div>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">The Texas Ringer · Powered by Eyes on Score</footer>
      </body>
    </html>
  )
}
