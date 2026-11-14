import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { JsonLd } from '@/components/article-bits'
import { AudioPlayer } from '@/components/audio-player'
import { Reactions, ShareBar, ViewCount } from '@/components/engage'
import { Lyrics } from '@/components/lyrics'
import { Breadcrumb, ButtonLink, Featured } from '@/components/ui'
import { getSettings, getSong, getSongs } from '@/lib/data'
import { duration, slugify, SITE_URL } from '@/lib/format'

export async function generateMetadata({ params }: PageProps<'/music/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const s = await getSong(slug)
  if (!s) return {}
  const title = s.seo_title || `${s.title} (Catholic Song)`
  const description = s.seo_description || s.about || `Listen to and download ${s.title} by Catholic My Pride.`
  return { title, description, alternates: { canonical: `/music/${slug}` }, openGraph: { title, description, type: 'music.song', images: s.featured_image ? [s.featured_image] : undefined } }
}

export default function Page(props: PageProps<'/music/[slug]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content params={props.params} /></Suspense>
}

async function Content({ params }: { params: PageProps<'/music/[slug]'>['params'] }) {
  const { slug } = await params
  const [song, s, all] = await Promise.all([getSong(slug), getSettings(), getSongs(60)])
  if (!song) notFound()
  const related = all.filter((x) => x.id !== song.id && (!song.category_id || x.category_id === song.category_id)).slice(0, 3)
  const len = duration(song.duration_seconds)
  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-7 px-6 pb-[72px] pt-8">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'MusicRecording', name: song.title, url: `${SITE_URL}/music/${slug}`, byArtist: { '@type': 'MusicGroup', name: 'Catholic My Pride' }, image: song.featured_image ?? undefined }} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Music', href: '/music' }, { label: song.title }]} />
      <Featured src={song.featured_image} alt={song.image_alt} priority />
      <ShareBar title={song.title} />
      <div className="flex flex-col gap-2.5">
        <p className="eyebrow m-0">{[song.category?.name, len].filter(Boolean).join(' · ')}</p>
        <h1 className="m-0 font-serif text-[42px] font-semibold leading-[1.1] sm:text-[54px]">{song.title}</h1>
        <div className="text-[15px] text-muted"><ViewCount section="Music" threshold={s.view_threshold} /></div>
        {song.about && <p className="m-0 text-[19px] text-muted">{song.about}</p>}
      </div>
      {song.lyrics && <Lyrics text={song.lyrics} />}
      {song.audio_url && <AudioPlayer src={song.audio_url} label={song.title} initialSeconds={song.duration_seconds} downloadName={song.allow_download ? `${slugify(song.title)}.mp3` : undefined} />}
      <Reactions type="song" id={song.id} kinds={['wow', 'awesome', 'emotional']} title="How did this song touch you?" />
      <section className="reveal flex flex-col items-center gap-3 rounded-2xl border border-eyebrow px-7 py-9 text-center">
        <h2 className="m-0 font-serif text-[34px] font-semibold">Blessed by this song?</h2>
        <p className="m-0 max-w-[560px] text-muted">Your support helps us create more hymns and share the faith with families everywhere.</p>
        <ButtonLink href="/donate">Donate</ButtonLink>
      </section>
      {related.length > 0 && (
        <section className="reveal flex flex-col gap-4">
          <h2 className="m-0 border-b border-line pb-3 font-serif text-[34px] font-semibold">Related songs</h2>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {related.map((r) => (
              <Link key={r.id} href={`/music/${r.slug}`} className="flex flex-col gap-2 text-ink no-underline">
                <Featured src={r.featured_image} alt={r.image_alt} rounded="rounded-2xl" />
                <span className="font-serif text-[22px] font-semibold leading-tight">{r.title}</span>
                <span className="text-sm text-muted">{[r.category?.name, duration(r.duration_seconds)].filter(Boolean).join(' · ')}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
