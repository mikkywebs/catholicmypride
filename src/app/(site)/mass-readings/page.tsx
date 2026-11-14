import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { ReadingView } from '@/components/reading-view'
import { EmptyState, Eyebrow, H1 } from '@/components/ui'
import { getReading, getRecentReadings, getSettings } from '@/lib/data'
import { formatLong, liturgicalInfo, todayISO } from '@/lib/liturgical'

export const metadata: Metadata = {
  title: "Today's Mass Readings and Reflection",
  description: 'Daily Catholic Mass readings with the Responsorial Psalm, Gospel and a reflection for today.',
  alternates: { canonical: '/mass-readings' },
}

export default function Page() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Today />
    </Suspense>
  )
}

async function Today() {
  await connection()
  const today = todayISO()
  const [r, s, recent] = await Promise.all([getReading(today), getSettings(), getRecentReadings()])
  if (r) return <ReadingView r={r} s={s} />
  const info = liturgicalInfo(today)
  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-6 px-6 pb-[72px] pt-10">
      <div className="text-center">
        <Eyebrow>{formatLong(today)} · {info.season} · Year {info.cycle}</Eyebrow>
        <H1 className="mt-2">Mass Readings</H1>
      </div>
      <EmptyState>Today&apos;s readings will be posted soon.</EmptyState>
      {recent.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {recent.map((x) => (
            <li key={x.date}><Link href={`/mass-readings/${x.date}`} className="flex flex-wrap justify-between gap-2 rounded-xl border border-line bg-surface px-5 py-3.5 text-ink no-underline"><strong>{formatLong(x.date)}</strong><span className="text-muted">{x.gospel_ref}</span></Link></li>
          ))}
        </ul>
      )}
    </div>
  )
}
