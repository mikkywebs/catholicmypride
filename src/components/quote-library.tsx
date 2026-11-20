'use client'

import { useMemo, useState } from 'react'

type Q = { id: string; text: string; author: string; source: string | null; kind: string }

/** Searchable quote library with filters (Jesus, Our Lady, the Bible, the Saints, the Popes…). */
export function QuoteLibrary({ quotes, labels }: { quotes: Q[]; labels: Record<string, string> }) {
  const [kind, setKind] = useState('all')
  const [q, setQ] = useState('')
  const kinds = Object.keys(labels).filter((k) => quotes.some((x) => x.kind === k))
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return quotes.filter((x) => (kind === 'all' || x.kind === kind) && (!s || `${x.text} ${x.author} ${x.source ?? ''}`.toLowerCase().includes(s)))
  }, [quotes, kind, q])
  const chip = (k: string, label: string) => (
    <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${kind === k ? 'bg-accent text-accent-ink' : 'border border-field bg-surface text-ink'}`}>{label}</button>
  )
  return (
    <section className="flex flex-col gap-5">
      <div className="sticky top-14 z-10 flex flex-col gap-3 bg-bg py-2">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search quotes, e.g. peace, Mary, Augustine…" aria-label="Search quotes" className="min-h-12 w-full rounded-lg border border-field bg-surface px-4 text-ink" />
        <div className="flex flex-wrap gap-2">{chip('all', 'All')}{kinds.map((k) => chip(k, labels[k]))}</div>
      </div>
      <p aria-live="polite" className="m-0 text-sm text-muted">{list.length} {list.length === 1 ? 'quote' : 'quotes'}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((x) => {
          const share = `“${x.text}” — ${x.author}${x.source ? ` (${x.source})` : ''}\n\nhttps://www.catholicmypride.org/quotes`
          return (
            <figure key={x.id} className="m-0 flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-5">
              <blockquote className="m-0 font-serif text-[20px] leading-snug text-ink">“{x.text}”</blockquote>
              <figcaption className="flex flex-col gap-0.5 text-[15px]">
                <strong>{x.author}</strong>
                {x.source && <span className="text-sm text-muted">{x.source}</span>}
              </figcaption>
              <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer" className="self-start text-sm font-semibold">Share on WhatsApp</a>
            </figure>
          )
        })}
      </div>
    </section>
  )
}
