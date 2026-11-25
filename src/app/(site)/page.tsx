import { ListViews } from '@/components/engage'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { PrayerForm } from '@/components/prayer-form'
import { SongRow } from '@/components/song-row'
import { ButtonLink, Cover, Eyebrow, Featured, H2, SectionHead } from '@/components/ui'
import { readingImage } from '@/lib/reading-image'
import { getBooks, getDailyPrayer, getHomeImages, getNovenas, getPosts, getPrayers, getReading, getSaintForDate, getSettings, getSongs } from '@/lib/data'
import { dateLabel, duration } from '@/lib/format'
import { formatLong, liturgicalInfo, todayISO } from '@/lib/liturgical'
import { activeNovenas, dayLabel, novenaLength } from '@/lib/novena-days'
import { SeasonBanner } from '@/components/season'
import { seasonTheme } from '@/lib/season-theme'
import { getQuotes, quoteFor } from '@/lib/quotes'
import type { Novena } from '@/lib/types'

export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={<div className="h-40" />}>
        <QuoteOfTheDay />
      </Suspense>
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
        <div className={`relative mx-auto max-w-[760px] rounded-[14px] bg-bg px-6 py-9 text-center sm:px-10 ${img ? '-mt-28 border-t-[3px] season-accent' : ''}`}>
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


/** Quote of the Day, just under the welcome box. */
async function QuoteOfTheDay() {
  await connection()
  const q = quoteFor(await getQuotes(), todayISO())
  if (!q) return null
  return (
    <section className="reveal px-6 pt-12">
      <figure className="mx-auto m-0 flex max-w-[860px] flex-col items-center gap-3 text-center">
        <p className="eyebrow m-0">Quote of the Day</p>
        <blockquote className="m-0 font-serif text-[26px] leading-snug text-ink sm:text-[32px]">“{q.text}”</blockquote>
        <figcaption className="text-muted"><strong className="text-ink">{q.author}</strong>{q.source && <> · {q.source}</>}</figcaption>
        <Link href="/quotes" className="text-sm font-semibold">More quotes →</Link>
      </figure>
    </section>
  )
}

async function TodaySections() {
  await connection()
  const today = todayISO()
  const [reading, saint, prayers, novenas, daily, s, homeImgs] = await Promise.all([getReading(today), getSaintForDate(today), getPrayers(), getNovenas(), getDailyPrayer(today), getSettings(), getHomeImages()])
  const readingPic = readingImage(today, reading, homeImgs, { url: s.default_reading_image, alt: s.default_reading_alt }).url
  const prayer = prayers.find((p) => p.show_on === today) ?? daily
  const running = activeNovenas(novenas, today)
  const info = liturgicalInfo(today)
  const season = seasonTheme(today, s.seasonal_theme ?? 'auto')
  const cards = [
    reading && { key: 'r', tag: 'Mass Readings', title: [reading.first_ref, reading.psalm_ref, reading.gospel_ref].filter(Boolean).join(' · ') || (reading.title ?? 'Today’s readings'), text: reading.reflection_title, img: readingPic, href: `/mass-readings/${today}`, cta: 'Read with reflection' },
    saint && { key: 's', tag: saint.kind === 'celebration' ? 'Feast of the Day' : 'Saint of the Day', title: saint.name, text: saint.celebration, img: saint.featured_image, href: `/saint-of-the-day/${saint.slug}`, cta: saint.kind === 'celebration' ? 'Read more' : 'Read the story' },
    prayer && { key: 'p', tag: 'Daily Prayer', title: prayer.title, text: null, img: prayer.featured_image || (prayer === daily ? s.default_prayer_image : null), href: `/daily-prayers/${prayer.slug}`, cta: 'Pray now' },
  ].filter(Boolean) as { key: string; tag: string; title: string; text: string | null; img: string | null; href: string; cta: string }[]

  return (
    <>
      {season && <SeasonBanner theme={season} />}
      {cards.length > 0 && (
        <section className="reveal px-6 pb-6 pt-[72px]">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-9 text-center">
              <Eyebrow>Today · {formatLong(today)} · {reading?.title ?? info.season}</Eyebrow>
              <H2 className="mt-1.5">Pray with the Church today</H2>
            </div>
            {cards.length === 1 && reading ? (
              // Only the readings today (no saint or feast in the calendar): they take the full width.
              <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface md:flex-row">
                {readingPic && <div className="md:w-1/2"><Featured src={readingPic} rounded="rounded-none" className="h-full" /></div>}
                <div className="flex flex-1 flex-col gap-3 px-6 pb-8 pt-7 sm:px-9">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Mass Readings</p>
                  <h3 className="m-0 font-serif text-[32px] font-semibold leading-tight">{reading.title ?? 'Today’s readings'}</h3>
                  <dl className="m-0 grid gap-x-6 gap-y-2 text-[15px] sm:grid-cols-[auto_1fr]">
                    {([['First Reading', reading.first_ref], ['Psalm', reading.psalm_ref], ['Second Reading', reading.second_ref], ['Gospel', reading.gospel_ref]] as const).filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} className="contents"><dt className="font-semibold text-muted">{k}</dt><dd className="m-0">{v}</dd></div>
                    ))}
                  </dl>
                  {reading.psalm_response && <p className="m-0 italic text-muted">R. {reading.psalm_response}</p>}
                  {reading.reflection_title && <p className="m-0 font-semibold">Reflection: {reading.reflection_title}</p>}
                  <Link href={`/mass-readings/${today}`} className="pt-2 font-semibold">Read today’s Mass readings →</Link>
                </div>
              </article>
            ) : (
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
            )}
          </div>
        </section>
      )}
      {running.length > 0 && <NovenaBlock running={running} />}
    </>
  )
}

