import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { JsonLd, articleLd } from '@/components/article-bits'
import { ShareBar, ViewCount } from '@/components/engage'
import { NovenaDays } from '@/components/novena-days'
import { Breadcrumb, Featured } from '@/components/ui'
import { getNovena, getNovenas, getSettings } from '@/lib/data'
import { dateLabel, md } from '@/lib/format'
import { addDays } from '@/lib/liturgical'

export async function generateMetadata({ params }: PageProps<'/novenas/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const n = await getNovena(slug)
  if (!n) return {}
  const title = n.seo_title || `${n.title}: 9 Days of Prayer`
  const description = n.seo_description || `Pray the ${n.title} from ${dateLabel(addDays(n.feast_date, -9))} to ${dateLabel(addDays(n.feast_date, -1))}, with a prayer for each day.`
  return { title, description, alternates: { canonical: `/novenas/${slug}` }, openGraph: { title, description, images: n.featured_image ? [n.featured_image] : undefined } }
}

export default function Page(props: PageProps<'/novenas/[slug]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content {...props} /></Suspense>
}

async function Content({ params, searchParams }: PageProps<'/novenas/[slug]'>) {
  const { slug } = await params
  const sp = await searchParams
  const [n, s, all] = await Promise.all([getNovena(slug), getSettings(), getNovenas()])
  if (!n) notFound()
  const start = addDays(n.feast_date, -9)
  const dayParam = Number(sp.day)
  const initial = dayParam >= 1 && dayParam <= 9 ? dayParam : null
  const days = (n.days ?? []).map((d) => ({ day: d.day, title: d.title, html: md(d.prayer_md), audio_url: d.audio_url, audio_seconds: d.audio_seconds }))
  const upcoming = all.filter((x) => x.id !== n.id).slice(0, 3)
  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-6 px-6 pb-[72px] pt-8">
      <JsonLd data={articleLd({ title: n.title, description: n.seo_description, image: n.featured_image, path: `/novenas/${slug}`, published: start })} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Novenas', href: '/novenas' }, { label: n.feast_name || n.title }]} />
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="eyebrow m-0">Novena · Feast day {dateLabel(n.feast_date)}</p>
        <h1 className="m-0 font-serif text-[40px] font-semibold leading-[1.1] sm:text-[52px]">{n.title}</h1>
        <div className="flex flex-wrap justify-center gap-x-4 text-[15px] text-muted"><span>Runs {dateLabel(start)} – {dateLabel(addDays(n.feast_date, -1))}</span><ViewCount section="Novenas" threshold={s.view_threshold} /></div>
      </div>
      <Featured src={n.featured_image} alt={n.image_alt} priority />
      <ShareBar title={n.title} />
      <NovenaDays days={days} startISO={start} commonHtml={md(n.common_prayers_md)} initial={initial} />
      {upcoming.length > 0 && (
        <section className="reveal flex flex-col gap-3.5">
          <h2 className="m-0 border-b border-line pb-2.5 font-serif text-[30px] font-semibold">More novenas</h2>
          {upcoming.map((u) => (
            <Link key={u.id} href={`/novenas/${u.slug}`} className="flex flex-wrap justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4 text-ink no-underline">
              <strong>{u.title}</strong><span className="text-muted">Begins {dateLabel(addDays(u.feast_date, -9))}</span>
            </Link>
          ))}
        </section>
      )}
    </div>
  )
}
