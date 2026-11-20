import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { QuoteLibrary } from '@/components/quote-library'
import { StayConnected } from '@/components/whatsapp-join'
import { Eyebrow, H1 } from '@/components/ui'
import { getSettings } from '@/lib/data'
import { todayISO } from '@/lib/liturgical'
import { getQuotes, KIND_LABEL, quoteFor } from '@/lib/quotes'

export const metadata: Metadata = {
  title: 'Catholic Quotes: Jesus, Mary, the Bible, Saints and Popes',
  description: 'Catholic quotes with their sources: the words of Jesus and Mary, the Bible, the saints, the popes and the Church. A new Quote of the Day every day.',
  alternates: { canonical: '/quotes' },
}

export default async function Page() {
  const [quotes, s] = await Promise.all([getQuotes(), getSettings()])
  const sorted = [...quotes].sort((a, b) => a.author.localeCompare(b.author) || a.text.localeCompare(b.text))
  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-8 px-6 pb-[72px] pt-10">
      <div className="text-center">
        <Eyebrow>Quotes</Eyebrow>
        <H1 className="mt-2">Words to live by</H1>
        <p className="mx-auto mt-3 max-w-xl text-muted">The words of Jesus and Mary, the Bible, the saints, the popes and the Church, each with its source.</p>
      </div>
      <Suspense fallback={<div className="h-40" />}><Today /></Suspense>
      <QuoteLibrary quotes={sorted.map(({ id, text, author, source, kind }) => ({ id, text, author, source, kind }))} labels={KIND_LABEL} />
      <StayConnected s={{ whatsapp_channel_url: s.whatsapp_channel_url, youtube_url: s.youtube_url, facebook_url: s.facebook_url, x_url: s.x_url }} />
    </div>
  )
}

async function Today() {
  await connection()
  const q = quoteFor(await getQuotes(), todayISO())
  if (!q) return null
  return (
    <figure className="m-0 flex flex-col items-center gap-3 rounded-[18px] bg-navy px-6 py-9 text-center text-navy-ink sm:px-12">
      <p className="m-0 text-xs font-bold uppercase tracking-[0.2em] text-gold">Quote of the Day</p>
      <blockquote className="m-0 max-w-[720px] font-serif text-[26px] leading-snug sm:text-[30px]">“{q.text}”</blockquote>
      <figcaption className="text-navy-muted"><strong className="text-navy-ink">{q.author}</strong>{q.source && <> · {q.source}</>}</figcaption>
    </figure>
  )
}
