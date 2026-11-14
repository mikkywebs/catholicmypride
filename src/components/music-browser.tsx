'use client'

import { useMemo, useState } from 'react'
import { SongRow } from './song-row'
import { useClientValue } from './use-client'

export type BrowserItem = { id: string; slug: string; title: string; kind: 'song' | 'audio'; src: string | null; cover: string | null; length: string | null; categoryId: string | null }
export type BrowserCategory = { id: string; name: string; slug: string }

const chip = (on: boolean) =>
  `inline-flex min-h-10 items-center rounded-full border px-4 text-[15px] font-semibold ${on ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-ink'}`

/** Search, type and category filters for the Music & Audio page. */
export function MusicBrowser({ items, categories }: { items: BrowserItem[]; categories: BrowserCategory[] }) {
  const fromUrl = useClientValue(() => new URLSearchParams(window.location.search).get('category'), null)
  const [picked, setPicked] = useState<string | null | undefined>(undefined)
  const catSlug = picked === undefined ? fromUrl : picked
  const [type, setType] = useState<'all' | 'song' | 'audio'>('all')
  const [q, setQ] = useState('')

  const used = useMemo(() => categories.filter((c) => items.some((i) => i.categoryId === c.id)), [categories, items])
  const hasBoth = items.some((i) => i.kind === 'song') && items.some((i) => i.kind === 'audio')
  const cat = used.find((c) => c.slug === catSlug)

  const pick = (slug: string | null) => {
    setPicked(slug)
    const url = new URL(window.location.href)
    if (slug) url.searchParams.set('category', slug); else url.searchParams.delete('category')
    window.history.replaceState(null, '', url)
  }

  const term = q.trim().toLowerCase()
  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? ''
  const visible = items.filter((i) =>
    (type === 'all' || i.kind === type) &&
    (!cat || i.categoryId === cat.id) &&
    (!term || `${i.title} ${catName(i.categoryId)}`.toLowerCase().includes(term)),
  )
  const groups = [
    ...used.map((c) => ({ key: c.id, name: c.name, list: visible.filter((i) => i.categoryId === c.id) })),
    { key: 'other', name: used.length ? 'Other' : '', list: visible.filter((i) => !i.categoryId || !categories.some((c) => c.id === i.categoryId)) },
  ].filter((g) => g.list.length)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Search
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Song, message or prayer title" className="min-h-11 rounded-lg border border-field bg-surface px-3 text-ink" />
        </label>
        {hasBoth && (
          <div role="group" aria-label="Type" className="flex flex-wrap gap-2">
            {(['all', 'song', 'audio'] as const).map((t) => (
              <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} className={chip(type === t)}>
                {t === 'all' ? 'All' : t === 'song' ? 'Songs' : 'Audio messages & prayers'}
              </button>
            ))}
          </div>
        )}
        {used.length > 0 && (
          <nav aria-label="Categories" className="flex flex-wrap gap-2 border-t border-line pt-4">
            <button type="button" aria-pressed={!cat} onClick={() => pick(null)} className={chip(!cat)}>All categories</button>
            {used.map((c) => (
              <button key={c.id} type="button" aria-pressed={cat?.id === c.id} onClick={() => pick(c.slug)} className={chip(cat?.id === c.id)}>{c.name}</button>
            ))}
          </nav>
        )}
      </div>
      <p className="m-0 text-[15px] text-muted" aria-live="polite">{visible.length} {visible.length === 1 ? 'item' : 'items'}{cat ? <> in <strong className="text-ink">{cat.name}</strong></> : ''}</p>
      {groups.length === 0 && <p className="rounded-2xl border border-line bg-surface p-8 text-center text-muted">Nothing matches. Try another word or category.</p>}
      {groups.map((g) => (
        <section key={g.key} className="flex flex-col gap-2.5">
          {g.name && <h2 className="m-0 border-b border-line pb-2.5 font-serif text-[30px] font-semibold">{g.name}</h2>}
          {g.list.map((i) => (
            <SongRow key={i.id} slug={i.slug} title={i.title} src={i.src} cover={i.cover} meta={[i.kind === 'audio' ? 'Audio' : 'Song', i.length].filter(Boolean).join(' · ')} />
          ))}
        </section>
      ))}
    </div>
  )
}
