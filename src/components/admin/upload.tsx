'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRef, useState } from 'react'

function browserClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

const SIZES = { '16:9': [1600, 900], '4:5': [1080, 1350], '2:3': [1000, 1500], square: [800, 800] } as const

/** Centre-crops an image to the exact shape and size, and compresses it. */
async function cropImage(file: File, shape: keyof typeof SIZES): Promise<Blob> {
  const [W, H] = SIZES[shape]
  const bmp = await createImageBitmap(file)
  const target = W / H
  const src = bmp.width / bmp.height
  let sw = bmp.width, sh = bmp.height, sx = 0, sy = 0
  if (src > target) { sw = bmp.height * target; sx = (bmp.width - sw) / 2 } else { sh = bmp.width / target; sy = (bmp.height - sh) / 2 }
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bmp, sx, sy, sw, sh, 0, 0, W, H)
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('crop failed'))), 'image/webp', 0.86))
}

async function upload(blob: Blob, folder: string, ext: string) {
  const db = browserClient()
  const path = `${folder}/${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}.${ext}`
  const { error } = await db.storage.from('media').upload(path, blob, { contentType: blob.type || undefined, upsert: false, cacheControl: '31536000' })
  if (error) throw error
  return db.storage.from('media').getPublicUrl(path).data.publicUrl
}

const btn = 'inline-flex min-h-10 items-center rounded-md border border-field bg-surface px-4 text-sm font-semibold text-ink'

export function ImageUpload({ name, label, shape, initial, altName, altInitial }: { name: string; label: string; shape: keyof typeof SIZES; initial?: string | null; altName?: string; altInitial?: string | null }) {
  const [url, setUrl] = useState(initial ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const aspect = shape === '16:9' ? 'aspect-video' : shape === '4:5' ? 'aspect-[4/5] max-w-[300px]' : shape === '2:3' ? 'aspect-[2/3] max-w-[240px]' : 'aspect-square max-w-[200px]'
  const pick = async (f: File | undefined) => {
    if (!f) return
    setBusy(true); setErr('')
    try { setUrl(await upload(await cropImage(f, shape), 'images', 'webp')) } catch (e) { setErr(e instanceof Error ? e.message : 'Upload failed') } finally { setBusy(false) }
  }
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]) }}
        className={`relative flex w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-field bg-sky ${aspect}`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <span className="p-4 text-center text-sm text-muted">{busy ? 'Uploading…' : `Drop an image · cropped to ${shape} automatically`}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={() => input.current?.click()} disabled={busy}>{busy ? 'Uploading…' : url ? 'Replace image' : 'Choose image'}</button>
        {url && <button type="button" className={btn} onClick={() => setUrl('')}>Remove</button>}
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {err && <span role="alert" className="text-sm text-[#b42318]">{err}</span>}
      {altName && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Image description (alt text)
          <input name={altName} defaultValue={altInitial ?? ''} placeholder="Describe what is in the picture" className="min-h-11 rounded-lg border border-field bg-surface px-3 font-normal text-ink" />
          <span className="text-[13px] font-normal text-muted">Helps Google Images and blind readers.</span>
        </label>
      )}
    </div>
  )
}

export function AudioUpload({ name, secondsName, label, initial, initialSeconds, help }: { name: string; secondsName: string; label: string; initial?: string | null; initialSeconds?: number | null; help?: string }) {
  const [url, setUrl] = useState(initial ?? '')
  const [secs, setSecs] = useState(initialSeconds ? String(initialSeconds) : '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const pick = async (f: File | undefined) => {
    if (!f) return
    setBusy(true); setErr('')
    try {
      const a = new Audio(URL.createObjectURL(f))
      await new Promise((r) => { a.onloadedmetadata = r; a.onerror = r })
      if (isFinite(a.duration)) setSecs(String(Math.round(a.duration)))
      setUrl(await upload(f, 'audio', f.name.split('.').pop()?.toLowerCase() || 'mp3'))
    } catch (e) { setErr(e instanceof Error ? e.message : 'Upload failed') } finally { setBusy(false) }
  }
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-bg p-3.5">
      <span className="text-sm font-semibold">{label}</span>
      <input type="hidden" name={name} value={url} />
      <input type="hidden" name={secondsName} value={secs} />
      {url && <audio src={url} controls className="w-full" />}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btn} onClick={() => input.current?.click()} disabled={busy}>{busy ? 'Uploading…' : url ? 'Replace MP3' : 'Upload MP3'}</button>
        {url && <button type="button" className={btn} onClick={() => { setUrl(''); setSecs('') }}>Remove</button>}
        {secs && <span className="text-sm text-muted">{Math.floor(Number(secs) / 60)}:{String(Number(secs) % 60).padStart(2, '0')}</span>}
        <input ref={input} type="file" accept="audio/mpeg,audio/mp3,audio/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {help && <span className="text-[13px] text-muted">{help}</span>}
      {err && <span role="alert" className="text-sm text-[#b42318]">{err}</span>}
    </div>
  )
}

export function FileUpload({ name, label, accept, initial, help }: { name: string; label: string; accept: string; initial?: string | null; help?: string }) {
  const [url, setUrl] = useState(initial ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const pick = async (f: File | undefined) => {
    if (!f) return
    setBusy(true); setErr('')
    try { setUrl(await upload(f, 'files', f.name.split('.').pop()?.toLowerCase() || 'pdf')) } catch (e) { setErr(e instanceof Error ? e.message : 'Upload failed') } finally { setBusy(false) }
  }
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btn} onClick={() => input.current?.click()} disabled={busy}>{busy ? 'Uploading…' : url ? 'Replace file' : 'Upload file'}</button>
        {url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm">View file</a>}
        {url && <button type="button" className={btn} onClick={() => setUrl('')}>Remove</button>}
        <input ref={input} type="file" accept={accept} hidden onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {help && <span className="text-[13px] text-muted">{help}</span>}
      {err && <span role="alert" className="text-sm text-[#b42318]">{err}</span>}
    </div>
  )
}
