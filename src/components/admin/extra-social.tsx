'use client'

import { useState } from 'react'
import { BrandIcon, EXTRA_BRANDS, LinkIcon } from '../icons'
import { detectPlatform, type SocialLink } from '@/lib/social'

const input = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 py-2.5 font-normal text-ink'

/** Any number of extra social links. The logo is picked from the link automatically. */
export function ExtraSocialField({ initial }: { initial: SocialLink[] }) {
  const [rows, setRows] = useState<SocialLink[]>(initial)
  const set = (i: number, patch: Partial<SocialLink>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4">
      <input type="hidden" name="extra_social" value={JSON.stringify(rows.filter((r) => r.url.trim()))} />
      <div>
        <p className="m-0 text-sm font-semibold">Other social media</p>
        <p className="m-0 text-[13px] text-muted">Instagram, WhatsApp channel, Telegram, Spotify, Threads and more. The logo appears automatically from the link.</p>
      </div>
      {rows.map((r, i) => {
        const p = detectPlatform(r.url)
        const brand = p.key ? EXTRA_BRANDS[p.key] : undefined
        return (
          <div key={i} className="flex flex-col gap-2 rounded-xl border border-line p-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              {brand ? <BrandIcon icon={brand.icon} size={16} color={brand.mono ? 'currentColor' : undefined} /> : <LinkIcon size={16} />}
              {r.label || p.name || 'New link'}
              <button type="button" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className="ml-auto text-[13px] font-semibold text-muted hover:text-[#b42318]">Remove</button>
            </div>
            <input type="url" value={r.url} onChange={(e) => set(i, { url: e.target.value })} placeholder="https://instagram.com/cmpapostolate" aria-label="Link" className={input} />
            <input value={r.label} onChange={(e) => set(i, { label: e.target.value })} placeholder={p.name ? `Name (optional, default: ${p.name})` : 'Name, e.g. WhatsApp Channel'} aria-label="Name" maxLength={40} className={input} />
          </div>
        )
      })}
      <button type="button" onClick={() => setRows((r) => [...r, { label: '', url: '' }])} className="self-start rounded-md border border-field bg-surface px-4 py-2 text-sm font-semibold">+ Add a social link</button>
    </div>
  )
}
