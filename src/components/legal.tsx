import Link from 'next/link'
import { Eyebrow, H1 } from './ui'

export type LegalSection = { title: string; body: string }

const PAGES = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Use' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/disclaimer', label: 'Disclaimer' },
]

export function LegalPage({ title, current, updated, sections }: { title: string; current: string; updated: string; sections: LegalSection[] }) {
  return (
    <div className="mx-auto flex max-w-[1100px] flex-wrap items-start gap-10 px-6 pb-[72px] pt-8">
      <nav aria-label="Legal pages" className="flex flex-1 basis-60 flex-col gap-1 rounded-2xl border border-line bg-surface p-5 text-[15px] lg:sticky lg:top-20">
        <strong className="pb-1.5">Legal</strong>
        {PAGES.map((p) => <Link key={p.href} href={p.href} className={`py-1 no-underline ${p.href === current ? 'font-semibold text-accent' : 'text-ink'}`}>{p.label}</Link>)}
        <strong className="mt-2 border-t border-line pb-1.5 pt-2.5">On this page</strong>
        {sections.map((s, i) => <a key={s.title} href={`#s${i + 1}`} className="py-1 text-ink no-underline">{i + 1}. {s.title}</a>)}
      </nav>
      <article className="flex min-w-0 flex-[999_1_560px] flex-col gap-6">
        <div className="flex flex-col gap-2"><Eyebrow>Legal</Eyebrow><H1>{title}</H1><p className="m-0 text-muted">Last updated: {updated}</p></div>
        {sections.map((s, i) => (
          <section key={s.title} id={`s${i + 1}`} className="flex scroll-mt-28 flex-col gap-1.5">
            <h2 className="m-0 font-serif text-[28px] font-semibold">{i + 1}. {s.title}</h2>
            <p className="m-0 whitespace-pre-line text-[17px] leading-[1.75] text-body">{s.body}</p>
          </section>
        ))}
      </article>
    </div>
  )
}
