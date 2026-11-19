'use client'

import { useMemo, useState } from 'react'
import type { QuizQuestion } from '@/lib/types'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const letterOf = (t: string) => t.trim()[0]?.toUpperCase() ?? '#'
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s]/g, ' ')

/** Searchable A–Z list of quiz questions; the answer shows on request. */
export function QuizBank({ items }: { items: QuizQuestion[] }) {
  const [q, setQ] = useState('')
  const [letter, setLetter] = useState('')
  const [shown, setShown] = useState<Set<string>>(new Set())
  const have = useMemo(() => new Set(items.map((i) => letterOf(i.topic))), [items])
  const words = norm(q).split(/\s+/).filter((w) => w.length > 2)
  const list = items.filter((i) => (!letter || letterOf(i.topic) === letter) && (!words.length || words.every((w) => norm(`${i.question} ${i.topic} ${i.option_a} ${i.option_b} ${i.option_c} ${i.option_d} ${i.explanation ?? ''}`).includes(w))))
  const toggle = (id: string) => setShown((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  return (
    <div className="flex flex-col gap-5">
      <div className="sticky top-[52px] z-20 flex flex-col gap-3 rounded-2xl border border-line bg-surface/95 p-4 backdrop-blur">
        <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setLetter('') }} placeholder="Search the quiz questions, e.g. sacraments, Moses, Pentecost" aria-label="Search quiz questions" className="min-h-11 w-full rounded-lg border border-field bg-surface px-3 text-[17px] text-ink" />
        <nav aria-label="A to Z" className="flex flex-wrap gap-1">
          <button type="button" onClick={() => setLetter('')} aria-pressed={!letter} className={`min-h-9 rounded-md px-2.5 text-sm font-bold ${!letter ? 'bg-accent text-accent-ink' : 'text-ink hover:bg-sky'}`}>All</button>
          {LETTERS.map((L) => <button key={L} type="button" disabled={!have.has(L)} onClick={() => { setLetter(L); setQ('') }} aria-pressed={letter === L} className={`min-h-9 min-w-9 rounded-md text-sm font-bold disabled:opacity-25 ${letter === L ? 'bg-accent text-accent-ink' : 'text-ink hover:bg-sky'}`}>{L}</button>)}
        </nav>
      </div>
      <p className="m-0 text-[15px] text-muted" aria-live="polite">{list.length} {list.length === 1 ? 'question' : 'questions'}</p>
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {list.slice(0, 400).map((i) => {
          const open = shown.has(i.id)
          const opts = [['A', i.option_a], ['B', i.option_b], ['C', i.option_c], ['D', i.option_d]] as const
          return (
            <li key={i.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 rounded bg-sky px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted">{i.topic}</span>
                <strong className="flex-1">{i.question}</strong>
              </div>
              <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
                {opts.map(([k, v]) => (
                  <li key={k} className={`rounded-lg border px-3 py-2 text-[15px] ${open && k === i.correct ? 'border-[#2e7d4f] bg-[#e3f1e8] font-semibold text-[#1f5c38]' : 'border-line'}`}><strong className="mr-1.5">{k}.</strong>{v}</li>
                ))}
              </ul>
              {open && (i.explanation || i.source) && (
                <p className="m-0 text-[15px] text-body">{i.explanation}{i.source && <span className="block pt-1 text-sm text-muted"><strong>Source:</strong> {i.source}</span>}</p>
              )}
              <button type="button" onClick={() => toggle(i.id)} className="self-start text-sm font-semibold text-accent">{open ? 'Hide answer' : 'Show answer'}</button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
