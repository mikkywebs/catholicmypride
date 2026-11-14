import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { PrayerForm } from '@/components/prayer-form'
import { SongRow } from '@/components/song-row'
import { ButtonLink, Cover, Eyebrow, Featured, H2, SectionHead } from '@/components/ui'
import { getBooks, getHomeImages, getNovenas, getPosts, getPrayers, getReading, getSaintForDate, getSettings, getSongs } from '@/lib/data'
import { dateLabel, duration } from '@/lib/format'
import { addDays, formatLong, liturgicalInfo, todayISO } from '@/lib/liturgical'
import type { Novena } from '@/lib/types'

export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={<div className="h-24" />}>
        <TodaySections />
      </Suspense>
      <LatestPosts />
      <Songs />
      <Books />
      <PraySection />
    </>
  )
}

async function Hero() {
  const [s, images] = await Promise.all([getSettings(), getHomeImages()])
  const img = images.hero?.url ?? s.hero_image_url
  return (
    <section className="px-6 pt-10">
      <div className="relative mx-auto max-w-[1200px]">
        {img ? (
          <div className="relative aspect-video max-h-[620px] w-full overflow-hidden rounded-[18px] bg-ph">
            <Image src={img} alt={images.hero?.alt ?? ''} fill priority sizes="(max-width: 1200px) 100vw, 1200px" className="object-cover" />
          </div>
        ) : (
          <div className="h-10" />
        )}
        <div className={`relative mx-auto max-w-[760px] rounded-[14px] bg-bg px-6 py-9 text-center sm:px-10 ${img ? '-mt-28 border-t-[3px] border-eyebrow' : ''}`}>
          <Eyebrow className="mb-2">Welcome</Eyebrow>
          <h1 className="m-0 font-serif text-[40px] font-semibold leading-[1.1] sm:text-[52px]">{s.hero_title}</h1>
          <p className="mx-0 mb-6 mt-4 text-muted">{s.hero_subtitle}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/mass-readings">Today&apos;s Readings</ButtonLink>
            <ButtonLink href="/prayer-requests" variant="outline">Send a Prayer Request</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}

function activeNovena(list: Novena[], today: string) {
  return list.find((n) => today >= addDays(n.feast_date, -9) && today <= addDays(n.feast_date, -1)) ?? null
}

async function TodaySections() {
  await connection()
  const today = todayISO()
  const [reading, saint, prayers, novenas] = await Promise.all([getReading(today), getSaintForDate(today), getPrayers(), getNovenas()])
  const prayer = prayers.find((p) => p.show_on === today) ?? null
  const novena = activeNovena(novenas, today)
  const info = liturgicalInfo(today)
  const cards = [
    reading && { key: 'r', tag: 'Mass Readings', title: [reading.first_ref, reading.psalm_ref, reading.gospel_ref].filter(Boolean).join(' · ') || (reading.title ?? 'Today’s readings'), text: reading.reflection_title, img: reading.featured_image, href: `/mass-readings/${today}`, cta: 'Read with reflection' },
    saint && { key: 's', tag: 'Saint of the Day', title: saint.name, text: saint.celebration, img: saint.featured_image, href: `/saint-of-the-day/${saint.slug}`, cta: 'Read the story' },
    prayer && { key: 'p', tag: 'Daily Prayer', title: prayer.title, text: null, img: prayer.featured_image, href: `/daily-prayers/${prayer.slug}`, cta: 'Pray now' },
  ].filter(Boolean) as { key: string; tag: string; title: string; text: string | null; img: string | null; href: string; cta: string }[]

  return (
    <>
      {cards.length > 0 && (
        <section className="reveal px-6 pb-6 pt-[72px]">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-9 text-center">
              <Eyebrow>Today · {formatLong(today)} · {reading?.title ?? info.season}</Eyebrow>
              <H2 className="mt-1.5">Pray with the Church today</H2>
            </div>
            <div className="grid gap-7 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
              {cards.map((c) => (
                <article key={c.key} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
                  <Featured src={c.img} rounded="rounded-none" />
                  <div className="flex flex-1 flex-col gap-2 px-6 pb-7 pt-6">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{c.tag}</p>
                    <h3 className="m-0 font-serif text-[28px] font-semibold leading-tight">{c.title}</h3>
                    {c.text && <p className="m-0 flex-1 text-muted">{c.text}</p>}
                    <Link href={c.href} className="pt-2 font-semibold">{c.cta} →</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      {novena && <NovenaBlock novena={novena} today={today} />}
    </>
  )
}

function NovenaBlock({ novena, today }: { novena: Novena; today: string }) {
  const start = addDays(novena.feast_date, -9)
  let day = 1
  for (let d = 1; d <= 9; d++) if (addDays(start, d - 1) <= today) day = d
  return (
    <section className="reveal px-6 py-16">
      <div className="mx-auto flex max-w-[1200px] flex-wrap overflow-hidden rounded-[18px] bg-navy text-navy-ink">
        <div className="relative min-h-[320px] flex-1 basis-[420px] bg-[#2c3240]">
          {novena.featured_image && <Image src={novena.featured_image} alt={novena.image_alt ?? ''} fill sizes="600px" className="object-cover" />}
        </div>
        <div className="flex flex-1 basis-[420px] flex-col gap-3.5 p-8 sm:p-12">
          <p className="m-0 text-[13px] uppercase tracking-[0.2em] text-gold">Novena in progress</p>
          <h2 className="m-0 font-serif text-[42px] font-semibold leading-[1.1]">{novena.title}</h2>
          <p className="m-0 text-navy-muted">Feast day: {dateLabel(novena.feast_date)} · Today is Day {day} of 9</p>
          <div role="img" aria-label={`Day ${day} of 9`} className="flex flex-wrap gap-2.5 py-2">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
              <span key={n} className={`flex size-[38px] items-center justify-center rounded-full text-[15px] font-semibold ${n <= day ? 'bg-gold text-[#1f2430]' : 'border border-[#5b6272] text-navy-muted'}`}>{n}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-1.5">
            <ButtonLink href={`/novenas/${novena.slug}?day=${day}`} variant="gold">Pray Day {day}</ButtonLink>
            <Link href="/novenas" className="inline-flex min-h-12 items-center rounded-md border border-navy-ink px-6 font-semibold text-navy-ink no-underline">All novenas</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

async function LatestPosts() {
  const posts = await getPosts(3)
  if (!posts.length) return null
  return (
    <section className="reveal px-6 pb-16 pt-6">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead title="From the Blog" href="/blog" linkLabel="All articles" />
        <div className="grid gap-7 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="flex flex-col gap-3 text-ink no-underline">
              <Featured src={p.featured_image} alt={p.image_alt} rounded="rounded-2xl" />
              <p className="m-0 text-[13px] uppercase tracking-[0.1em] text-eyebrow">{[p.category?.name, dateLabel(p.published_at)].filter(Boolean).join(' · ')}</p>
              <h3 className="m-0 font-serif text-[26px] font-semibold leading-tight">{p.title}</h3>
              {p.excerpt && <p className="m-0 text-muted">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

async function Songs() {
  const songs = await getSongs(3)
  if (!songs.length) return null
  return (
    <section className="reveal border-y border-line bg-sky px-6 py-16">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-7 text-center">
          <Eyebrow>Music &amp; Audio</Eyebrow>
          <H2 className="mt-1.5">Songs, messages &amp; prayers</H2>
        </div>
        <div className="flex flex-col gap-2.5">
          {songs.map((s) => (
            <SongRow key={s.id} slug={s.slug} title={s.title} src={s.audio_url} cover={s.featured_image} meta={[s.kind === 'audio' ? 'Audio' : 'Song', s.category?.name, duration(s.duration_seconds)].filter(Boolean).join(' · ')} />
          ))}
        </div>
        <p className="mb-0 mt-6 text-center"><Link href="/music" className="font-semibold">All songs &amp; audio →</Link></p>
      </div>
    </section>
  )
}

async function Books() {
  const books = await getBooks()
  if (!books.length) return null
  return (
    <section className="reveal px-6 pb-[72px] pt-16">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead title="Ebooks" href="/ebooks" linkLabel="All ebooks" />
        <div className="grid gap-7 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          {books.slice(0, 4).map((b) => (
            <Link key={b.id} href={`/ebooks/${b.slug}`} className="flex flex-col gap-2.5 text-ink no-underline">
              <Cover src={b.cover_url} alt={b.title} />
              <span className="font-serif text-[22px] font-semibold leading-tight">{b.title}</span>
              <span className="text-sm font-semibold text-eyebrow">{b.is_free ? 'Free' : b.price_label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

async function PraySection() {
  const images = await getHomeImages()
  return (
    <section id="pray" className="reveal px-6 py-[72px]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap gap-12">
        <div className="flex flex-1 basis-[360px] flex-col gap-3.5">
          <Eyebrow>Prayer Requests</Eyebrow>
          <h2 className="m-0 font-serif text-[44px] font-semibold leading-[1.1]">Let us pray for you</h2>
          <p className="m-0 text-muted">Share your intention. Our community will remember it in prayer. Private requests are seen only by the prayer team.</p>
          {images.prayer && <Featured src={images.prayer.url} alt={images.prayer.alt} rounded="rounded-2xl" className="mt-2.5" />}
        </div>
        <PrayerForm />
      </div>
    </section>
  )
}
