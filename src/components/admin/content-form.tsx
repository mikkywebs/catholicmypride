'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import type { FormState } from '@/app/admin/actions'
import type { Category, Diocese } from '@/lib/types'
import { publicUrl, type ContentType, type Field } from '@/lib/content-types'
import { slugify } from '@/lib/text'
import { AudioUpload, FileUpload, ImageUpload } from './upload'
import { DioceseField, PlaceField, PlaylistField, TimeField, WeekdaysField, type SongOption } from './fields-extra'

export type FormOptions = { dioceses?: Diocese[]; songs?: SongOption[] }

type Row = Record<string, unknown>
type Action = (state: FormState, form: FormData) => Promise<FormState>

const input = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 py-2.5 font-normal text-ink'

function toLocal(iso: unknown) {
  if (typeof iso !== 'string' || !iso) return ''
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function DateTimeField({ name, label, initial }: { name: string; label: string; initial: unknown }) {
  const [local, setLocal] = useState(toLocal(initial))
  const iso = local ? new Date(local).toISOString() : ''
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">{label}
      <input type="datetime-local" value={local} onChange={(e) => setLocal(e.target.value)} className={input} />
      <input type="hidden" name={name} value={iso} />
    </label>
  )
}

function SeoPanel({ form, type }: { form: React.RefObject<HTMLFormElement | null>; type: ContentType }) {
  const [v, setV] = useState({ title: '', seoTitle: '', desc: '', kw: '', slug: '', alt: '', img: '' })
  useEffect(() => {
    const f = form.current
    if (!f) return
    const read = () => {
      const g = (n: string) => ((f.elements.namedItem(n) as HTMLInputElement | null)?.value ?? '').trim()
      setV({ title: g(type.titleField), seoTitle: g('seo_title'), desc: g('seo_description') || g('excerpt'), kw: g('focus_keyword').toLowerCase(), slug: g('slug') || g('date'), alt: g('image_alt'), img: g('featured_image') || g('cover_url') })
    }
    read()
    f.addEventListener('input', read)
    const t = setInterval(read, 1500) // picks up uploads, which change hidden inputs
    return () => { f.removeEventListener('input', read); clearInterval(t) }
  }, [form, type.titleField])
  const title = v.seoTitle || v.title
  const checks = [
    { ok: title.length >= 30 && title.length <= 60, text: 'SEO title is 30–60 characters' },
    { ok: v.desc.length >= 120 && v.desc.length <= 160, text: 'Meta description is 120–160 characters' },
    ...(type.key === 'posts' ? [
      { ok: !!v.kw && title.toLowerCase().includes(v.kw), text: 'Focus keyword is in the SEO title' },
      { ok: !!v.kw && v.desc.toLowerCase().includes(v.kw), text: 'Focus keyword is in the description' },
    ] : []),
    { ok: !!v.img, text: 'Has a featured image' },
    ...(type.fields.some((f) => f.type === 'image' && f.altField) ? [{ ok: !!v.alt, text: 'Featured image has alt text' }] : []),
  ]
  const passed = checks.filter((c) => c.ok).length
  const good = passed >= checks.length - 1
  const path = publicUrl(type, { slug: v.slug, date: v.slug }) ?? ''
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="m-0 text-lg">Google preview &amp; SEO</h2>
        <span className={`rounded-full px-2.5 py-1 text-[13px] font-semibold ${good ? 'bg-[#e3f1e8] text-[#1f5c38]' : 'bg-[#fbe7dc] text-[#9a3412]'}`}>{passed} / {checks.length} {good ? 'Good' : 'Needs work'}</span>
      </div>
      <div className="rounded-xl border border-line bg-white p-3.5 font-[Arial,sans-serif]">
        <div className="text-[13px] text-[#3c4043]">catholicmypride.org{path.replace(/\//g, ' › ')}</div>
        <div className="py-0.5 text-lg leading-snug text-[#1a0dab]">{(title || 'Your title') + ' | Catholic My Pride'}</div>
        <div className="text-sm text-[#4d5156]">{v.desc || 'Your meta description will appear here.'}</div>
      </div>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-sm">
        {checks.map((c) => (
          <li key={c.text} className="flex items-start gap-2.5"><span aria-hidden="true" className={`mt-1.5 size-2.5 shrink-0 rounded-full ${c.ok ? 'bg-[#2e7d4f]' : 'bg-[#c2410c]'}`} /><span><strong>{c.ok ? 'Good' : 'Fix'}</strong> · {c.text}</span></li>
        ))}
      </ul>
      <p className="m-0 text-[13px] text-muted">Added automatically on publish: sitemap, canonical link, social share tags and structured data.</p>
    </section>
  )
}

function FieldInput({ f, row, cats, slugFrom, options }: { f: Field; row: Row; cats: Category[]; slugFrom?: string; options: FormOptions }) {
  const val = (n: string) => (row[n] ?? '') as string
  const help = 'help' in f && f.help ? <span className="text-[13px] font-normal text-muted">{f.help}</span> : null
  switch (f.type) {
    case 'heading':
      return <h2 className="m-0 mt-2 border-t border-line pt-5 text-xl">{f.label}</h2>
    case 'text': case 'url': case 'date': case 'number':
      if (f.name === 'slug') return <SlugInput initial={val('slug')} from={slugFrom} label={f.label} help={f.help} />
      return <label className="flex flex-col gap-1.5 text-sm font-semibold">{f.label}<input name={f.name} type={f.type} defaultValue={row[f.name] == null ? '' : String(row[f.name])} required={f.required} placeholder={f.placeholder} className={input} />{help}</label>
    case 'datetime':
      return <DateTimeField name={f.name} label={f.label} initial={row[f.name]} />
    case 'textarea': case 'markdown':
      return (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">{f.label}
          <textarea name={f.name} rows={f.rows ?? 4} defaultValue={val(f.name)} required={f.required} placeholder={f.placeholder} className={`${input} resize-y ${f.type === 'markdown' ? 'font-mono text-[15px] leading-relaxed' : ''}`} />
          {f.type === 'markdown' && <span className="text-[13px] font-normal text-muted">Formatting: **bold**, *italic*, ## Heading, &gt; quote, - list, [link](https://…). Leave a blank line between paragraphs.</span>}
          {help}
        </label>
      )
    case 'select':
      return (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">{f.label}
          <select name={f.name} defaultValue={val(f.name) || (f.empty !== undefined ? '' : f.options[0])} className={input}>
            {f.empty !== undefined && <option value="">{f.empty}</option>}
            {f.options.map((o) => <option key={o} value={o}>{o[0].toUpperCase() + o.slice(1)}</option>)}
          </select>{help}
        </label>
      )
    case 'category':
      return (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          <span className="flex justify-between">{f.label}<a href={`/admin/categories?kind=${f.kind}`} target="_blank" className="font-semibold">+ New category</a></span>
          <select name={f.name} defaultValue={val(f.name)} className={input}>
            <option value="">None</option>
            {cats.filter((c) => c.kind === f.kind).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      )
    case 'image':
      return <ImageUpload name={f.name} label={f.label} shape={f.shape} initial={val(f.name)} altName={f.altField} altInitial={f.altField ? val(f.altField) : null} />
    case 'audio':
      return <AudioUpload name={f.name} secondsName={f.secondsField} label={f.label} initial={val(f.name)} initialSeconds={row[f.secondsField] as number | null} help={f.help} />
    case 'file':
      return <FileUpload name={f.name} label={f.label} accept={f.accept} initial={val(f.name)} help={f.help} />
    case 'tags':
      return <label className="flex flex-col gap-1.5 text-sm font-semibold">{f.label}<input name={f.name} defaultValue={Array.isArray(row[f.name]) ? (row[f.name] as string[]).join(', ') : ''} placeholder={f.placeholder} className={input} /><span className="text-[13px] font-normal text-muted">Separate with commas.</span></label>
    case 'place':
      return <PlaceField name={f.name} countryName={f.countryName} label={f.label} help={f.help} initialContinent={val(f.name)} initialCountry={val(f.countryName)} />
    case 'diocese':
      return <DioceseField name={f.name} label={f.label} help={f.help} dioceses={options.dioceses ?? []} initial={val(f.name)} />
    case 'weekdays':
      return <WeekdaysField name={f.name} label={f.label} help={f.help} initial={(row[f.name] as number[] | undefined) ?? []} />
    case 'time':
      return <TimeField name={f.name} label={f.label} help={f.help} initial={val(f.name)} />
    case 'playlist':
      return <PlaylistField name={f.name} label={f.label} help={f.help} songs={options.songs ?? []} initial={(row[f.name] as string[] | undefined) ?? []} />
    case 'boolean':
      return <label className="flex items-center gap-2.5 text-[15px]"><input type="checkbox" name={f.name} defaultChecked={Boolean(row[f.name] ?? (f.name === 'allow_download' || f.name === 'is_free'))} className="size-5 accent-accent" />{f.label}</label>
  }
}

function SlugInput({ initial, from, label, help }: { initial: string; from?: string; label: string; help?: string }) {
  const [v, setV] = useState(initial)
  const [touched, setTouched] = useState(Boolean(initial))
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!from || touched) return
    const f = ref.current?.form
    const src = f?.elements.namedItem(from) as HTMLInputElement | null
    if (!src) return
    const on = () => setV(slugify(src.value))
    src.addEventListener('input', on)
    return () => src.removeEventListener('input', on)
  }, [from, touched])
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">{label}
      <span className="flex items-center overflow-hidden rounded-lg border border-field">
        <span className="whitespace-nowrap bg-sky px-3 py-2.5 text-sm font-normal text-muted">catholicmypride.org/…/</span>
        <input ref={ref} name="slug" value={v} required onChange={(e) => { setV(e.target.value); setTouched(true) }} className="min-h-11 min-w-0 flex-1 bg-surface px-3 font-normal text-ink" />
      </span>
      {help && <span className="text-[13px] font-normal text-muted">{help}</span>}
    </label>
  )
}

