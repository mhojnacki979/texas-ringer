import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { DM_Serif_Display, Figtree, Space_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
})

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
})

export const metadata: Metadata = {
  title: 'The Texas Ringer — Series Rankings',
  description:
    'Official best-3-of-N archery series standings for The Texas Ringer, powered by Eyes on Score.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const fontClasses = `${dmSerif.variable} ${figtree.variable} ${spaceMono.variable}`
  return (
    <html lang="en" className={fontClasses}>
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="wordmark">
              The Texas <span className="wordmark-accent">Ringer</span>
            </Link>
          </div>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          The Texas Ringer · Powered by Eyes on Score · Best 3 of N series standings ·{' '}
          <Link href="/admin" className="muted">
            Admin
          </Link>
        </footer>
      </body>
    </html>
  )
}
