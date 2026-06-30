'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { asset } from '@/lib/asset'

function isHlsr(pathname: string): boolean {
  return pathname.startsWith('/hlsr')
}

function RingerHeader() {
  return (
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
          <Link href="/live" className="site-nav-link">
            Live
          </Link>
          <Link href="/" className="site-nav-link">
            Results
          </Link>
        </nav>
      </div>
    </header>
  )
}

function HlsrHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/hlsr" className="hlsr-wordmark" aria-label="Houston Livestock Show & Rodeo Archery">
          <span className="hlsr-wordmark-title">Houston Livestock Show &amp; Rodeo</span>
          <span className="hlsr-wordmark-sub">Archery Competition</span>
        </Link>
      </div>
    </header>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  return isHlsr(pathname) ? <HlsrHeader /> : <RingerHeader />
}

export function SiteFooter() {
  const pathname = usePathname()
  const brand = isHlsr(pathname) ? 'Houston Livestock Show & Rodeo' : 'The Texas Ringer'
  return <footer className="site-footer">{brand} · Powered by Eyes on Score</footer>
}
