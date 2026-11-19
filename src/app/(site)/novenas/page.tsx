import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyState, Eyebrow, Featured, H1 } from '@/components/ui'
import { getNovenas } from '@/lib/data'
import { dateLabel } from '@/lib/format'
import { novenaFirstDate, novenaLength } from '@/lib/novena-days'

export const metadata: Metadata = {
  title: 'Catholic Novenas: Pray Day by Day',
  description: 'Pray Catholic novenas day by day, with a prayer and audio for each day, from nine-day novenas to the Saint Andrew Christmas Novena.',
  alternates: { canonical: '/novenas' },
}

export default async function Page() {
  const list = await getNovenas()
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-6 pb-[72px] pt-10">
      <div className="text-center">
        <Eyebrow>Novenas</Eyebrow>
        <H1 className="mt-2">Pray with us, day by day</H1>
        <p className="mx-auto mt-3 max-w-xl text-muted">Most novenas are nine days of prayer before a feast. Choose one and pray along each day.</p>
      </div>
      {list.length === 0 ? <EmptyState>Novenas will be posted soon.</EmptyState> : (
        <div className="grid gap-7 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {list.map((n) => (
            <Link key={n.id} href={`/novenas/${n.slug}`} className="reveal flex flex-col gap-3 text-ink no-underline">
              <Featured src={n.featured_image} alt={n.image_alt} rounded="rounded-2xl" />
              <p className="m-0 text-[13px] uppercase tracking-[0.1em] text-eyebrow">Begins {dateLabel(novenaFirstDate(n))} · {novenaLength(n)} days</p>
              <h2 className="m-0 font-serif text-[28px] font-semibold leading-tight">{n.title}</h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
