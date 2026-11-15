import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { AudioPlayer } from '@/components/audio-player'
import { Reactions, ShareBar, ViewCount } from '@/components/engage'
import { Breadcrumb, Featured, Prose } from '@/components/ui'
import { getPrayer, getSettings } from '@/lib/data'
import { md, readMinutes } from '@/lib/format'

export async function generateMetadata({ params }: PageProps<'/daily-prayers/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const p = await getPrayer(slug)
  if (!p) return {}
  const title = p.seo_title || p.title
  const description = p.seo_description || `Pray the ${p.title}. ${p.body_md.slice(0, 120).replace(/[#*_>\n]/g, ' ').trim()}…`
  return { title, description, alternates: { canonical: `/daily-prayers/${slug}` }, openGraph: { title, description, images: p.featured_image ? [p.featured_image] : undefined } }
}

export default function Page(props: PageProps<'/daily-prayers/[slug]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content params={props.params} /></Suspense>
}

async function Content({ params }: { params: PageProps<'/daily-prayers/[slug]'>['params'] }) {
  const { slug } = await params
  const [p, s] = await Promise.all([getPrayer(slug), getSettings()])
  if (!p) notFound()
  return (
    <div className="mx-auto flex max-w-[780px] flex-col gap-6 px-6 pb-[72px] pt-8">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Daily Prayers', href: '/daily-prayers' }, { label: p.title }]} />
      <div className="flex flex-col items-center gap-3 text-center">
        {p.category && <p className="eyebrow m-0">{p.category.name}</p>}
        <h1 className="m-0 font-serif text-[40px] font-semibold leading-[1.1] sm:text-[50px]">{p.title}</h1>
        <div className="flex flex-wrap justify-center gap-x-4 text-[15px] text-muted"><span>{readMinutes(p.body_md)} min</span><ViewCount section="Daily Prayers" threshold={s.view_threshold} /></div>
      </div>
      <Featured src={p.featured_image} alt={p.image_alt} priority />
      <ShareBar title={p.title} />
      {p.audio_url && <AudioPlayer src={p.audio_url} label="Listen and pray along" initialSeconds={p.audio_seconds} />}
      <Prose html={md(p.body_md)} />
      <Reactions type="prayer" id={p.id} kinds={['love', 'amen', 'thumbs']} title="Did you pray along?" />
    </div>
  )
}
