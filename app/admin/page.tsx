import type { Metadata } from 'next'
import { UploadForm } from './upload-form'

export const metadata: Metadata = {
  title: 'Admin — The Texas Ringer',
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  return (
    <>
      <span className="eyebrow">Admin</span>
      <h1 className="page-title">Import Scores</h1>
      <p className="page-subtitle">
        Upload a completed-scores CSV. Imports are idempotent — re-uploading the same file never
        creates duplicates.
      </p>
      <UploadForm />
    </>
  )
}
