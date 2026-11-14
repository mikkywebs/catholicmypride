import type { Metadata } from 'next'
import { SongRow } from '@/components/song-row'
import { EmptyState, Eyebrow, H1 } from '@/components/ui'
import { getCategories, getSongs } from '@/lib/data'
import { duration } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Catholic Songs and Hymns',
  description: 'Listen to and download Catholic hymns and devotional songs from Catholic My Pride.',
  alternates: { canonical: '/music' },
}

export default async function Page() {
  const [songs, cats] = await Promise.all([getSongs(200), getCategories('song')])
  const groups = cats.map((c) => ({ c, list: songs.filter((s) => s.category_id === c.id) })).filter((g) => g.list.length)
  const other = songs.filter((s) => !s.category_id)
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-8 px-6 pb-[72px] pt-10">
      <div className="text-center"><Eyebrow>Music</Eyebrow><H1 className="mt-2">Hymns &amp; songs</H1></div>
      {songs.length === 0 && <EmptyState>Songs will be posted soon.</EmptyState>}
      {[...groups, ...(other.length ? [{ c: { id: 'other', name: 'More songs' }, list: other }] : [])].map(({ c, list }) => (
        <section key={c.id} className="reveal flex flex-col gap-2.5">
          <h2 className="m-0 mb-1 font-serif text-[30px] font-semibold">{c.name}</h2>
          {list.map((s) => <SongRow key={s.id} slug={s.slug} title={s.title} src={s.audio_url} cover={s.featured_image} meta={[s.category?.name, duration(s.duration_seconds)].filter(Boolean).join(' · ')} />)}
        </section>
      ))}
    </div>
  )
}
