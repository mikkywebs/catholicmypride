import { StayConnected } from '@/components/whatsapp-join'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { JsonLd, articleLd } from '@/components/article-bits'
import { AudioPlayer } from '@/components/audio-player'
import { Reactions, ShareBar, ViewCount } from '@/components/engage'
import { Breadcrumb, Featured, Prose } from '@/components/ui'
import { getChaplet, getChaplets, getSettings } from '@/lib/data'
import { md, readMinutes } from '@/lib/format'

export async function generateMetadata({ params }: PageProps<'/chaplets/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const c = await getChaplet(slug)
  if (!c) return {}
  const title = c.seo_title || `How to Pray the ${c.title}`
  const description = c.seo_description || c.intro || `Step-by-step guide to praying the ${c.title}.`
  return { title, description, alternates: { canonical: `/chaplets/${slug}` }, openGraph: { title, description, type: 'article', images: c.featured_image ? [c.featured_image] : undefined } }
}

export default function Page(props: PageProps<'/chaplets/[slug]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content params={props.params} /></Suspense>
}

async function Content({ params }: { params: PageProps<'/chaplets/[slug]'>['params'] }) {
  const { slug } = await params
  const [c, s, all] = await Promise.all([getChaplet(slug), getSettings(), getChaplets()])
  if (!c) notFound()
  const others = all.filter((x) => x.id !== c.id).slice(0, 4)
  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-6 px-6 pb-[72px] pt-8">
      <JsonLd data={articleLd({ title: `How to Pray the ${c.title}`, description: c.intro, image: c.featured_image, path: `/chaplets/${slug}` })} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Chaplets', href: '/chaplets' }, { label: c.title }]} />
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="eyebrow m-0">Chaplet</p>
        <h1 className="m-0 font-serif text-[40px] font-semibold leading-[1.1] sm:text-[52px]">{c.title}</h1>
        <div className="flex flex-wrap justify-center gap-x-4 text-[15px] text-muted"><span>{readMinutes(c.body_md)} min</span><ViewCount section="Chaplets" threshold={s.view_threshold} /></div>
      </div>
      <Featured src={c.featured_image} alt={c.image_alt} priority />
      <ShareBar title={c.title} />
      {c.intro && <p className="m-0 text-[19px] leading-relaxed text-body">{c.intro}</p>}
      {c.audio_url && <AudioPlayer src={c.audio_url} label="Pray along" initialSeconds={c.audio_seconds} downloadName={c.allow_download ? `${c.slug}.mp3` : undefined} />}
      <Prose html={md(c.body_md)} />
      <Reactions type="chaplet" id={c.id} kinds={['love', 'amen', 'thumbs']} title="Did you pray along?" />
      <StayConnected s={{ whatsapp_channel_url: s.whatsapp_channel_url, youtube_url: s.youtube_url, facebook_url: s.facebook_url, x_url: s.x_url }} />
      {others.length > 0 && (
        <section className="reveal flex flex-col gap-3.5">
          <h2 className="m-0 border-b border-line pb-2.5 font-serif text-[30px] font-semibold">More chaplets</h2>
          {others.map((o) => (
            <Link key={o.id} href={`/chaplets/${o.slug}`} className="rounded-2xl border border-line bg-surface px-5 py-4 font-semibold text-ink no-underline">{o.title}</Link>
          ))}
        </section>
      )}
    </div>
  )
}
