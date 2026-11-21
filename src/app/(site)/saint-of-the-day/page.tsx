import type { Metadata } from 'next'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { SaintView, recentHeading } from '@/components/saint-view'
import { EmptyState, H1 } from '@/components/ui'
import { getReading, getSaintForDate, getSaintsAround, getSaintsForDate, getSettings } from '@/lib/data'
import Link from 'next/link'
import { todayISO } from '@/lib/liturgical'

export const metadata: Metadata = {
  title: 'Saint or Feast of the Day',
  description: "Today's Catholic saint or Church feast: the life story or meaning of the day, with a prayer.",
  alternates: { canonical: '/saint-of-the-day' },
}

export default function Page() {
  return <Suspense fallback={<div className="h-96" />}><Today /></Suspense>
}

async function Today() {
  await connection()
  const today = todayISO()
  const [saint, s, week, all] = await Promise.all([getSaintForDate(today), getSettings(), getSaintsAround(today), getSaintsForDate(today)])
  if (!saint) {
    // No saint or feast in the calendar today: the day's readings take the space.
    const r = await getReading(today)
    if (!r) return <div className="mx-auto max-w-[820px] px-6 py-16 text-center"><H1>Feast of the Day</H1><EmptyState>Today&apos;s saint or feast will be posted soon.</EmptyState></div>
    return (
      <div className="mx-auto flex max-w-[820px] flex-col gap-6 px-6 pb-[72px] pt-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="eyebrow m-0">Today in the Church</p>
          <H1>{r.title ?? 'Today’s Mass readings'}</H1>
          <p className="m-0 max-w-xl text-muted">No saint is celebrated in the Church&apos;s calendar today. Pray with the Word of God instead.</p>
        </div>
        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-6 py-7 sm:px-8">
          <dl className="m-0 grid gap-x-6 gap-y-2.5 sm:grid-cols-[auto_1fr]">
            {([['First Reading', r.first_ref], ['Psalm', r.psalm_ref], ['Second Reading', r.second_ref], ['Gospel Acclamation', r.acclamation_ref], ['Gospel', r.gospel_ref]] as const).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="contents"><dt className="font-semibold text-muted">{k}</dt><dd className="m-0 font-semibold">{v}</dd></div>
            ))}
          </dl>
          {r.psalm_response && <p className="m-0 italic text-muted">R. {r.psalm_response}</p>}
          <Link href={`/mass-readings/${today}`} className="self-start rounded-md bg-accent px-5 py-2.5 font-semibold text-accent-ink no-underline">Read today&apos;s Mass readings</Link>
        </section>
        {week.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="m-0 border-b border-line pb-2.5 font-serif text-[28px] font-semibold">{recentHeading(week)}</h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {week.map((w) => <li key={w.slug}><Link href={`/saint-of-the-day/${w.slug}`} className="font-semibold">{w.name}</Link>{[w.feast_label, w.celebration].filter(Boolean).length > 0 && <span className="text-muted"> · {[w.feast_label, w.celebration].filter(Boolean).join(' · ')}</span>}</li>)}
            </ul>
          </section>
        )}
      </div>
    )
  }
  return <SaintView saint={saint} s={s} week={week} others={all.filter((o) => o.slug !== saint.slug)} />
}
