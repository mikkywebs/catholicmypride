import { Footer } from '@/components/footer'
import { Suspense } from 'react'
import { Header, HeaderShell, type NavData } from '@/components/header'
import { MusicBar } from '@/components/music-bar'
import { ScrollTools } from '@/components/engage'
import { Ticker } from '@/components/ticker'
import { getSectionFlags, getSettings, getSongs } from '@/lib/data'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, flags, songs] = await Promise.all([getSettings(), getSectionFlags(), getSongs(30)])
  const nav: NavData = {
    logoUrl: s.logo_url,
    siteName: s.site_name,
    tagline: s.tagline,
    pray: [
      flags.novenas && { label: 'Novenas', href: '/novenas' },
      flags.prayers && { label: 'Daily Prayers', href: '/daily-prayers' },
      flags.chaplets && { label: 'Chaplets', href: '/chaplets' },
      flags.readings && { label: 'Mass Readings', href: '/mass-readings' },
    ].filter(Boolean) as NavData['pray'],
    resources: [
      flags.blog && { label: 'Blog', href: '/blog' },
      flags.songs && { label: 'Music & Audio', href: '/music' },
      flags.books && { label: 'Ebooks', href: '/ebooks' },
      flags.churches && { label: 'Church Directory', href: '/churches' },
    ].filter(Boolean) as NavData['resources'],
    saint: flags.saints,
    wall: flags.wall,
  }
  // The music bar plays songs only; spoken messages and prayers stay on their own pages.
  const tracks = songs.filter((x) => x.audio_url && x.kind !== 'audio').map((x) => ({ slug: x.slug, title: x.title, src: x.audio_url!, cover: x.featured_image }))

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-14 focus:z-[70] focus:rounded focus:bg-surface focus:px-4 focus:py-2">Skip to content</a>
      <Ticker />
      <Suspense fallback={<HeaderShell nav={nav} path="" />}>
        <Header nav={nav} />
      </Suspense>
      <ScrollTools />
      <main id="main" className="flex-1">{children}</main>
      <Footer s={s} flags={flags} />
      <MusicBar tracks={tracks} />
    </div>
  )
}
