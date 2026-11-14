import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyState, Eyebrow, Featured, H1 } from '@/components/ui'
import { getChaplets } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Catholic Chaplets: How to Pray Them',
  description: 'Step-by-step guides to Catholic chaplets and the Holy Rosary, with the prayers for each bead and pray-along audio.',
  alternates: { canonical: '/chaplets' },
}

export default async function Page() {
  const list = await getChaplets()
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-6 pb-[72px] pt-10">
      <div className="text-center">
        <Eyebrow>Chaplets</Eyebrow>
        <H1 className="mt-2">Pray the chaplets</H1>
        <p className="mx-auto mt-3 max-w-xl text-muted">Step-by-step guides with the prayers for every bead.</p>
      </div>
      {list.length === 0 ? <EmptyState>Chaplets will be added soon.</EmptyState> : (
        <div className="grid gap-7 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {list.map((c) => (
            <Link key={c.id} href={`/chaplets/${c.slug}`} className="reveal flex flex-col gap-3 text-ink no-underline">
              <Featured src={c.featured_image} alt={c.image_alt} rounded="rounded-2xl" />
              <h2 className="m-0 font-serif text-[28px] font-semibold leading-tight">{c.title}</h2>
              {c.intro && <p className="m-0 line-clamp-3 text-muted">{c.intro}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
