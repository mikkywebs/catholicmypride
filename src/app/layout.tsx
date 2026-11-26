import type { Metadata, Viewport } from 'next'
import { themeScript } from '@/components/theme'
import { OfflineGuard } from '@/components/offline-guard'
import { SITE_URL } from '@/lib/format'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Catholic My Pride', template: '%s | Catholic My Pride' },
  description: "Daily Mass readings with reflections, novenas, prayers, saints and feasts of the day, Catholic hymns and ebooks. Spreading the Gospel and sharing Christ's love.",
  applicationName: 'Catholic My Pride',
  keywords: ['Catholic', 'Mass readings', 'daily reflection', 'novena', 'Catholic prayers', 'Saint of the day', 'Feast of the day', 'Catholic songs', 'Catholic faith', 'Catholic Church worldwide'],
  icons: { icon: [{ url: '/icon-32.png', sizes: '32x32' }, { url: '/icon-192.png', sizes: '192x192' }], apple: '/icon-180.png' },
  openGraph: { type: 'website', siteName: 'Catholic My Pride', locale: 'en_GB', images: ['/icon-512.png'] },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f3e8' },
    { media: '(prefers-color-scheme: dark)', color: '#14171f' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">{children}<OfflineGuard /></body>
    </html>
  )
}
