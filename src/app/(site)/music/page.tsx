import type { Metadata } from 'next'
import { MusicBrowser } from '@/components/music-browser'
import { EmptyState, Eyebrow, H1 } from '@/components/ui'
import { getCategories, getSongs } from '@/lib/data'
import { duration } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Catholic Songs, Audio Messages and Prayers',
  description: 'Listen to Catholic hymns, devotional songs, audio messages and prayers from Catholic My Pride, organised by category.',
  alternates: { canonical: '/music' },
}

export default async function Page() {
  const [all, cats] = await Promise.all([getSongs(500), getCategories('song')])
  const items = all.map((s) => ({ id: s.id, slug: s.slug, title: s.title, kind: s.kind === 'audio' ? 'audio' as const : 'song' as const, src: s.audio_url, cover: s.featured_image, length: duration(s.duration_seconds), categoryId: s.category_id }))
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-6 pb-[72px] pt-10">
      <div className="text-center"><Eyebrow>Music &amp; Audio</Eyebrow><H1 className="mt-2">Songs, messages &amp; prayers</H1></div>
      {items.length === 0 ? <EmptyState>Songs and audio will be posted soon.</EmptyState> : <MusicBrowser items={items} categories={cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))} />}
    </div>
  )
}
