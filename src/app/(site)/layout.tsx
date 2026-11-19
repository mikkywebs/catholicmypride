import { Footer } from '@/components/footer'
import { Suspense } from 'react'
import { Header, HeaderShell, type NavData } from '@/components/header'
import { MusicBar } from '@/components/music-bar'
import { ScrollTools } from '@/components/engage'
import { Ticker } from '@/components/ticker'
import { getSectionFlags, getSettings, getSongs } from '@/lib/data'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, flags, songs] = await Promise.all([getSettings(), getSectionFlags(), getSongs(300)])
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
  // Music bar: items the admin put on the bar (each with its own schedule), else the fallback.
  const playable = songs.filter((x) => x.audio_url)
  const library = playable.map((x) => ({ id: x.id, slug: x.slug, title: x.title, src: x.audio_url!, cover: x.featured_image }))
  const timedIds = new Set(playable.filter((x) => x.bar_times?.length).map((x) => x.id))
  const timed = playable.filter((x) => x.bar_times?.length).map((x) => ({ id: x.id, title: x.title, times: x.bar_times ?? [], season: x.bar_season ?? 'all' }))
  const fallback = s.music_fallback === 'none' ? [] : playable.filter((x) => !timedIds.has(x.id)).filter((x) => s.music_fallback === 'all' || (s.music_fallback === 'audio' ? x.kind === 'audio' : x.kind !== 'audio')).map((x) => x.id)
  // Prayers with set times (Angelus, Divine Mercy) only ever play at their times.
  const slots = playable.filter((x) => x.on_bar && !timedIds.has(x.id)).map((x) => ({ id: x.id, title: x.title, days: x.bar_days ?? [], start: x.bar_start, end: x.bar_end, order: x.bar_order ?? 0 }))

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
      <MusicBar library={library} slots={slots} loop={s.music_loop !== 'once'} fallback={fallback} timed={timed} />
    </div>
  )
}
