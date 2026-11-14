import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyState, Eyebrow, Featured, H1 } from '@/components/ui'
import { getNovenas } from '@/lib/data'
import { dateLabel } from '@/lib/format'
import { addDays } from '@/lib/liturgical'

export const metadata: Metadata = {
  title: 'Novenas: 9 Days of Prayer for Every Feast',
  description: 'Pray Catholic novenas day by day, with prayers and audio for each of the nine days before the feast.',
  alternates: { canonical: '/novenas' },
}

export default async function Page() {
  const list = await getNovenas()
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-6 pb-[72px] pt-10">
      <div className="text-center">
        <Eyebrow>Novenas</Eyebrow>
        <H1 className="mt-2">Nine days of prayer</H1>
        <p className="mx-auto mt-3 max-w-xl text-muted">Each novena begins nine days before its feast. Choose one and pray along day by day.</p>
      </div>
      {list.length === 0 ? <EmptyState>Novenas will be posted soon.</EmptyState> : (
        <div className="grid gap-7 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          {list.map((n) => (
            <Link key={n.id} href={`/novenas/${n.slug}`} className="reveal flex flex-col gap-3 text-ink no-underline">
              <Featured src={n.featured_image} alt={n.image_alt} rounded="rounded-2xl" />
              <p className="m-0 text-[13px] uppercase tracking-[0.1em] text-eyebrow">Begins {dateLabel(addDays(n.feast_date, -9))} · Feast {dateLabel(n.feast_date)}</p>
              <h2 className="m-0 font-serif text-[28px] font-semibold leading-tight">{n.title}</h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
