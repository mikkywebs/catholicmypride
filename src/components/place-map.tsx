'use client'

import { useState } from 'react'

/** "Get directions" link plus a small map that loads only when asked for. */
export function PlaceMap({ name, address, country, mapUrl }: { name: string; address: string | null | undefined; country: string; mapUrl: string | null | undefined }) {
  const [open, setOpen] = useState(false)
  const query = [name, address, country].filter(Boolean).join(', ')
  const directions = mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  const canEmbed = Boolean(address)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[15px]">
        <a href={directions} target="_blank" rel="noopener noreferrer" className="font-semibold">Get directions →</a>
        {canEmbed && (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="font-semibold text-accent">
            {open ? 'Hide map' : 'Show on map'}
          </button>
        )}
      </div>
      {open && canEmbed && (
        <iframe
          title={`Map of ${name}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="aspect-[4/3] w-full rounded-xl border border-line"
        />
      )}
    </div>
  )
}
