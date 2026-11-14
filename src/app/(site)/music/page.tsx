import type { Metadata } from 'next'
import { SongRow } from '@/components/song-row'
import { EmptyState, Eyebrow, H1 } from '@/components/ui'
import { getSongs } from '@/lib/data'
import { duration } from '@/lib/format'
import type { Song } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Catholic Songs, Audio Messages and Prayers',
  description: 'Listen to Catholic hymns, devotional songs, audio messages and prayers from Catholic My Pride.',
  alternates: { canonical: '/music' },
}

function Group({ title, items }: { title: string; items: Song[] }) {
  if (!items.length) return null
  const byCat = items.reduce<Record<string, Song[]>>((acc, s) => { (acc[s.category?.name ?? ''] ??= []).push(s); return acc }, {})
  return (
    <section className="reveal flex flex-col gap-5">
      <h2 className="m-0 border-b border-line pb-3 font-serif text-[34px] font-semibold">{title}</h2>
      {Object.entries(byCat).map(([cat, list]) => (
        <div key={cat || 'none'} className="flex flex-col gap-2.5">
          {cat && <h3 className="m-0 text-sm font-bold uppercase tracking-[0.12em] text-eyebrow">{cat}</h3>}
          {list.map((s) => <SongRow key={s.id} slug={s.slug} title={s.title} src={s.audio_url} cover={s.featured_image} meta={duration(s.duration_seconds) ?? ''} />)}
        </div>
      ))}
    </section>
  )
}

export default async function Page() {
  const all = await getSongs(300)
  const songs = all.filter((s) => s.kind !== 'audio')
  const audio = all.filter((s) => s.kind === 'audio')
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-10 px-6 pb-[72px] pt-10">
      <div className="text-center"><Eyebrow>Music &amp; Audio</Eyebrow><H1 className="mt-2">Songs, messages &amp; prayers</H1></div>
      {all.length === 0 && <EmptyState>Songs and audio will be posted soon.</EmptyState>}
      {audio.length > 0 && songs.length > 0 && (
        <nav aria-label="Jump to" className="flex justify-center gap-2">
          <a href="#songs" className="rounded-full border border-line bg-surface px-4 py-2 text-ink no-underline">Songs</a>
          <a href="#audio" className="rounded-full border border-line bg-surface px-4 py-2 text-ink no-underline">Audio messages &amp; prayers</a>
        </nav>
      )}
      <div id="songs" className="scroll-mt-28"><Group title="Songs" items={songs} /></div>
      <div id="audio" className="scroll-mt-28"><Group title="Audio messages & prayers" items={audio} /></div>
    </div>
  )
}
