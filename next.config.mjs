/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export — no Node server needed. Output lands in ./out
  output: 'export',
  // Folder-style URLs (/events/2025/index.html) for clean static hosting.
  trailingSlash: true,
  // The export has no image optimizer; serve images as-is.
  images: { unoptimized: true },
}

export default nextConfig
