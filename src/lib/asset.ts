/**
 * Prefix a public-asset path with the deploy base path.
 *
 * next/image with `unoptimized` does NOT apply basePath in a static export, so
 * static images must be referenced through this helper. NEXT_PUBLIC_BASE_PATH
 * is injected from next.config (empty at the custom-domain root, "/texas-ringer"
 * on the GitHub Pages project URL).
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function asset(path: string): string {
  return `${BASE_PATH}${path}`
}