function NovenaDaysEditor({ days }: { days: { day: number; title: string | null; prayer_md: string | null; audio_url: string | null; audio_seconds: number | null }[] }) {
  const [open, setOpen] = useState(1)
  return (
    <div className="flex flex-col gap-3">
      <h2 className="m-0 mt-2 border-t border-line pt-5 text-xl">The nine days</h2>
      {Array.from({ length: 9 }, (_, i) => i + 1).map((d) => {
        const x = days.find((y) => y.day === d)
        const on = open === d
        return (
          <section key={d} className="overflow-hidden rounded-2xl border border-line bg-surface">
            <button type="button" onClick={() => setOpen(on ? 0 : d)} aria-expanded={on} className="flex min-h-14 w-full items-center justify-between gap-3 px-5 text-ink">
              <span className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-full bg-accent-soft font-bold text-eyebrow">{d}</span><strong>Day {d}</strong>{x?.title && <span className="text-sm text-muted">{x.title}</span>}</span>
              <span className="text-sm font-semibold text-accent">{on ? 'Close' : 'Edit'}</span>
            </button>
            <div className={`flex-col gap-3 px-5 pb-5 ${on ? 'flex' : 'hidden'}`}>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">Day title / intention<input name={`day${d}_title`} defaultValue={x?.title ?? ''} className={input} /></label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">Prayer for this day<textarea name={`day${d}_prayer`} rows={7} defaultValue={x?.prayer_md ?? ''} className={`${input} resize-y font-mono text-[15px]`} /></label>
              <AudioUpload name={`day${d}_audio`} secondsName={`day${d}_seconds`} label="Audio (optional)" initial={x?.audio_url} initialSeconds={x?.audio_seconds} help="No audio? The Listen button simply won't show for this day." />
            </div>
          </section>
        )
      })}
    </div>
  )
}

