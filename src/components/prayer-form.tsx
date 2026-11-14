'use client'

import { useActionState, useMemo, useState } from 'react'
import { submitPrayerRequest, type RequestState } from '@/app/actions'
import { COUNTRIES } from '@/lib/countries'
import { LINK_PATTERN } from '@/lib/format'
import { ChevronDown } from './icons'

const field = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 py-2.5 text-ink'

function CountryPicker() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const matches = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return COUNTRIES
    return [...COUNTRIES.filter((c) => c.toLowerCase().startsWith(s)), ...COUNTRIES.filter((c) => !c.toLowerCase().startsWith(s) && c.toLowerCase().includes(s))]
  }, [q])
  return (
    <div className="relative flex flex-1 basis-52 flex-col gap-1.5">
      <label htmlFor="pr-country" className="text-sm font-semibold">Country</label>
      <div className="relative">
        <input
          id="pr-country"
          name="country"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="pr-country-list"
          autoComplete="off"
          placeholder="Type or choose…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className={`${field} pr-10`}
        />
        <button type="button" tabIndex={-1} aria-label="Show all countries" onClick={() => setOpen((o) => !o)} className="absolute right-1 top-1 flex size-9 items-center justify-center text-muted"><ChevronDown size={16} /></button>
      </div>
      {open && (
        <ul id="pr-country-list" role="listbox" className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-xl border border-field bg-surface p-1.5 shadow-[0_12px_30px_rgba(31,36,48,0.14)]">
          {matches.length ? matches.map((c) => (
            <li key={c} role="option" aria-selected={c === q}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setQ(c); setOpen(false) }} className="min-h-10 w-full rounded-md px-2.5 text-left text-ink hover:bg-sky">{c}</button>
            </li>
          )) : <li className="px-2.5 py-2 text-muted">No country matches</li>}
        </ul>
      )}
    </div>
  )
}

export function PrayerForm() {
  const [state, action, pending] = useActionState<RequestState, FormData>(submitPrayerRequest, null)
  const [text, setText] = useState('')
  const hasLink = LINK_PATTERN.test(text)

  if (state?.ok) {
    return <div role="status" className="flex-1 basis-[460px] rounded-2xl border border-line bg-surface p-9 text-lg">{state.message}</div>
  }

  return (
    <form action={action} className="flex flex-1 basis-[460px] flex-col gap-4 rounded-2xl border border-line bg-surface p-7 sm:p-9">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-1 basis-52 flex-col gap-1.5">
          <label htmlFor="pr-name" className="text-sm font-semibold">Name (optional)</label>
          <input id="pr-name" name="name" className={field} maxLength={80} />
        </div>
        <CountryPicker />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="pr-email" className="text-sm font-semibold">Email (optional, for a reply)</label>
        <input id="pr-email" name="email" type="email" className={field} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="pr-body" className="text-sm font-semibold">Your prayer intention</label>
        <textarea
          id="pr-body"
          name="body"
          rows={5}
          required
          maxLength={2000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-invalid={hasLink}
          aria-describedby="pr-body-help"
          className={`${field} resize-y ${hasLink ? 'border-2 border-[#b42318]' : ''}`}
        />
        {hasLink ? (
          <span id="pr-body-help" role="alert" className="text-sm font-semibold text-[#b42318] dark:text-[#ff8a7a]">Links and web addresses aren&apos;t allowed. Please remove them to send your request.</span>
        ) : (
          <span id="pr-body-help" className="text-[13px] text-muted">To keep this space safe, links and web addresses are blocked.</span>
        )}
      </div>
      <label className="flex items-center gap-2.5 text-[15px]">
        <input type="checkbox" name="private" className="size-5 accent-accent" /> Keep my request private
      </label>
      {state && !state.ok && <p role="alert" className="m-0 text-sm font-semibold text-[#b42318] dark:text-[#ff8a7a]">{state.message}</p>}
      <button type="submit" disabled={hasLink || pending} className="min-h-12 self-start rounded-md bg-accent px-6 font-semibold text-accent-ink disabled:cursor-not-allowed disabled:opacity-50">
        {pending ? 'Sending…' : 'Send my request'}
      </button>
      <p className="m-0 text-[13px] text-muted">Public requests appear on the <a href="/prayer-requests#wall">Prayer Wall</a> once a moderator approves them. Private requests are never shown.</p>
    </form>
  )
}
