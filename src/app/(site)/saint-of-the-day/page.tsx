import type { Metadata } from 'next'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { SaintView } from '@/components/saint-view'
import { EmptyState, H1 } from '@/components/ui'
import { getSaintForDate, getSaintsAround, getSettings } from '@/lib/data'
import { todayISO } from '@/lib/liturgical'

export const metadata: Metadata = {
  title: 'Saint of the Day',
  description: "Today's Catholic saint: life story, patronage and a prayer to the saint.",
  alternates: { canonical: '/saint-of-the-day' },
}

export default function Page() {
  return <Suspense fallback={<div className="h-96" />}><Today /></Suspense>
}

async function Today() {
  await connection()
  const today = todayISO()
  const [saint, s, week] = await Promise.all([getSaintForDate(today), getSettings(), getSaintsAround(today)])
  if (!saint) return <div className="mx-auto max-w-[820px] px-6 py-16 text-center"><H1>Saint of the Day</H1><EmptyState>Today&apos;s saint will be posted soon.</EmptyState></div>
  return <SaintView saint={saint} s={s} week={week} />
}
