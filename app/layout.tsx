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
  title: 'Eyes on Score — Series Rankings',
  description:
    'Official best-3-of-N series standings for archery tournaments, powered by EyesonScore.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const fontClasses = `${dmSerif.variable} ${figtree.variable} ${spaceMono.variable}`
  return (
    <html lang="en" className={fontClasses}>
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="wordmark">
              Eyes on Score <span className="wordmark-accent">—</span> Series Rankings
            </Link>
          </div>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">Powered by EyesonScore · Best 3 of N series standings</footer>
      </body>
    </html>
  )
}
