import { Footer } from '@/components/footer'
import { Suspense } from 'react'
import { Header, HeaderShell, type NavData } from '@/components/header'
import { MusicBar } from '@/components/music-bar'
import { ScrollTools } from '@/components/engage'
import { Ticker } from '@/components/ticker'
import { getPlaylists, getSectionFlags, getSettings, getSongs } from '@/lib/data'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, flags, songs, playlists] = await Promise.all([getSettings(), getSectionFlags(), getSongs(300), getPlaylists()])
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
  // Music bar: scheduled playlists chosen by the admin, with a fallback when none is on.
  const playable = songs.filter((x) => x.audio_url)
  const library = playable.map((x) => ({ id: x.id, slug: x.slug, title: x.title, src: x.audio_url!, cover: x.featured_image }))
  const fallback = s.music_fallback === 'none' ? [] : playable.filter((x) => s.music_fallback === 'all' || (s.music_fallback === 'audio' ? x.kind === 'audio' : x.kind !== 'audio')).map((x) => x.id)
  const scheduled = playlists.map((p) => ({ days: p.days, start: p.start_time, end: p.end_time, loop: p.loop_mode !== 'once', sort: p.sort, trackIds: p.items }))

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
      <MusicBar library={library} playlists={scheduled} fallback={fallback} />
    </div>
  )
}
