import { StayConnected } from '@/components/whatsapp-join'
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
import { currentCycle, novenaEnd, novenaFirstDate, novenaLength, novenaStart } from '@/lib/novena-days'
import { todayISO } from '@/lib/liturgical'

export async function generateMetadata({ params }: PageProps<'/novenas/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const n = await getNovena(slug)
  if (!n) return {}
  const title = n.seo_title || `${n.title}: ${novenaLength(n)} Days of Prayer`
  // Yearly novenas: dates without the year, so the description stays true every year.
  const when = (iso: string) => (n.repeats_yearly ? dateLabel(iso).replace(/ \d{4}$/, '') : dateLabel(iso))
  const description = n.seo_description || `Pray the ${n.title} from ${when(novenaFirstDate(n))} to ${when(novenaEnd(n))}, with a prayer for each day.`
  return { title, description, alternates: { canonical: `/novenas/${slug}` }, openGraph: { title, description, images: n.featured_image ? [n.featured_image] : undefined } }
}

export default function Page(props: PageProps<'/novenas/[slug]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content {...props} /></Suspense>
}

async function Content({ params, searchParams }: PageProps<'/novenas/[slug]'>) {
  const { slug } = await params
  const sp = await searchParams
  const [found, s, list] = await Promise.all([getNovena(slug), getSettings(), getNovenas()])
  if (!found) notFound()
  const today = todayISO()
  const n = currentCycle(found, today)
  const all = list.map((x) => currentCycle(x, today)).sort((a, b) => novenaFirstDate(a).localeCompare(novenaFirstDate(b)))
  const start = novenaStart(n)
  const length = novenaLength(n)
  const dayParam = typeof sp.day === 'string' && sp.day !== '' ? Number(sp.day) : NaN
  const initial = Number.isInteger(dayParam) && dayParam >= (n.has_opening ? 0 : 1) && dayParam <= length ? dayParam : null
  const days = (n.days ?? []).map((d) => ({ day: d.day, title: d.title, html: md(d.prayer_md), audio_url: d.audio_url, audio_seconds: d.audio_seconds }))
  const upcoming = all.filter((x) => x.id !== n.id && novenaEnd(x) >= today).slice(0, 3)
  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-6 px-6 pb-[72px] pt-8">
      <JsonLd data={articleLd({ title: n.title, description: n.seo_description, image: n.featured_image, path: `/novenas/${slug}`, published: novenaFirstDate(n) })} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Novenas', href: '/novenas' }, { label: n.feast_name || n.title }]} />
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="eyebrow m-0">Novena · Feast day {dateLabel(n.feast_date)}</p>
        <h1 className="m-0 font-serif text-[40px] font-semibold leading-[1.1] sm:text-[52px]">{n.title}</h1>
        <div className="flex flex-wrap justify-center gap-x-4 text-[15px] text-muted"><span>{length} days · {dateLabel(novenaFirstDate(n))} – {dateLabel(novenaEnd(n))}</span><ViewCount section="Novenas" threshold={s.view_threshold} /></div>
      </div>
      {today === n.feast_date ? (
        <p role="status" className="m-0 rounded-2xl bg-accent-soft px-6 py-4 text-center text-[17px] font-semibold text-eyebrow">
          🎉 Today we celebrate {n.feast_name ? n.feast_name.replace(/^The /, 'the ') : 'the feast'}! Thank you for praying the novena with us.
        </p>
      ) : null}
      <Featured src={n.featured_image} alt={n.image_alt} priority />
      <ShareBar title={n.title} />
      {n.intro_md && <div className="prose-cmp" dangerouslySetInnerHTML={{ __html: md(n.intro_md) }} />}
      <NovenaDays novenaId={n.id} days={days} startISO={start} length={length} hasOpening={Boolean(n.has_opening)} commonHtml={md(n.common_prayers_md)} repeat={n.repeat_prayer_md ? { html: md(n.repeat_prayer_md), count: n.repeat_count } : null} initial={initial} allowDownload={Boolean(n.allow_download)} />
      <StayConnected s={{ whatsapp_channel_url: s.whatsapp_channel_url, youtube_url: s.youtube_url, facebook_url: s.facebook_url, x_url: s.x_url }} />
      {upcoming.length > 0 && (
        <section className="reveal flex flex-col gap-3.5">
          <h2 className="m-0 border-b border-line pb-2.5 font-serif text-[30px] font-semibold">More novenas</h2>
          {upcoming.map((u) => (
            <Link key={u.id} href={`/novenas/${u.slug}`} className="flex flex-wrap justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-4 text-ink no-underline">
              <strong>{u.title}</strong><span className="text-muted">Begins {dateLabel(novenaFirstDate(u))}</span>
            </Link>
          ))}
        </section>
      )}
    </div>
  )
}
