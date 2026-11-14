import Link from 'next/link'
import { JsonLd, articleLd } from './article-bits'
import { ShareBar, ViewCount } from './engage'
import { Breadcrumb, Chip, Featured, Prose } from './ui'
import { md, readMinutes } from '@/lib/format'
import { formatShort } from '@/lib/liturgical'
import type { Saint, Settings } from '@/lib/types'

export function SaintView({ saint, s, week }: { saint: Saint; s: Settings; week: Saint[] }) {
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
        <p className="eyebrow m-0">Saint of the Day{saint.show_on ? ` · ${formatShort(saint.show_on)}` : ''}</p>
        <h1 className="m-0 font-serif text-[42px] font-semibold leading-[1.08] sm:text-[54px]">{saint.name}</h1>
        <div className="flex flex-wrap justify-center gap-x-4 text-[15px] text-muted">
          {saint.celebration && <span>{saint.celebration}</span>}
          <span>{readMinutes(saint.life_md)} min read</span>
          <ViewCount section="Saint of the Day" threshold={s.view_threshold} />
        </div>
      </div>
      <Featured src={saint.featured_image} alt={saint.image_alt} priority />
      <ShareBar title={`Saint of the Day: ${saint.name}`} />
      {facts.length > 0 && (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
          {facts.map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-line bg-surface px-4 py-3.5"><span className="text-[13px] text-muted">{k}</span><br /><strong>{v}</strong></div>
          ))}
        </div>
      )}
      {saint.patronage.length > 0 && (
        <div className="flex flex-wrap items-center gap-2"><strong className="mr-1 text-[15px]">Patron of</strong>{saint.patronage.map((p) => <Chip key={p}>{p}</Chip>)}</div>
      )}
      {saint.life_md && (
        <article className="flex flex-col gap-4">
          <h2 className="m-0 font-serif text-[34px] font-semibold">Life story</h2>
          <Prose html={md(saint.life_md)} />
        </article>
      )}
      {saint.quote && <blockquote className="reveal m-0 rounded-2xl bg-sky px-6 py-5 font-serif text-[26px] leading-snug">{saint.quote}</blockquote>}
      {saint.prayer_md && (
        <section className="reveal flex flex-col gap-2.5 rounded-2xl bg-navy px-7 py-7 text-navy-ink">
          <p className="m-0 text-[13px] uppercase tracking-[0.2em] text-gold">Prayer</p>
          <h2 className="m-0 font-serif text-[30px] font-semibold">Prayer to {saint.name}</h2>
          <Prose html={md(saint.prayer_md)} className="prose-on-dark" />
        </section>
      )}
      {week.filter((w) => w.id !== saint.id).length > 0 && (
        <section className="reveal flex flex-col gap-3.5">
          <h2 className="m-0 border-b border-line pb-2.5 font-serif text-[30px] font-semibold">Recent saints</h2>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
            {week.filter((w) => w.id !== saint.id).slice(0, 4).map((w) => (
              <Link key={w.id} href={`/saint-of-the-day/${w.slug}`} className="flex flex-col gap-1.5 text-ink no-underline">
                <Featured src={w.featured_image} alt={w.image_alt} rounded="rounded-xl" />
                {w.show_on && <span className="text-[13px] font-semibold text-eyebrow">{formatShort(w.show_on)}</span>}
                <strong>{w.name}</strong>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
