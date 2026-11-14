'use client'

import { useState } from 'react'

/** Lyrics start folded so the Play button stays near the top. */
export function Lyrics({ text, label = 'Lyrics' }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <section className="rounded-2xl border border-line bg-surface px-6 py-4">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-h-11 w-full items-center justify-between text-ink">
        <span className="font-serif text-[26px] font-semibold">{label}</span>
        <span className="text-[15px] font-semibold text-accent">{open ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}</span>
      </button>
      {open && <p className="m-0 whitespace-pre-line pt-3 text-lg leading-[1.8] text-body">{text}</p>}
    </section>
  )
}
