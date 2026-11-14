import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Fleuron, Ornament } from '@/components/ornament'
import { Prose } from '@/components/ui'
import { getSectionFlags, getSettings } from '@/lib/data'
import { md } from '@/lib/format'

export const metadata: Metadata = {
  title: 'About us: Our Story and Mission',
  description:
    "Catholic My Pride began with the Novena to Christ the King. More than a channel, it is a mission to spread the Gospel, strengthen the Catholic faith and share the love of Christ with people around the world.",
  alternates: { canonical: '/about' },
}

const PILLARS = [
  { n: 'I', title: 'Propagating the Faith', text: 'Catholic teachings, Scripture reflections, daily Mass readings and devotions, so the Gospel reaches every home.' },
  { n: 'II', title: "Showing Christ's Love", text: 'Prayers, novenas and hymns that draw hearts closer to Him, and a community that prays for one another.' },
  { n: 'III', title: 'Serving Those in Need', text: 'Reaching out to vulnerable people, families in need and those whose voices are often unheard.' },
]

export default async function Page() {
  const [s, flags] = await Promise.all([getSettings(), getSectionFlags()])
  const give = s.donate_url || 'https://selar.com/showlove/catholicmypride'
  const creations = [
    { label: 'Catholic teachings', href: flags.blog ? '/blog' : null },
    { label: 'Prayers & novenas', href: flags.novenas ? '/novenas' : flags.prayers ? '/daily-prayers' : null },
    { label: 'Scripture reflections', href: flags.readings ? '/mass-readings' : null },
    { label: 'Hymns & songs', href: flags.songs ? '/music' : null },
    { label: 'Devotional content', href: flags.chaplets ? '/chaplets' : null },
  ]

  return (
    <div className="parchment">
      {/* Title page */}
      <section className="px-6 pb-16 pt-16 text-center">
        <div className="mx-auto flex max-w-[860px] flex-col items-center gap-5">
          <p className="small-caps sepia m-0 text-[15px]">The story of an apostolate</p>
          <h1 className="m-0 font-serif text-[52px] font-semibold leading-[1.02] sm:text-[78px]">Catholic My Pride</h1>
          <Ornament className="sepia" />
          <p className="small-caps m-0 font-serif text-[22px] sm:text-[26px]">
            Propagating the Faith <span className="sepia">·</span> Showing Christ&apos;s Love <span className="sepia">·</span> Serving Those in Need
          </p>
        </div>
      </section>

      {/* Our beginning */}
      <section className="px-6 pb-20">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-12">
          {s.about_image_url && (
            <figure className="m-0 flex-[1_1_380px]">
              <div className="frame-vintage relative aspect-video overflow-hidden rounded-sm">
                <Image src={s.about_image_url} alt="" fill sizes="(max-width: 900px) 100vw, 520px" className="vintage-img object-cover" priority />
              </div>
            </figure>
          )}
          <div className={`flex flex-[1_1_440px] flex-col gap-5 ${s.about_image_url ? '' : 'mx-auto max-w-[760px]'}`}>
            <p className="small-caps sepia m-0">Chapter I · Our beginning</p>
            <h2 className="m-0 font-serif text-[40px] font-semibold leading-tight sm:text-[48px]">It began with a novena</h2>
            <p className="drop-cap m-0 text-[19px] leading-[1.85]">
              Catholic My Pride was inspired by the Novena to the Feast of Christ the King. Nine days of prayer, offered to the King of the Universe, became the seed of everything we do. That is why our very first work was a novena prayer, and why prayer remains at the heart of this apostolate.
            </p>
            <blockquote className="m-0 border-y border-current/20 py-4 text-center font-serif text-[28px] italic leading-snug">
              &ldquo;Thy kingdom come.&rdquo;
              <footer className="small-caps sepia mt-1 text-[15px] not-italic">Matthew 6:10</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* More than a channel */}
      <section className="bg-navy px-6 py-20 text-navy-ink">
        <div className="mx-auto flex max-w-[820px] flex-col items-center gap-6 text-center">
          <Fleuron className="text-gold" />
          <p className="small-caps m-0 text-gold">Chapter II · Our mission</p>
          <h2 className="m-0 font-serif text-[40px] font-semibold leading-tight sm:text-[52px]">More than a channel</h2>
          <p className="m-0 font-serif text-[24px] leading-relaxed sm:text-[28px]">
            Catholic My Pride is a mission to spread the Gospel, strengthen the Catholic faith and share the love of Christ with people around the world.
          </p>
          <p className="m-0 max-w-[640px] text-[18px] leading-relaxed text-navy-muted">
            We are living out our dream of making a better home as Catholics through our devotional prayers: homes where families pray together, hearts that turn to Christ each day, and a faith we are proud to share.
          </p>
        </div>
      </section>

      {/* Three pillars */}
      <section className="px-6 py-20">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="small-caps sepia m-0">Chapter III · What we stand for</p>
            <h2 className="m-0 font-serif text-[40px] font-semibold sm:text-[48px]">Three pillars of our work</h2>
            <Ornament className="sepia" />
          </div>
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            {PILLARS.map((p) => (
              <article key={p.n} className="reveal frame-vintage flex flex-col items-center gap-3 rounded-sm bg-white/40 px-7 py-10 text-center dark:bg-white/[0.03]">
                <span className="font-serif text-[46px] font-bold leading-none text-accent">{p.n}</span>
                <h3 className="small-caps m-0 font-serif text-[26px] font-semibold">{p.title}</h3>
                <p className="m-0 text-[17px] leading-relaxed opacity-85">{p.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* What we create */}
      <section className="px-6 pb-20">
        <div className="frame-vintage mx-auto flex max-w-[960px] flex-col items-center gap-6 rounded-sm px-6 py-12 text-center sm:px-12">
          <p className="small-caps sepia m-0">Chapter IV · Our work</p>
          <h2 className="m-0 font-serif text-[36px] font-semibold sm:text-[44px]">What your support makes possible</h2>
          <p className="m-0 max-w-[640px] text-[18px] leading-relaxed">
            Through your support, we can continue creating Catholic teachings, prayers, Scripture reflections, hymns and devotional content, while also reaching out to vulnerable people, families in need and those whose voices are often unheard.
          </p>
          <ul className="m-0 flex list-none flex-wrap justify-center gap-3 p-0">
            {creations.map((c) => (
              <li key={c.label}>
                {c.href ? (
                  <Link href={c.href} className="small-caps inline-flex min-h-11 items-center rounded-full border border-current/30 px-5 font-serif text-[19px] text-inherit no-underline hover:border-accent hover:text-accent">{c.label}</Link>
                ) : (
                  <span className="small-caps inline-flex min-h-11 items-center rounded-full border border-current/20 px-5 font-serif text-[19px] opacity-80">{c.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Admin-written story, if any */}
      {s.about_story_md && (
        <section className="px-6 pb-20">
          <div className="mx-auto flex max-w-[760px] flex-col gap-4">
            <p className="small-caps sepia m-0 text-center">Chapter V</p>
            {s.about_story_title && <h2 className="m-0 text-center font-serif text-[36px] font-semibold sm:text-[44px]">{s.about_story_title}</h2>}
            <Ornament className="sepia" />
            <Prose html={md(s.about_story_md)} className="!text-inherit" />
          </div>
        </section>
      )}

      {/* Support the mission */}
      <section className="px-6 pb-20">
        <div className="mx-auto flex max-w-[860px] flex-col items-center gap-5 rounded-sm bg-accent px-6 py-14 text-center text-accent-ink sm:px-14">
          <p className="small-caps m-0 opacity-90">Support the mission</p>
          <h2 className="m-0 font-serif text-[38px] font-semibold leading-tight sm:text-[48px]">Show us some love</h2>
          <p className="m-0 max-w-[600px] text-[19px] leading-relaxed">
            If our work has blessed you, please consider showing us some love. No amount is too small. Your generosity helps us continue the mission.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a href={give} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-md bg-accent-ink px-7 font-semibold text-accent no-underline hover:text-accent">Show Love to Catholic My Pride</a>
            <Link href="/donate" className="inline-flex min-h-12 items-center rounded-md border border-accent-ink px-7 font-semibold text-accent-ink no-underline hover:text-accent-ink">Other ways to give</Link>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="px-6 pb-24">
        <div className="mx-auto flex max-w-[720px] flex-col items-center gap-5 text-center">
          <p className="m-0 font-serif text-[26px] italic leading-relaxed sm:text-[30px]">
            Thank you for standing with us, praying for us and helping us spread the faith.
          </p>
          <Ornament className="sepia" />
          <p className="m-0 font-serif text-[30px] font-semibold">Catholic My Pride</p>
          <p className="small-caps sepia m-0">Propagating the Faith · Showing Christ&apos;s Love · Serving Those in Need</p>
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            {s.youtube_url && <a href={s.youtube_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center rounded-md border border-current/40 px-6 font-semibold text-inherit no-underline hover:text-accent">Watch us on YouTube</a>}
            <Link href="/prayer-requests" className="inline-flex min-h-12 items-center rounded-md border border-current/40 px-6 font-semibold text-inherit no-underline hover:text-accent">Send a prayer request</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
