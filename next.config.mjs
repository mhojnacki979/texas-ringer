/** @type {import('next').NextConfig} */

// On GitHub Pages project sites the app is served from /<repo>/. A custom
// domain serves from root, so set BASE_PATH='' when the domain is attached.
const basePath = process.env.BASE_PATH ?? '/texas-ringer'

const nextConfig = {
  // Static HTML export — no Node server needed. Output lands in ./out
  output: 'export',
  // Folder-style URLs (/events/2025/index.html) for clean static hosting.
  trailingSlash: true,
  // The export has no image optimizer; serve images as-is.
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
  // Exposed to components so static <img> srcs can be basePath-prefixed
  // (next/image does not do this under output:'export' + unoptimized).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
}

export default nextConfig
