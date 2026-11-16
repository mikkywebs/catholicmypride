import type { NextConfig } from 'next'

const supabaseHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname } catch { return '' }
})()

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Daily Mass readings data, read from disk by the server.
  outputFileTracingIncludes: { '/**': ['./data/lectionary/**/*.json', './data/saints/**/*.json'] },
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
