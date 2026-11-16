'use client'

import { useState } from 'react'
import { DIRECTORY_FACTS } from '@/lib/directory-data'

const NUMBERS = ['total_provinces', 'total_dioceses', 'total_parishes', 'total_priests', 'catholic_population'] as const

/** Fills the country or province entry with ready-made figures. Everything stays editable. */
export function RegionFill() {
  const [msg, setMsg] = useState('')
  const run = (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.form
    if (!form) return
    const el = (n: string) => form.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement | null
    const country = el('country')?.value ?? ''
    const province = (el('province')?.value ?? '').trim()
    const facts = DIRECTORY_FACTS[country]
    if (!country) { setMsg('Choose the continent and country first.'); return }
    if (!facts) { setMsg(`No ready-made figures for ${country} yet. Please type them in.`); return }
    const filled = [...NUMBERS, 'province_list'].some((n) => el(n)?.value.trim())
    if (filled && !window.confirm('Replace what is already in this form with the ready-made figures?')) return
    const set = (n: string, v: string | number | undefined) => { const x = el(n); if (x) x.value = v == null ? '' : String(v) }
    if (province) {
      const key = Object.keys(facts.provinces).find((p) => p.toLowerCase() === province.replace(/^(ecclesiastical )?province of /i, '').toLowerCase())
      if (!key) { setMsg(`“${province}” is not one of ${country}’s provinces: ${Object.keys(facts.provinces).join(', ')}.`); return }
      set('province', key)
      set('province_list', '')
      for (const n of NUMBERS) set(n, '')
      set('total_dioceses', facts.provinces[key].length)
      setMsg(`Filled: ${facts.provinces[key].length} dioceses in the Province of ${key} (${facts.provinces[key].join(', ')}). Add parishes, priests or Catholics if you have them, then Save.`)
    } else {
      set('province_list', Object.keys(facts.provinces).join(', '))
      for (const n of NUMBERS) set(n, facts.totals[n])
      setMsg(`Filled from ${facts.source} (figures as of ${facts.asOf}). Edit anything that has changed, then Save.`)
    }
    const status = el('status')
    if (status) status.value = 'published'
  }
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-sky px-4 py-3">
      <button type="button" onClick={run} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink">Auto-fill</button>
      <span className="text-[13px] text-muted">{msg || 'Fills the provinces and official totals for the chosen country (or one province). You can edit everything afterwards.'}</span>
    </div>
  )
}
