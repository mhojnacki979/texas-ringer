/**
 * Next.js boot hook: fail fast when a required environment variable is
 * missing, instead of booting fine and erroring at first use.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const required = ['DATABASE_URL', 'SESSION_SECRET', 'ADMIN_PASSWORD', 'ADMIN_TOKEN'] as const
  const missing = required.filter((key) => {
    const value = process.env[key]
    return value === undefined || value === ''
  })
  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`)
  }
}
