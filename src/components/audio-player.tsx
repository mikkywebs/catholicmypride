'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { announcePlay, onOtherPlay } from './audio-bus'
import { DownloadIcon, PauseIcon, PlayIcon } from './icons'

function fmt(s: number) {
  if (!isFinite(s) || s < 0) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

/** Player for songs, novena days, prayers and blog audio. Pauses every other player. */
export function AudioPlayer({ src, label, downloadName, initialSeconds, next }: { src: string; label: string; downloadName?: string; initialSeconds?: number | null; next?: { href: string; title: string } | null }) {
  const id = useId()
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [d, setD] = useState(initialSeconds ?? 0)
  const [done, setDone] = useState(false)

  useEffect(() => onOtherPlay(id, () => { ref.current?.pause(); setPlaying(false) }), [id])

  // Arrived with “Play next” (?play=1): try to start (the browser may still ask for a tap).
  useEffect(() => {
    if (!ref.current || new URLSearchParams(window.location.search).get('play') !== '1') return
    announcePlay(id)
    ref.current.play().then(() => setPlaying(true)).catch(() => {})
  }, [id])

  const toggle = async () => {
    const a = ref.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false); return }
    announcePlay(id)
    try { await a.play(); setPlaying(true) } catch { setPlaying(false) }
  }

  return (
    <section data-audio-player aria-label={label} className="flex flex-wrap items-center gap-4 rounded-2xl bg-navy px-5 py-4 text-navy-ink">
      <audio ref={ref} src={src} preload="metadata" onTimeUpdate={(e) => setT(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setD(e.currentTarget.duration)} onEnded={() => { setPlaying(false); if (next) setDone(true) }} />
      <button type="button" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gold text-[#1f2430]">
        {playing ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
      </button>
      <div className="flex min-w-0 flex-1 basis-56 flex-col gap-2">
        <strong>{label}</strong>
        <input
          type="range"
          min={0}
          max={d || 0}
          step={1}
          value={t}
          aria-label="Seek"
          onChange={(e) => { if (ref.current) ref.current.currentTime = Number(e.target.value) }}
          className="w-full accent-gold"
        />
        <div className="flex justify-between text-[13px] text-navy-muted"><span>{fmt(t)}</span><span>{fmt(d)}</span></div>
      </div>
      {downloadName && (
        <a href={`${src}${src.includes('?') ? '&' : '?'}download=${encodeURIComponent(downloadName)}`} download={downloadName} className="inline-flex items-center gap-2 rounded-md bg-navy-ink px-4 py-2.5 font-semibold text-navy no-underline hover:text-navy">
          <DownloadIcon /> Download MP3
        </a>
      )}
      {done && next && (
        <div role="status" className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-[#3a4150] pt-3">
          <span className="text-navy-muted">Up next: <strong className="text-navy-ink">{next.title}</strong></span>
          <a href={`${next.href}?play=1`} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-gold px-5 font-bold text-[#1f2430] no-underline hover:text-[#1f2430]"><PlayIcon size={16} /> Play next</a>
        </div>
      )}
    </section>
  )
}
