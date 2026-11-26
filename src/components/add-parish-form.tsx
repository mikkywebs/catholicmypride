'use client'

import { startTransition, useActionState, useState } from 'react'
import { submitParish, type ParishState } from '@/app/(site)/churches/add/actions'
import type { Church, Diocese } from '@/lib/types'

const input = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 py-2.5 text-ink'
const label = 'flex flex-col gap-1.5 text-[15px] font-semibold'
const help = 'text-[13px] font-normal text-muted'
type D = Pick<Diocese, 'id' | 'name' | 'kind' | 'country' | 'deaneries'>

export function AddParishForm({ dioceses, church, initialCountry, initialDiocese, contactEmail }: { dioceses: D[]; church?: Church | null; initialCountry?: string; initialDiocese?: string; contactEmail?: string | null }) {
  // Contact details already listed are locked: only the parish can change them, by writing to us.
  const locked = { phone: Boolean(church?.phone), email: Boolean(church?.email), website: Boolean(church?.website) }
  const anyLocked = locked.phone || locked.email || locked.website
  const [state, action, busy] = useActionState<ParishState, FormData>(submitParish, null)
  const start = dioceses.find((d) => d.id === (church?.diocese_id ?? initialDiocese))
  const countries = [...new Set(dioceses.map((d) => d.country))].sort()
  const [country, setCountry] = useState(start?.country ?? (initialCountry && countries.includes(initialCountry) ? initialCountry : ''))
  const [dioceseId, setDioceseId] = useState(start?.id ?? '')
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(church?.lat != null && church?.lng != null ? { lat: church.lat, lng: church.lng } : null)
  const [geo, setGeo] = useState('')
  const list = dioceses.filter((d) => d.country === country).sort((a, b) => (a.kind === 'Archdiocese' ? -1 : 0) - (b.kind === 'Archdiocese' ? -1 : 0) || a.name.localeCompare(b.name))
  const deaneries = dioceses.find((d) => d.id === dioceseId)?.deaneries ?? []
  const err = (f: string) => (state && !state.ok && state.field === f ? 'border-[#b42318]' : '')

  if (state?.ok) return <p role="status" className="m-0 rounded-2xl bg-[#e3f1e8] px-6 py-5 text-[17px] text-[#1f5c38]">{state.message}</p>

  const here = () => {
    if (!navigator.geolocation) { setGeo('Location is not available on this device.'); return }
    setGeo('Finding your position…')
    navigator.geolocation.getCurrentPosition((p) => { setPos({ lat: Number(p.coords.latitude.toFixed(6)), lng: Number(p.coords.longitude.toFixed(6)) }); setGeo('Position saved. Thank you!') }, () => setGeo('Location was not allowed. You can paste a Google Maps link instead.'), { enableHighAccuracy: true, timeout: 20000 })
  }

  return (
    // Sent by hand (not form action=…), so nothing the visitor typed is cleared if a field needs fixing.
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)) }} className="flex flex-col gap-5">
      <input type="hidden" name="kind" value={church ? 'update' : 'new'} />
      {church && <input type="hidden" name="church_id" value={church.id} />}
      <input type="hidden" name="lat" value={pos?.lat ?? ''} />
      <input type="hidden" name="lng" value={pos?.lng ?? ''} />
      <div aria-hidden className="hidden"><label>Company <input name="company" tabIndex={-1} autoComplete="off" /></label></div>

      <fieldset className="m-0 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
        <legend className="px-1 text-lg font-semibold">Where is the parish?</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>Country
            <select value={country} onChange={(e) => { setCountry(e.target.value); setDioceseId('') }} className={input} disabled={Boolean(church)} required>
              <option value="">Choose…</option>{countries.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className={label}>Archdiocese or diocese
            <select name="diocese_id" value={dioceseId} onChange={(e) => setDioceseId(e.target.value)} className={`${input} ${err('diocese_id')}`} required>
              <option value="">{country ? 'Choose…' : 'Choose the country first'}</option>
              {list.map((d) => <option key={d.id} value={d.id}>{/ordinariate|eparchy/i.test(d.kind) ? d.name : `${d.kind} of ${d.name}`}</option>)}
            </select>
          </label>
        </div>
        <label className={label}>Deanery or zone <span className={help}>(optional)</span>
          {deaneries.length ? (
            <select name="deanery" defaultValue={church?.deanery ?? ''} className={input}><option value="">Not sure</option>{deaneries.map((x) => <option key={x}>{x}</option>)}</select>
          ) : <input name="deanery" defaultValue={church?.deanery ?? ''} className={input} placeholder="e.g. Ikeja Deanery" maxLength={80} />}
        </label>
        <label className={label}>Parish name
          <input name="name" defaultValue={church?.name ?? ''} className={`${input} ${err('name')}`} placeholder="e.g. St Leo Catholic Church, Ikeja" required maxLength={120} />
        </label>
        <label className={label}>Address <span className={help}>Street, area and town</span>
          <textarea name="address" defaultValue={church?.address ?? ''} rows={2} className={input} maxLength={300} />
        </label>
        <label className={label}>Google Maps link <span className={help}>(optional) In Google Maps, find the church, tap Share and copy the link.</span>
          <input name="map_url" type="url" defaultValue={church?.map_url ?? ''} className={`${input} ${err('map_url')}`} placeholder="https://maps.app.goo.gl/…" maxLength={600} />
        </label>
        <div className="flex flex-wrap items-center gap-3 text-[14px]">
          <button type="button" onClick={here} className="rounded-lg border border-field bg-bg px-4 py-2 font-semibold">📍 I am at the church now: use my location</button>
          <span className="text-muted">{geo || (pos ? 'Position saved.' : 'This lets visitors find the parish with “near me”.')}</span>
        </div>
      </fieldset>

      <fieldset className="m-0 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
        <legend className="px-1 text-lg font-semibold">Mass times and contact <span className="text-[14px] font-normal text-muted">(all optional)</span></legend>
        <label className={label}>Mass times <span className={help}>One line per day, for example “Sunday: 6:30am, 8:30am, 10:30am” or “Weekdays: 6:30am”.</span>
          <textarea name="mass_times" defaultValue={church?.mass_times ?? ''} rows={5} className={input} maxLength={1500} placeholder={'Sunday: 6:30am, 8:30am, 10:30am\nWeekdays: 6:30am\nSaturday: 7:00am'} />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          {locked.phone ? <Locked label="Parish phone" value={church!.phone!} /> : <label className={label}>Parish phone<input name="phone" className={input} maxLength={40} /></label>}
          {locked.email ? <Locked label="Parish email" value={church!.email!} /> : <label className={label}>Parish email<input name="email" type="email" className={`${input} ${err('email')}`} maxLength={120} /></label>}
          {locked.website ? <Locked label="Parish website" value={church!.website!} /> : <label className={label}>Parish website<input name="website_url" className={input} maxLength={200} /></label>}
        </div>
        {anyLocked && (
          <p className="m-0 rounded-xl bg-accent-soft px-4 py-3 text-[14px]">
            🔒 <strong>Listed contact details are protected</strong> so no one can replace them with a false number. If they are wrong, the parish office or parish priest should write to us{contactEmail ? <> at <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Contact details: ${church!.name}`)}`} className="font-semibold">{contactEmail}</a></> : ' through our Contact page'}, from the parish’s official email or with a signed letter on parish letterhead.
          </p>
        )}
        {!church && <p className="m-0 text-[14px] text-muted">Please give only the parish’s official phone, email and website. We confirm them with the parish before they appear.</p>}
      </fieldset>

      <fieldset className="m-0 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5">
        <legend className="px-1 text-lg font-semibold">About you</legend>
        <p className="m-0 text-[14px] text-muted">Not shown on the website. We only use it if we need to check something.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className={label}>Your name<input name="submitter_name" className={`${input} ${err('submitter_name')}`} required maxLength={80} /></label>
          <label className={label}>Your phone or email<input name="submitter_contact" className={`${input} ${err('submitter_contact')}`} required maxLength={120} /></label>
          <label className={label}>You are…
            <select name="role" className={input} defaultValue="Parishioner"><option>Parishioner</option><option>Parish priest</option><option>Parish secretary</option><option>Catechist or parish worker</option><option>Visitor</option></select>
          </label>
        </div>
        <label className={label}>Anything else? <span className={help}>(optional)</span><textarea name="note" rows={2} className={input} maxLength={600} /></label>
      </fieldset>

      {state && !state.ok && <p role="alert" className="m-0 rounded-lg bg-[#fdecea] px-4 py-3 text-[#8c1d18]">{state.message}</p>}
      <button disabled={busy} className="self-start rounded-md bg-accent px-6 py-3 text-[17px] font-semibold text-accent-ink disabled:opacity-60">{busy ? 'Sending…' : church ? 'Send the update' : 'Send the parish'}</button>
    </form>
  )
}

function Locked({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 text-[15px] font-semibold">
      <span>{label} 🔒</span>
      <span className="break-words rounded-md border border-line bg-bg px-3 py-2 font-normal text-muted">{value}</span>
    </div>
  )
}
