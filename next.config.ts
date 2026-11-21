import type { NextConfig } from 'next'

const supabaseHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname } catch { return '' }
})()

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Daily Mass readings data, read from disk by the server.
  outputFileTracingIncludes: { '/**': ['./data/lectionary/**/*.json', './data/saints/**/*.json', './data/faith/**/*.json'] },
  // Old addresses still work: they forward permanently to the new ones.
  async redirects() {
    return [
      { source: '/novenas/saint-andrew-christmas-novena-2026', destination: '/novenas/saint-andrew-christmas-novena', permanent: true },
      { source: '/novenas/novena-immaculate-conception-2026', destination: '/novenas/novena-immaculate-conception', permanent: true },
      // The audio section moved from /music (it holds songs, prayers and announcements).
      { source: '/music', destination: '/audio', permanent: true },
      // The blog category 'archive' was renamed Church News.
      { source: '/blog', has: [{ type: 'query', key: 'category', value: 'archive' }], destination: '/blog?category=church-news', permanent: true },
      { source: '/music/:slug', destination: '/audio/:slug', permanent: true },
    ]
  },
  env: { NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()) },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      ...(supabaseHost ? [{ protocol: 'https' as const, hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }] : []),
    ],
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
}

export default nextConfig
