'use client'

import { useState } from 'react'
import { announcePlay } from './audio-bus'

/** The video id from any YouTube link: watch?v=, youtu.be/, /shorts/, /embed/, /live/. */
export function youTubeId(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\.|^m\./, '')
    let id: string | null = null
    if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0]
    else if (host.endsWith('youtube.com') || host === 'youtube-nocookie.com') {
      id = u.searchParams.get('v') ?? u.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/)?.[1] ?? null
    }
    return id && /^[\w-]{6,20}$/.test(id) ? id : null
  } catch {
    return null
  }
}

/**
 * A YouTube video that plays right on the page. It shows only the thumbnail until tapped, so the page stays
 * fast and YouTube loads nothing (no cookies) for visitors who don't watch. Tapping pauses our own audio.
 */
export function YouTubeEmbed({ url, title }: { url: string | null | undefined; title: string }) {
  const id = youTubeId(url)
  const [on, setOn] = useState(false)
  if (!id) return null
  return (
    <figure className="m-0 flex flex-col gap-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#111]">
        {on ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button type="button" onClick={() => { announcePlay('youtube'); setOn(true) }} aria-label={`Play video: ${title}`} className="group absolute inset-0 size-full cursor-pointer border-0 p-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-90 transition group-hover:opacity-100" />
            <span className="absolute left-1/2 top-1/2 flex h-14 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-[#ff0000] shadow-lg transition group-hover:scale-105">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff" aria-hidden><path d="M8 5v14l11-7z" /></svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="text-[14px] text-muted">▶ {title} · <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer">Watch on YouTube</a></figcaption>
    </figure>
  )
}
