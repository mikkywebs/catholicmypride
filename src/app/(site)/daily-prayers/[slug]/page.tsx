import { WhatsAppJoin } from '@/components/whatsapp-join'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { AudioPlayer } from '@/components/audio-player'
import { Reactions, ShareBar, ViewCount } from '@/components/engage'
import { Breadcrumb, Featured, Prose } from '@/components/ui'
import { getPrayer, getSettings } from '@/lib/data'
import { dateFromPrayerSlug } from '@/lib/daily-prayer'
import { addDays, formatLong } from '@/lib/liturgical'
import Link from 'next/link'
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
        {!p.category && dateFromPrayerSlug(p.slug) && <p className="eyebrow m-0">Daily Prayer from the Word</p>}
        <h1 className="m-0 font-serif text-[40px] font-semibold leading-[1.1] sm:text-[50px]">{p.title}</h1>
        <div className="flex flex-wrap justify-center gap-x-4 text-[15px] text-muted"><span>{readMinutes(p.body_md)} min</span><ViewCount section="Daily Prayers" threshold={s.view_threshold} /></div>
      </div>
      <Featured src={p.featured_image || (dateFromPrayerSlug(p.slug) ? s.default_prayer_image : null)} alt={p.featured_image ? p.image_alt : s.default_prayer_alt} priority />
      <ShareBar title={p.title} />
      {p.audio_url && <AudioPlayer src={p.audio_url} label="Listen and pray along" initialSeconds={p.audio_seconds} />}
      <Prose html={md(p.body_md)} />
      <Reactions type="prayer" id={p.slug} kinds={['love', 'amen', 'thumbs']} title="Did you pray along?" />
      <WhatsAppJoin url={s.whatsapp_channel_url} />
      {dateFromPrayerSlug(p.slug) && (() => {
        const d = dateFromPrayerSlug(p.slug)!
        return (
          <nav aria-label="Other days" className="flex flex-wrap justify-between gap-3.5 border-t border-line pt-5">
            <Link href={`/daily-prayers/prayer-${addDays(d, -1)}`} className="flex flex-col py-1.5 text-ink no-underline"><span className="text-[13px] text-muted">← Previous day</span><span className="font-semibold">{formatLong(addDays(d, -1))}</span></Link>
            <Link href={`/daily-prayers/prayer-${addDays(d, 1)}`} className="flex flex-col items-end py-1.5 text-ink no-underline"><span className="text-[13px] text-muted">Next day →</span><span className="font-semibold">{formatLong(addDays(d, 1))}</span></Link>
          </nav>
        )
      })()}
    </div>
  )
}
