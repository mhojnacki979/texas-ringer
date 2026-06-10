import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="notfound">
      <span className="notfound-code">404</span>
      <h1 className="page-title">Off the target</h1>
      <p className="page-subtitle">
        That page doesn&apos;t exist — the series or archer may have been removed.
      </p>
      <Link href="/">← Back to all series</Link>
    </div>
  )
}
