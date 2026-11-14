import type { Metadata } from 'next'
import { ButtonLink, Eyebrow, Featured, H1, H2, Prose } from '@/components/ui'
import { getSettings } from '@/lib/data'
import { md } from '@/lib/format'

export const metadata: Metadata = {
  title: 'About us',
  description: 'Catholic My Pride is an apostolate spreading the Gospel, strengthening the Catholic faith and sharing Christ’s love.',
  alternates: { canonical: '/about' },
}

const PILLARS = [
  { title: 'Spread the Gospel', text: 'Catholic teachings, Scripture reflections and daily Mass readings.' },
  { title: 'Pray together', text: 'Novenas, daily prayers and a place to send your intentions.' },
  { title: 'Praise in song', text: 'Hymns and devotional songs to listen to and share.' },
  { title: 'Serve the needy', text: 'Reaching out to vulnerable people and families in need.' },
]

export default async function Page() {
  const s = await getSettings()
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-12 px-6 pb-[72px] pt-10">
      <div className="flex flex-wrap items-center gap-10">
        <div className="flex flex-1 basis-[420px] flex-col gap-4">
          <Eyebrow>About us</Eyebrow>
          <H1>Proud to be Catholic, eager to share Christ</H1>
          <p className="m-0 text-[19px] text-body">{s.site_name} is an apostolate that spreads the Gospel, strengthens the Catholic faith and shares Christ&apos;s love, online and in our communities.</p>
        </div>
        {s.about_image_url && <div className="flex-1 basis-[420px]"><Featured src={s.about_image_url} priority /></div>}
      </div>
      <section className="reveal grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {PILLARS.map((p) => (
          <article key={p.title} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-6">
            <h2 className="m-0 font-serif text-[26px] font-semibold">{p.title}</h2>
            <p className="m-0 text-muted">{p.text}</p>
          </article>
        ))}
      </section>
      {s.about_story_md && (
        <section className="reveal flex flex-col gap-3 rounded-[18px] bg-sky p-8 sm:p-10">
          <Eyebrow>Our story</Eyebrow>
          {s.about_story_title && <H2>{s.about_story_title}</H2>}
          <Prose html={md(s.about_story_md)} className="max-w-[760px]" />
        </section>
      )}
      <section className="reveal flex flex-col items-center gap-3 rounded-2xl border border-eyebrow px-7 py-9 text-center">
        <h2 className="m-0 font-serif text-[32px] font-semibold">Walk with us</h2>
        <p className="m-0 text-muted">Pray with us, share our content, or support the mission.</p>
        <div className="flex flex-wrap justify-center gap-3"><ButtonLink href="/donate">Donate</ButtonLink><ButtonLink href="/contact" variant="outline">Contact us</ButtonLink></div>
      </section>
    </div>
  )
}
