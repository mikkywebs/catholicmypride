'use client'

import Link from 'next/link'
import { useActionState, useMemo, useState } from 'react'
import { askQuestion, type AskState } from '@/app/(site)/faith-questions/actions'

export type FaqItem = { slug: string; question: string; topic: string; html: string; sources: string | null; text: string }

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const field = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 py-2.5 text-ink'
const letterOf = (t: string) => t.trim()[0]?.toUpperCase() ?? '#'
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s]/g, ' ')

/** A–Z list of questions with search, and a form to ask one that is missing. */
export function FaqBrowser({ items }: { items: FaqItem[] }) {
  const [q, setQ] = useState('')
  const [letter, setLetter] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const have = useMemo(() => new Set(items.map((i) => letterOf(i.topic))), [items])
  const words = norm(q).split(/\s+/).filter((w) => w.length > 2)
  const list = items.filter((i) => {
    if (letter && letterOf(i.topic) !== letter) return false
    if (!words.length) return true
    const hay = norm(`${i.question} ${i.topic} ${i.text}`)
    return words.every((w) => hay.includes(w))
  })
  const groups = LETTERS.map((L) => ({ L, items: list.filter((i) => letterOf(i.topic) === L) })).filter((g) => g.items.length)

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-[52px] z-20 flex flex-col gap-3 rounded-2xl border border-line bg-surface/95 p-4 backdrop-blur">
        <label className="sr-only" htmlFor="faq-search">Search questions</label>
        <input id="faq-search" type="search" value={q} onChange={(e) => { setQ(e.target.value); setLetter('') }} placeholder="Search a question, e.g. Why do Catholics confess to a priest?" className={`${field} text-[17px]`} />
        <nav aria-label="A to Z" className="flex flex-wrap gap-1">
          <button type="button" onClick={() => setLetter('')} aria-pressed={!letter} className={`min-h-9 rounded-md px-2.5 text-sm font-bold ${!letter ? 'bg-accent text-accent-ink' : 'text-ink hover:bg-sky'}`}>All</button>
          {LETTERS.map((L) => (
            <button key={L} type="button" disabled={!have.has(L)} onClick={() => { setLetter(L); setQ('') }} aria-pressed={letter === L}
              className={`min-h-9 min-w-9 rounded-md text-sm font-bold disabled:opacity-25 ${letter === L ? 'bg-accent text-accent-ink' : 'text-ink hover:bg-sky'}`}>{L}</button>
          ))}
        </nav>
      </div>

      <p className="m-0 text-[15px] text-muted" aria-live="polite">{list.length} {list.length === 1 ? 'question' : 'questions'}{q ? <> for “<strong className="text-ink">{q}</strong>”</> : ''}</p>

      {groups.map((g) => (
        <section key={g.L} className="flex flex-col gap-2.5">
          <h2 className="m-0 font-serif text-[34px] font-semibold text-accent">{g.L}</h2>
          {g.items.map((i) => {
            const isOpen = open === i.slug || (words.length > 0 && list.length <= 3)
            return (
              <article key={i.slug} className="rounded-2xl border border-line bg-surface">
                <button type="button" onClick={() => setOpen(isOpen ? null : i.slug)} aria-expanded={isOpen} className="flex w-full items-start gap-3 px-5 py-4 text-left">
                  <span className="mt-0.5 shrink-0 rounded bg-sky px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted">{i.topic}</span>
                  <span className="flex-1 font-semibold text-ink">{i.question}</span>
                  <span aria-hidden="true" className="text-xl leading-none text-muted">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="flex flex-col gap-3 border-t border-line px-5 pb-5 pt-4">
                    <div className="prose-faq text-[17px] leading-relaxed text-body [&_p]:m-0 [&_p+p]:mt-3" dangerouslySetInnerHTML={{ __html: i.html }} />
                    {i.sources && <p className="m-0 text-sm text-muted"><strong>Sources:</strong> {i.sources}</p>}
                    <Link href={`/faith-questions/${i.slug}`} className="self-start text-sm font-semibold">Open and share this answer →</Link>
                  </div>
                )}
              </article>
            )
          })}
        </section>
      ))}

      <AskForm initial={list.length === 0 ? q : ''} empty={list.length === 0} />
    </div>
  )
}

function AskForm({ initial, empty }: { initial: string; empty: boolean }) {
  const [state, action, pending] = useActionState<AskState, FormData>(askQuestion, null)
  return (
    <section id="ask" className={`flex flex-col gap-3 rounded-2xl border p-5 sm:p-6 ${empty ? 'border-accent bg-accent-soft' : 'border-line bg-surface'}`}>
      <h2 className="m-0 font-serif text-[28px] font-semibold">{empty ? 'We have not answered that yet. Ask us!' : 'Can’t find your question? Ask us'}</h2>
      <p className="m-0 text-[15px] text-muted">We read every question and add the answers to this page.</p>
      {state?.ok ? (
        <p role="status" className="m-0 rounded-lg bg-[#e3f1e8] px-4 py-3 text-[#1f5c38]">{state.message}</p>
      ) : (
        <form action={action} className="flex flex-col gap-3">
          <textarea key={initial} name="question" required minLength={8} maxLength={300} rows={3} defaultValue={initial} placeholder="Your question about the Catholic faith" className={`${field} resize-y`} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" maxLength={80} placeholder="Your first name (optional)" className={field} />
            <input name="country" maxLength={60} placeholder="Your country (optional)" className={field} />
          </div>
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          {state && !state.ok && <p role="alert" className="m-0 text-sm font-semibold text-[#b42318]">{state.message}</p>}
          <button disabled={pending} className="self-start rounded-md bg-accent px-6 py-2.5 font-semibold text-accent-ink disabled:opacity-50">{pending ? 'Sending…' : 'Send my question'}</button>
        </form>
      )}
    </section>
  )
}