function NovenaBlock({ running }: { running: { novena: Novena; day: number }[] }) {
  // The novena closest to its feast gets the big block; any others are listed underneath it.
  const [{ novena, day }, ...others] = running
  return (
    <section className="reveal px-6 py-16">
      <div className="mx-auto flex max-w-[1200px] flex-wrap overflow-hidden rounded-[18px] bg-navy text-navy-ink">
        <div className="relative min-h-[320px] flex-1 basis-[420px] bg-[#2c3240]">
          {novena.featured_image && <Image src={novena.featured_image} alt={novena.image_alt ?? ''} fill sizes="600px" className="object-cover" />}
        </div>
        <div className="flex flex-1 basis-[420px] flex-col gap-3.5 p-8 sm:p-12">
          <p className="m-0 text-[13px] uppercase tracking-[0.2em] text-gold">Novena in progress</p>
          <h2 className="m-0 font-serif text-[42px] font-semibold leading-[1.1]">{novena.title}</h2>
          <p className="m-0 text-navy-muted">{novena.feast_name || 'Feast day'}: {dateLabel(novena.feast_date)} · Today: {dayLabel(novena, day)}</p>
          {novenaLength(novena) <= 12 ? (
            <div role="img" aria-label={dayLabel(novena, day)} className="flex flex-wrap gap-2.5 py-2">
              {Array.from({ length: novenaLength(novena) }, (_, i) => i + 1).map((n) => (
                <span key={n} className={`flex size-[38px] items-center justify-center rounded-full text-[15px] font-semibold ${n <= day ? 'bg-gold text-[#1f2430]' : 'border border-[#5b6272] text-navy-muted'}`}>{n}</span>
              ))}
            </div>
          ) : (
            // Long novenas (e.g. 25 days): a progress bar instead of 25 circles.
            <div role="img" aria-label={dayLabel(novena, day)} className="flex flex-col gap-2 py-2">
              <div className="h-3 overflow-hidden rounded-full bg-[#3a4150]"><div className="h-full rounded-full bg-gold" style={{ width: `${(day / novenaLength(novena)) * 100}%` }} /></div>
              <span className="text-sm text-navy-muted">{day === 0 ? 'Begins tomorrow with Day 1' : `${novenaLength(novena) - day} days to go`}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-1.5">
            <ButtonLink href={`/novenas/${novena.slug}?day=${day}`} variant="gold">{day === 0 ? 'Pray the opening prayer' : `Pray Day ${day}`}</ButtonLink>
            <Link href="/novenas" className="inline-flex min-h-12 items-center rounded-md border border-navy-ink px-6 font-semibold text-navy-ink no-underline">All novenas</Link>
          </div>
          {others.length > 0 && (
            <div className="mt-3 border-t border-[#3a4150] pt-5">
              <p className="m-0 mb-2.5 text-[13px] uppercase tracking-[0.2em] text-gold">Also in progress</p>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {others.map((o) => (
                  <li key={o.novena.id}>
                    <Link href={`/novenas/${o.novena.slug}?day=${o.day}`} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg bg-[#2c3240] px-4 py-3 text-navy-ink no-underline hover:bg-[#353c4b]">
                      <span className="font-serif text-[20px] font-semibold">{o.novena.title}</span>
                      <span className="text-sm text-gold">{dayLabel(o.novena, o.day)} · Pray now →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
        <div className="grid gap-7 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="flex flex-col gap-3 text-ink no-underline">
              <Featured src={p.featured_image} alt={p.image_alt} rounded="rounded-2xl" />
              <p className="m-0 text-[13px] uppercase tracking-[0.1em] text-eyebrow">{[p.category?.name, dateLabel(p.published_at)].filter(Boolean).join(' · ')}</p>
              <span className="-mt-1.5 text-sm text-muted empty:hidden"><ListViews path={`/blog/${p.slug}`} /></span>
              <h3 className="m-0 line-clamp-2 font-serif text-[26px] font-semibold leading-tight" title={p.title}>{p.title}</h3>
              {p.excerpt && <p className="m-0 line-clamp-3 text-muted">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

async function Songs() {
  // Home page features songs only; audio messages and prayers live on the Music & Audio page.
  const songs = (await getSongs(30)).filter((s) => s.kind !== 'audio').slice(0, 3)
  if (!songs.length) return null
  return (
    <section className="reveal border-y border-line bg-sky px-6 py-16">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-7 text-center">
          <Eyebrow>Music</Eyebrow>
          <H2 className="mt-1.5">Hymns &amp; Songs</H2>
        </div>
        <div className="flex flex-col gap-2.5">
          {songs.map((s) => (
            <SongRow key={s.id} slug={s.slug} title={s.title} src={s.audio_url} cover={s.featured_image} meta={[s.category?.name, duration(s.duration_seconds)].filter(Boolean).join(' · ')} />
          ))}
        </div>
        <p className="mb-0 mt-6 text-center"><Link href="/audio" className="font-semibold">All songs, messages &amp; prayers →</Link></p>
      </div>
    </section>
  )
}

async function Books() {
  const books = await getBooks()
  // Hidden on the home page until there are at least 5 ebooks; the Ebooks page still lists them all.
  if (books.length < 5) return null
  return (
    <section className="reveal px-6 pb-[72px] pt-16">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead title="Ebooks" href="/ebooks" linkLabel="All ebooks" />
        <div className="grid gap-7 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
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
