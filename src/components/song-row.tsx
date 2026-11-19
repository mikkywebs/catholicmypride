'use client'

import Image from 'next/image'
import { useEffect, useId, useRef, useState } from 'react'
import { announcePlay, onOtherPlay } from './audio-bus'
import { PauseIcon, PlayIcon } from './icons'
import { ListViews } from './engage'

/** Compact song row with an inline play button (pauses the music bar). */
export function SongRow({ slug, title, meta, src, cover }: { slug: string; title: string; meta: string; src: string | null; cover: string | null }) {
  const id = useId()
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  useEffect(() => onOtherPlay(id, () => { ref.current?.pause(); setPlaying(false) }), [id])
  const toggle = async () => {
    if (!ref.current) return
    if (playing) { ref.current.pause(); setPlaying(false); return }
    announcePlay(id)
    try { await ref.current.play(); setPlaying(true) } catch {}
  }
  return (
    <div data-audio-player className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface px-4 py-3.5">
      {src && <audio ref={ref} src={src} preload="none" onEnded={() => setPlaying(false)} />}
      <button type="button" disabled={!src} onClick={toggle} aria-label={`${playing ? 'Pause' : 'Play'} ${title}`} className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy text-navy-ink disabled:opacity-40">
        {playing ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
      </button>
      <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-lg bg-ph">
        {cover && <Image src={cover} alt="" fill sizes="48px" className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1 basis-52">
        <a href={`/audio/${slug}`} className="font-semibold text-ink no-underline">{title}</a>
        <div className="flex flex-wrap items-center gap-x-3 text-sm text-muted"><span>{meta}</span><ListViews path={`/audio/${slug}`} /></div>
      </div>
      <a href={`/audio/${slug}`} className="inline-flex min-h-10 items-center rounded-md border border-ink px-4 text-[15px] font-semibold text-ink no-underline">Open</a>
    </div>
  )
}
