import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sessionCookieName, verifySessionToken } from '@/auth/session'
import { UploadForm } from './upload-form'

export const metadata: Metadata = {
  title: 'Admin — The Texas Ringer',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const jar = await cookies()
  const session = jar.get(sessionCookieName())?.value ?? ''
  if (!verifySessionToken(session, process.env.SESSION_SECRET ?? '')) redirect('/admin/login')

  return (
    <>
      <div className="admin-topbar">
        <span className="eyebrow">Admin</span>
        <form method="post" action="/api/logout">
          <button type="submit" className="button-ghost">
            Sign out
          </button>
        </form>
      </div>
      <h1 className="page-title">Import Scores</h1>
      <p className="page-subtitle">
        Upload a completed-scores CSV. Imports are idempotent — re-uploading the same file never
        creates duplicates.
      </p>
      <UploadForm />
    </>
  )
}
