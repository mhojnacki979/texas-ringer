import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sessionCookieName, verifySessionToken } from '@/auth/session'

export const metadata: Metadata = {
  title: 'Sign In — The Texas Ringer',
  robots: { index: false, follow: false },
}

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const jar = await cookies()
  const session = jar.get(sessionCookieName())?.value ?? ''
  if (verifySessionToken(session, process.env.SESSION_SECRET ?? '')) redirect('/admin')

  const { error } = await searchParams
  return (
    <>
      <span className="eyebrow">Admin</span>
      <h1 className="page-title">Sign In</h1>
      <p className="page-subtitle">Enter the admin password to upload scores.</p>
      <form className="admin-form" method="post" action="/api/login">
        <label className="form-field">
          <span className="stat-label">Password</span>
          <input type="password" name="password" className="text-input" required autoFocus />
        </label>
        <button type="submit" className="button">
          Sign in
        </button>
        {error === 'locked' && (
          <p className="result-box result-error">
            Too many failed attempts — wait 15 minutes and try again.
          </p>
        )}
        {error !== undefined && error !== 'locked' && (
          <p className="result-box result-error">Wrong password — try again.</p>
        )}
      </form>
    </>
  )
}
