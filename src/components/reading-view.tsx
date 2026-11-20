import { StayConnected } from './whatsapp-join'
import Link from 'next/link'
import { JsonLd, articleLd } from './article-bits'
import { Reactions, ShareBar, ViewCount } from './engage'
import { Breadcrumb, Featured, Prose } from './ui'
import { md, readMinutes } from '@/lib/format'
import { addDays, formatLong, liturgicalInfo, VESTMENT_HEX } from '@/lib/liturgical'
import type { Reading, Settings } from '@/lib/types'

function Part({ id, title, refText, body, response, closing }: { id: string; title: string; refText: string | null; body: string | null; response?: string | null; closing?: string }) {
  if (!refText && !body) return null
  return (
    <section id={id} className="reveal flex scroll-mt-28 flex-col gap-3 rounded-2xl border border-line bg-surface px-6 py-7 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-2.5">
        <h2 className="m-0 font-serif text-[32px] font-semibold">{title}</h2>
        {refText && <span className="font-semibold text-eyebrow">{refText}</span>}
      </div>
      {response && <p className="m-0 font-semibold italic">R. {response}</p>}
      {body && <p className="m-0 whitespace-pre-line text-[19px] leading-[1.8] text-body">{body}</p>}
      {closing && <p className="m-0 text-[15px] italic text-muted">{closing}</p>}
    </section>
  )
}

export function ReadingView({ r, s }: { r: Reading; s: Settings }) {
  const info = liturgicalInfo(r.date)
  const vest = r.vestment ?? info.vestment
  const image = r.featured_image || s.default_reading_image || null
  const imageAlt = r.featured_image ? r.image_alt : s.default_reading_alt
  const mins = readMinutes(r.first_text, r.psalm_text, r.second_text, r.gospel_text, r.reflection_md)
  const word = 'The word of the Lord. — Thanks be to God.'
  const jumps = [
    ['first', 'First Reading', r.first_ref || r.first_text],
    ['psalm', 'Responsorial Psalm', r.psalm_ref || r.psalm_text],
    ['second', 'Second Reading', r.second_ref || r.second_text],
    ['acclamation', 'Gospel Acclamation', r.acclamation_ref || r.acclamation_text],
    ['gospel', 'Gospel', r.gospel_ref || r.gospel_text],
    ['reflection', 'Reflection', r.reflection_md],
  ].filter((j) => j[2]) as [string, string, string][]
  const title = `Mass Readings for ${formatLong(r.date)}`

  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-7 px-6 pb-[72px] pt-8">
      <JsonLd data={articleLd({ title, description: r.seo_description, image, path: `/mass-readings/${r.date}`, published: r.date })} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Mass Readings', href: '/mass-readings' }, { label: formatLong(r.date) }]} />
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="eyebrow m-0">{formatLong(r.date)}</p>
        <h1 className="m-0 font-serif text-[40px] font-semibold leading-[1.1] sm:text-[50px]">{r.title || title}</h1>
        <div className="flex flex-wrap justify-center gap-2.5">
          {r.day_type && <span className="rounded-full bg-sky px-3.5 py-1 text-sm font-semibold">{r.day_type}</span>}
          <span className="rounded-full bg-sky px-3.5 py-1 text-sm font-semibold">{r.season || info.season}</span>
          <span className="rounded-full bg-sky px-3.5 py-1 text-sm font-semibold">Year {info.cycle} · Cycle {info.weekdayCycle}</span>
          <span className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-2 pr-3.5 text-sm font-semibold">
            <span aria-hidden="true" className="size-4 rounded-full border border-[#9aa0aa]" style={{ background: VESTMENT_HEX[vest] }} /> Vestment: {vest}
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 text-[15px] text-muted"><span>{mins} min read</span><ViewCount section="Mass Readings" threshold={s.view_threshold} /></div>
      </div>
      <Featured src={image} alt={imageAlt} priority />
      <ShareBar title={title} />
      {jumps.length > 1 && (
        <nav aria-label="On this page" className="flex flex-wrap justify-center gap-2 text-[15px]">
          {jumps.map(([id, label]) => <a key={id} href={`#${id}`} className="rounded-full border border-line bg-surface px-3.5 py-2 text-ink no-underline">{label}</a>)}
        </nav>
      )}
      <Part id="first" title="First Reading" refText={r.first_ref} body={r.first_text} closing={word} />
      <Part id="psalm" title="Responsorial Psalm" refText={r.psalm_ref} body={r.psalm_text} response={r.psalm_response} />
      <Part id="second" title="Second Reading" refText={r.second_ref} body={r.second_text} closing={word} />
      <Part id="acclamation" title="Gospel Acclamation" refText={r.acclamation_ref} body={r.acclamation_text} />
      <Part id="gospel" title="Gospel" refText={r.gospel_ref} body={r.gospel_text} closing="The Gospel of the Lord. — Praise to you, Lord Jesus Christ." />
      {r.reflection_md && (
        <section id="reflection" className="reveal flex scroll-mt-28 flex-col gap-3 rounded-2xl bg-navy px-6 py-8 text-navy-ink sm:px-9">
          <p className="m-0 text-[13px] uppercase tracking-[0.2em] text-gold">Reflection</p>
          {r.reflection_title && <h2 className="m-0 font-serif text-[36px] font-semibold leading-tight">{r.reflection_title}</h2>}
          <Prose html={md(r.reflection_md)} className="prose-on-dark" />
        </section>
      )}
      {r.remarks_md && (
        <section className="reveal rounded-2xl bg-sky px-7 py-5">
          <h2 className="m-0 text-lg font-semibold">Other remarks</h2>
          <Prose html={md(r.remarks_md)} className="!text-base" />
        </section>
      )}
      <Reactions type="reading" id={r.date} kinds={['love', 'amen', 'thumbs']} title="Did today’s Word speak to you?" />
      <StayConnected s={{ whatsapp_channel_url: s.whatsapp_channel_url, youtube_url: s.youtube_url, facebook_url: s.facebook_url, x_url: s.x_url }} />
      <nav aria-label="Other days" className="flex flex-wrap justify-between gap-3.5 border-t border-line pt-5">
        <Link href={`/mass-readings/${addDays(r.date, -1)}`} className="flex flex-col py-1.5 text-ink no-underline"><span className="text-[13px] text-muted">← Previous day</span><span className="font-semibold">{formatLong(addDays(r.date, -1))}</span></Link>
        <Link href={`/mass-readings/${addDays(r.date, 1)}`} className="flex flex-col items-end py-1.5 text-ink no-underline"><span className="text-[13px] text-muted">Next day →</span><span className="font-semibold">{formatLong(addDays(r.date, 1))}</span></Link>
      </nav>
    </div>
  )
}
