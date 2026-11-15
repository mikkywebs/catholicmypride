'use client'

import { useState, useTransition } from 'react'
import { lectionaryForDate } from '@/app/admin/actions'

const READING_FIELDS = ['first_text', 'psalm_text', 'second_text', 'gospel_text']
const FIELDS = ['title', 'day_type', 'season', 'vestment', 'first_ref', 'first_text', 'psalm_ref', 'psalm_response', 'psalm_text',
  'second_ref', 'second_text', 'acclamation_ref', 'acclamation_text', 'gospel_ref', 'gospel_text']
const IF_EMPTY = ['remarks_md', 'seo_title', 'seo_description']

/** Fills the readings form for the chosen date from the lectionary. Your reflection and image are never touched. */
export function LectionaryFill() {
  const [msg, setMsg] = useState('')
  const [pending, start] = useTransition()
  const run = (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.form
    if (!form) return
    const el = (n: string) => form.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
    const date = el('date')?.value
    if (!date) { setMsg('Choose the date first.'); return }
    if (READING_FIELDS.some((n) => el(n)?.value.trim()) && !window.confirm('Replace the readings already in this form with the lectionary readings for this date?')) return
    start(async () => {
      const f = await lectionaryForDate(date)
      if (!f) { setMsg('No lectionary readings are available for that date.'); return }
      const values = f as unknown as Record<string, string | null>
      for (const n of FIELDS) { const x = el(n); if (x) x.value = values[n] ?? '' }
      for (const n of IF_EMPTY) { const x = el(n); if (x && !x.value.trim() && values[n]) x.value = values[n]! }
      form.dispatchEvent(new Event('input', { bubbles: true }))
      setMsg(f.needs_check
        ? 'Filled. Please read it through: this book numbers its verses differently in the Douay-Rheims. Then click Save.'
        : 'Filled from the lectionary. Review, add your reflection and image, then click Save.')
    })
  }
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-sky px-4 py-3">
      <button type="button" onClick={run} disabled={pending} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50">
        {pending ? 'Filling…' : 'Fill from the lectionary'}
      </button>
      <span className="text-[13px] text-muted">{msg || 'Fills the day, colour and all readings (Douay-Rheims) for the date above.'}</span>
    </div>
  )
}