export function ContentForm({ type, row, cats, action, novenaDays, options = {} }: { type: ContentType; row: Row; cats: Category[]; action: Action; novenaDays?: Parameters<typeof NovenaDaysEditor>[0]['days']; options?: FormOptions }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null)
  const ref = useRef<HTMLFormElement>(null)
  const seoNames = new Set(['seo_title', 'seo_description', 'focus_keyword', 'keywords', 'noindex', 'status', 'published_at'])
  const main = type.fields.filter((f) => !seoNames.has(f.name))
  const side = type.fields.filter((f) => seoNames.has(f.name))

  const renderFields = (list: Field[]) => {
    const out: React.ReactNode[] = []
    for (let i = 0; i < list.length; i++) {
      const f = list[i]
      const half = 'half' in f && f.half
      const next = list[i + 1]
      if (half && next && 'half' in next && next.half) {
        out.push(<div key={f.name} className="grid gap-4 sm:grid-cols-2"><FieldInput f={f} row={row} cats={cats} slugFrom={type.slugFrom} options={options} /><FieldInput f={next} row={row} cats={cats} slugFrom={type.slugFrom} options={options} /></div>)
        i++
      } else out.push(<FieldInput key={f.name} f={f} row={row} cats={cats} slugFrom={type.slugFrom} options={options} />)
    }
    return out
  }

  return (
    <form ref={ref} action={formAction} className="flex flex-wrap items-start gap-6">
      <div className="flex min-w-0 flex-[999_1_620px] flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
        {renderFields(main)}
        {type.key === 'novenas' && <NovenaDaysEditor days={novenaDays ?? []} />}
      </div>
      <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-4 lg:sticky lg:top-4">
        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
          {renderFields(side.filter((f) => f.name === 'status' || f.name === 'published_at'))}
          <button type="submit" disabled={pending} className="min-h-12 rounded-md bg-accent px-6 font-semibold text-accent-ink disabled:opacity-50">{pending ? 'Saving…' : 'Save'}</button>
          {state && !state.ok && <p role="alert" className="m-0 text-sm font-semibold text-[#b42318]">{state.message}</p>}
        </section>
        {type.seo && <SeoPanel form={ref} type={type} />}
        {side.some((f) => !['status', 'published_at'].includes(f.name)) && (
          <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">{renderFields(side.filter((f) => !['status', 'published_at'].includes(f.name)))}</section>
        )}
      </aside>
    </form>
  )
}
