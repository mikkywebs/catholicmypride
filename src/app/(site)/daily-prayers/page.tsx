import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { PrayerTabs, type TabPrayer } from '@/components/prayer-tabs'
import { EmptyState, Eyebrow, H1 } from '@/components/ui'
import { getDailyPrayer, getPrayers, getSettings } from '@/lib/data'
import { Featured } from '@/components/ui'
import { addDays, formatLong } from '@/lib/liturgical'
import { md, readMinutes } from '@/lib/format'
import { formatShort, todayISO } from '@/lib/liturgical'
import type { Prayer } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Daily Catholic Prayers: Morning, Midday, Evening and Night',
  description: 'Catholic prayers for every part of the day, plus a library of traditional prayers and devotions.',
  alternates: { canonical: '/daily-prayers' },
}

export default function Page() {
  return <Suspense fallback={<div className="h-96" />}><Content /></Suspense>
}

async function Content() {
  await connection()
  const today = todayISO()
  const [all, daily, s] = await Promise.all([getPrayers(), getDailyPrayer(today), getSettings()])
  const pick = (k: Prayer['time_of_day']): TabPrayer => {
    const list = all.filter((p) => p.time_of_day === k)
    const p = list.find((x) => x.show_on === today) ?? list.sort((a, b) => (b.show_on ?? '').localeCompare(a.show_on ?? ''))[0]
    if (!p) return null
    return { key: k!, label: k!, slug: p.slug, title: p.title, html: md(p.body_md), audio: p.audio_url, seconds: p.audio_seconds, image: p.featured_image, alt: p.image_alt, minutes: readMinutes(p.body_md) }
  }
  const tabs = { morning: pick('morning'), midday: pick('midday'), evening: pick('evening'), night: pick('night') }
  const library = all.filter((p) => p.category)
  const groups = library.reduce<Record<string, Prayer[]>>((acc, p) => { (acc[p.category!.name] ??= []).push(p); return acc }, {})

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-7 px-6 pb-[72px] pt-8">
      <div className="text-center">
        <Eyebrow>Daily Prayers · {formatShort(today)}</Eyebrow>
        <H1 className="mt-2">Pray through the day</H1>
      </div>
      {daily && (
        <Link href={`/daily-prayers/${daily.slug}`} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-ink no-underline md:flex-row">
          {(daily.featured_image || s.default_prayer_image) && <div className="md:w-[45%]"><Featured src={daily.featured_image || s.default_prayer_image} alt={daily.featured_image ? daily.image_alt : s.default_prayer_alt} rounded="rounded-none" className="h-full" /></div>}
          <div className="flex flex-1 flex-col gap-2.5 px-6 py-7 sm:px-8">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Today&apos;s prayer from the Word</p>
            <h2 className="m-0 font-serif text-[32px] font-semibold leading-tight">{daily.title}</h2>
            <p className="m-0 text-muted">{daily.seo_description}</p>
            <span className="pt-1 font-semibold text-accent">Pray now · {readMinutes(daily.body_md)} min →</span>
          </div>
        </Link>
      )}
      {daily && (
        <p className="m-0 text-center text-[15px] text-muted">Earlier days: {[1, 2, 3, 4, 5, 6].map((n, i) => (
          <span key={n}>{i > 0 && ' · '}<Link href={`/daily-prayers/prayer-${addDays(today, -n)}`}>{formatLong(addDays(today, -n)).replace(/, \d{4}$/, '').replace(/ \d{4}$/, '')}</Link></span>
        ))}</p>
      )}
      {all.length === 0 && !daily && <EmptyState>Prayers will be posted soon.</EmptyState>}
      <PrayerTabs tabs={tabs} />
      {Object.keys(groups).length > 0 && (
        <section className="reveal flex flex-col gap-4">
          <h2 className="m-0 border-b border-line pb-2.5 font-serif text-[32px] font-semibold">Prayer library</h2>
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
            {Object.entries(groups).flatMap(([cat, ps]) => ps.map((p) => (
              <Link key={p.id} href={`/daily-prayers/${p.slug}`} className="flex flex-col gap-1 rounded-2xl border border-line bg-surface px-5 py-4 text-ink no-underline">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-eyebrow">{cat}</span>
                <strong className="text-lg">{p.title}</strong>
              </Link>
            )))}
          </div>
        </section>
      )}
    </div>
  )
}
