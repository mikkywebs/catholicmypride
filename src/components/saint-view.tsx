import { StayConnected } from './whatsapp-join'
import Link from 'next/link'
import { JsonLd, articleLd } from './article-bits'
import { Reactions, ShareBar, ViewCount } from './engage'
import { Breadcrumb, Chip, Portrait, Prose } from './ui'
import { md, readMinutes } from '@/lib/format'
import { formatShort } from '@/lib/liturgical'
import type { Saint, Settings } from '@/lib/types'

/** Heading for the list of recent days: saints, celebrations (solemnities, feasts, events), or both. */
export function recentHeading(list: Saint[]) {
  const events = list.filter((w) => w.kind === 'celebration').length
  if (!events) return 'Recent saints'
  if (events === list.length) return 'Recent solemnities & feasts'
  return 'Recent saints & celebrations'
}

export function SaintView({ saint, s, week, others = [] }: { saint: Saint; s: Settings; week: Saint[]; others?: Saint[] }) {
  const facts = [
    ['Feast day', saint.feast_label],
    ['Born', saint.born],
    ['Died', saint.died],
    ['Canonised', saint.canonised],
  ].filter((f) => f[1]) as [string, string][]
  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-6 px-6 pb-[72px] pt-8">
      <JsonLd data={articleLd({ title: saint.name, description: saint.seo_description, image: saint.featured_image, path: `/saint-of-the-day/${saint.slug}`, published: saint.show_on })} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Saint of the Day', href: '/saint-of-the-day' }, { label: saint.name }]} />
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="eyebrow m-0">{saint.kind === 'celebration' ? 'Today in the Church' : 'Saint of the Day'}{saint.show_on ? ` · ${formatShort(saint.show_on)}` : ''}</p>
        <h1 className="m-0 font-serif text-[42px] font-semibold leading-[1.08] sm:text-[54px]">{saint.name}</h1>
        <div className="flex flex-wrap justify-center gap-x-4 text-[15px] text-muted">
          {saint.celebration && <span>{saint.celebration}</span>}
          <span>{readMinutes(saint.life_md)} min read</span>
          <ViewCount section="Saint of the Day" threshold={s.view_threshold} />
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-6">
        {saint.featured_image && (
          <div className="w-full max-w-[340px] flex-[1_1_260px]"><Portrait src={saint.featured_image} alt={saint.image_alt} priority sizes="(max-width: 700px) 100vw, 340px" /></div>
        )}
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          {facts.length > 0 && (
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
              {facts.map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-line bg-surface px-4 py-3.5"><span className="text-[13px] text-muted">{k}</span><br /><strong>{v}</strong></div>
              ))}
            </div>
          )}
          {saint.patronage.length > 0 && (
            <div className="flex flex-wrap items-center gap-2"><strong className="mr-1 text-[15px]">Patron of</strong>{saint.patronage.map((p) => <Chip key={p}>{p}</Chip>)}</div>
          )}
          <ShareBar title={saint.kind === 'celebration' ? saint.name : `Saint of the Day: ${saint.name}`} />
        </div>
      </div>
      {saint.life_md && (
        <article className="flex flex-col gap-4">
          <h2 className="m-0 font-serif text-[34px] font-semibold">{saint.kind === 'celebration' ? 'What we celebrate' : 'Life story'}</h2>
          <Prose html={md(saint.life_md)} />
        </article>
      )}
      {saint.quote && <blockquote className="reveal m-0 rounded-2xl bg-sky px-6 py-5 font-serif text-[26px] leading-snug">{saint.quote}</blockquote>}
      {saint.prayer_md && (
        <section className="reveal flex flex-col gap-2.5 rounded-2xl bg-navy px-7 py-7 text-navy-ink">
          <p className="m-0 text-[13px] uppercase tracking-[0.2em] text-gold">Prayer</p>
          <h2 className="m-0 font-serif text-[30px] font-semibold">{saint.kind === 'celebration' ? 'Prayer for today' : `Prayer to ${saint.name}`}</h2>
          <Prose html={md(saint.prayer_md)} className="prose-on-dark" />
        </section>
      )}
      {others.length > 0 && (
        <section className="reveal flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="m-0 font-serif text-[28px] font-semibold">Also celebrated today</h2>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
            {others.map((o) => (
              <Link key={o.slug} href={`/saint-of-the-day/${o.slug}`} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-ink no-underline hover:border-accent">
                <div className="w-14 shrink-0"><Portrait src={o.featured_image} alt="" sizes="56px" className="!rounded-lg" /></div>
                <span className="flex min-w-0 flex-col"><strong className="leading-snug">{o.name}</strong>{o.celebration && <span className="text-[13px] text-muted">{o.celebration}</span>}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <Reactions type="saint" id={saint.slug} kinds={['love', 'amen', 'thumbs']} title={saint.kind === 'celebration' ? 'Did today’s celebration speak to you?' : `Did ${saint.name}’s story inspire you?`} />
      <StayConnected s={{ whatsapp_channel_url: s.whatsapp_channel_url, youtube_url: s.youtube_url, facebook_url: s.facebook_url, x_url: s.x_url }} />
      {week.filter((w) => w.slug !== saint.slug).length > 0 && (
        <section className="reveal flex flex-col gap-3.5">
          <h2 className="m-0 border-b border-line pb-2.5 font-serif text-[30px] font-semibold">{recentHeading(week.filter((w) => w.slug !== saint.slug).slice(0, 4))}</h2>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))]">
            {week.filter((w) => w.slug !== saint.slug).slice(0, 4).map((w) => (
              <Link key={w.slug} href={`/saint-of-the-day/${w.slug}`} className="flex flex-col gap-1.5 text-ink no-underline">
                <Portrait src={w.featured_image} alt={w.image_alt} sizes="200px" className="!rounded-xl" />
                {(w.show_on || w.celebration) && <span className="text-[13px] font-semibold text-eyebrow">{[w.show_on && formatShort(w.show_on), w.celebration].filter(Boolean).join(' · ')}</span>}
                <strong>{w.name}</strong>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
