import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { JsonLd } from '@/components/article-bits'
import { AudioPlayer } from '@/components/audio-player'
import { Reactions, ShareBar, ViewCount, type Kind } from '@/components/engage'
import { Lyrics } from '@/components/lyrics'
import { Breadcrumb, ButtonLink, Portrait } from '@/components/ui'
import { getSettings, getSong, getSongs } from '@/lib/data'
import { duration, slugify, SITE_URL } from '@/lib/format'

const SONG_REACTIONS: Kind[] = ['love', 'wow', 'awesome', 'emotional']
const AUDIO_REACTIONS: Kind[] = ['love', 'amen', 'thumbs']

export async function generateMetadata({ params }: PageProps<'/music/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const s = await getSong(slug)
  if (!s) return {}
  const isSong = s.kind !== 'audio'
  const title = s.seo_title || `${s.title} (${isSong ? 'Catholic Song' : 'Catholic Audio'})`
  const description = s.seo_description || s.about || `Listen to ${s.title} by Catholic My Pride.`
  return { title, description, alternates: { canonical: `/music/${slug}` }, openGraph: { title, description, type: isSong ? 'music.song' : 'website', images: s.featured_image ? [s.featured_image] : undefined } }
}

export default function Page(props: PageProps<'/music/[slug]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content params={props.params} /></Suspense>
}

async function Content({ params }: { params: PageProps<'/music/[slug]'>['params'] }) {
  const { slug } = await params
  const [song, s, all] = await Promise.all([getSong(slug), getSettings(), getSongs(60)])
  if (!song) notFound()
  const isSong = song.kind !== 'audio'
  const related = all.filter((x) => x.id !== song.id && x.kind === song.kind && (!song.category_id || x.category_id === song.category_id)).slice(0, 4)
  const fill = related.length < 4 ? all.filter((x) => x.id !== song.id && x.kind === song.kind && !related.includes(x)).slice(0, 4 - related.length) : []
  const more = [...related, ...fill]
  const len = duration(song.duration_seconds)
  const typeLabel = isSong ? 'Song' : 'Audio message'
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-10 px-6 pb-[72px] pt-8">
      <JsonLd data={isSong
        ? { '@context': 'https://schema.org', '@type': 'MusicRecording', name: song.title, url: `${SITE_URL}/music/${slug}`, byArtist: { '@type': 'MusicGroup', name: 'Catholic My Pride' }, image: song.featured_image ?? undefined }
        : { '@context': 'https://schema.org', '@type': 'AudioObject', name: song.title, url: `${SITE_URL}/music/${slug}`, contentUrl: song.audio_url ?? undefined, description: song.about ?? undefined, image: song.featured_image ?? undefined }} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Music & Audio', href: '/music' }, { label: song.title }]} />
      <div className="flex flex-wrap items-start gap-8 lg:gap-12">
        <div className="w-full max-w-[380px] flex-[0_1_380px] max-md:mx-auto">
          <Portrait src={song.featured_image} alt={song.image_alt} priority />
          <div className="pt-4"><ShareBar title={song.title} /></div>
        </div>
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <p className="eyebrow m-0">{[typeLabel, song.category?.name, len].filter(Boolean).join(' · ')}</p>
            <h1 className="m-0 font-serif text-[40px] font-semibold leading-[1.1] sm:text-[52px]">{song.title}</h1>
            <div className="text-[15px] text-muted"><ViewCount section="Music & Audio" threshold={s.view_threshold} /></div>
            {song.about && <p className="m-0 text-[19px] text-muted">{song.about}</p>}
          </div>
          {song.lyrics && <Lyrics text={song.lyrics} label={isSong ? 'Lyrics' : 'Transcript'} />}
          {song.audio_url && <AudioPlayer src={song.audio_url} label={song.title} initialSeconds={song.duration_seconds} downloadName={song.allow_download ? `${slugify(song.title)}.mp3` : undefined} />}
          <Reactions
            type="song"
            id={song.id}
            kinds={isSong ? SONG_REACTIONS : AUDIO_REACTIONS}
            labels={isSong ? { love: 'Love it' } : undefined}
            title={isSong ? 'How did this song touch you?' : 'Did this message bless you?'}
          />
        </div>
      </div>
      <section className="reveal flex flex-col items-center gap-3 rounded-2xl border border-eyebrow px-7 py-9 text-center">
        <h2 className="m-0 font-serif text-[34px] font-semibold">{isSong ? 'Blessed by this song?' : 'Blessed by this message?'}</h2>
        <p className="m-0 max-w-[560px] text-muted">Your support helps us create more hymns, messages and prayers, and share the faith with families everywhere.</p>
        <ButtonLink href="/donate">Donate</ButtonLink>
      </section>
      {more.length > 0 && (
        <section className="reveal flex flex-col gap-4">
          <h2 className="m-0 border-b border-line pb-3 font-serif text-[34px] font-semibold">{isSong ? 'Related songs' : 'More audio messages'}</h2>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
            {more.map((r) => (
              <Link key={r.id} href={`/music/${r.slug}`} className="flex flex-col gap-2 text-ink no-underline">
                <Portrait src={r.featured_image} alt={r.image_alt} sizes="240px" />
                <span className="font-serif text-[21px] font-semibold leading-tight">{r.title}</span>
                <span className="text-sm text-muted">{[r.category?.name, duration(r.duration_seconds)].filter(Boolean).join(' · ')}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
