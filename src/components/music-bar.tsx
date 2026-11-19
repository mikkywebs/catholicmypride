'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { announcePlay, onOtherPlay } from './audio-bus'
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, VolumeIcon } from './icons'
import { useClientValue } from './use-client'
import { activeSlots, dueTimed, type BarSlot, type TimedPrayer } from '@/lib/schedule'

export type Track = { id: string; slug: string; title: string; src: string; cover: string | null }

const ID = 'music-bar'

// Re-check the schedule every 15 seconds.
function subscribeClock(cb: () => void) {
  const t = setInterval(cb, 15_000)
  return () => clearInterval(t)
}
const minuteNow = () => Math.floor(Date.now() / 60_000)

/**
 * Sticky music bar. Browsers block sound until the visitor interacts,
 * so it starts on the first tap or click anywhere. There is no download control.
 */
export function MusicBar({ library, slots, loop, fallback, timed = [] }: { library: Track[]; slots: BarSlot[]; loop: boolean; fallback: string[]; timed?: TimedPrayer[] }) {
  const audio = useRef<HTMLAudioElement>(null)
  const minute = useSyncExternalStore(subscribeClock, minuteNow, () => 0)
  const byId = new Map(library.map((t) => [t.id, t]))
  const scheduled = minute ? activeSlots(slots, new Date(minute * 60_000)).map((x) => x.id) : []
  const ids = scheduled.length ? scheduled : fallback
  const tracks = ids.map((id) => byId.get(id)).filter(Boolean) as Track[]
  // A prayer at its set time (Angelus, Divine Mercy) interrupts the music, then the music carries on.
  const [prayer, setPrayer] = useState<{ id: string; label: string; resume: boolean; blocked: boolean } | null>(null)
  const queueKey = ids.join(',')
  const [pos, setPos] = useState({ key: '', i: 0 })
  const i = pos.key === queueKey && pos.i < tracks.length ? pos.i : 0
  const setI = (n: number) => setPos({ key: queueKey, i: n })
  const [playing, setPlaying] = useState(false)
  // Remember volume and mute between visits.
  const storedVolume = useClientValue(() => Number(localStorage.getItem('cmp-volume') ?? 0.6), 0.6)
  const storedMuted = useClientValue(() => localStorage.getItem('cmp-muted') === '1', false)
  const [volOverride, setVolume] = useState<number | null>(null)
  const [muteOverride, setMuted] = useState<boolean | null>(null)
  const volume = volOverride ?? storedVolume
  const muted = muteOverride ?? storedMuted
  const userPaused = useRef(false)
  useEffect(() => { try { userPaused.current = sessionStorage.getItem('cmp-paused') === '1' } catch {} }, [])

  useEffect(() => {
    if (!audio.current) return
    audio.current.volume = volume
    audio.current.muted = muted
    try { localStorage.setItem('cmp-volume', String(volume)); localStorage.setItem('cmp-muted', muted ? '1' : '0') } catch {}
  }, [volume, muted])

  const play = async () => {
    if (!audio.current) return
    try {
      announcePlay(ID)
      await audio.current.play()
      setPlaying(true)
      setPrayer((p) => (p?.blocked ? { ...p, blocked: false } : p))
      userPaused.current = false
      try { sessionStorage.removeItem('cmp-paused') } catch {}
    } catch {
      setPlaying(false)
    }
  }
  const pause = () => { audio.current?.pause(); setPlaying(false) }

  // Autoplay after the first interaction, unless the visitor paused it this session.
  useEffect(() => {
    if (!tracks.length) return
    const start = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.('[data-music-bar], [data-audio-player]')) return
      if (!userPaused.current) play()
    }
    window.addEventListener('pointerdown', start, { once: true })
    return () => window.removeEventListener('pointerdown', start)
  }, [tracks.length])

  useEffect(() => onOtherPlay(ID, pause), [])

  // Start a prayer when its time comes (once per time, even with several tabs open).
  useEffect(() => {
    if (!minute || prayer) return
    const due = dueTimed(timed, new Date())
    if (!due || !byId.has(due.id)) return
    try {
      if (localStorage.getItem('cmp-timed') === due.key) return
      localStorage.setItem('cmp-timed', due.key)
    } catch {}
    const t = setTimeout(() => setPrayer({ id: due.id, label: due.label, resume: playing, blocked: false }), 0)
    return () => clearTimeout(t)
  }, [minute]) // eslint-disable-line react-hooks/exhaustive-deps

  // When a prayer is set, play it; if the browser blocks sound (no tap yet), show a button.
  useEffect(() => {
    if (!prayer || prayer.blocked || !audio.current) return
    const a = audio.current
    announcePlay(ID)
    a.play().then(() => setPlaying(true)).catch(() => setPrayer((p) => (p ? { ...p, blocked: true } : p)))
  }, [prayer?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // After the prayer, carry on with the music once the song is back in the player.
  const resumeAfter = useRef(false)
  useEffect(() => {
    if (prayer || !resumeAfter.current) return
    resumeAfter.current = false
    play()
  }, [prayer])

  // A prayer the browser would not start (no tap yet) is offered for 10 minutes, then removed until its next time.
  useEffect(() => {
    if (!prayer?.blocked) return
    const t = setTimeout(() => setPrayer(null), 10 * 60_000)
    return () => clearTimeout(t)
  }, [prayer?.blocked, prayer?.id])

  const prayerTrack = prayer ? byId.get(prayer.id) : undefined
  if (!tracks.length && !prayerTrack) return null
  const t = prayerTrack ?? tracks[i]
  const step = (d: number) => {
    if (prayer) { setPrayer(null); setTimeout(() => { if (playing) play() }, 0); return }
    const n = (i + d + tracks.length) % tracks.length
    setI(n)
    setTimeout(() => { if (playing) play() }, 0)
  }
  const ended = () => {
    if (prayer) {
      resumeAfter.current = prayer.resume && tracks.length > 0
      setPrayer(null)
      setPlaying(false)
      return
    }
    if (i + 1 < tracks.length) { setI(i + 1); setTimeout(play, 0) }
    else if (loop) { setI(0); setTimeout(play, 0) }
    else setPlaying(false)
  }

  return (
    <div data-music-bar role="region" aria-label="Music player" className="sticky bottom-0 z-40 border-t-2 border-gold bg-navy px-5 py-2.5 text-navy-ink shadow-[0_-4px_16px_rgba(0,0,0,0.15)]">
      <audio
        ref={audio}
        src={t.src}
        preload="none"
        controlsList="nodownload noplaybackrate"
        onContextMenu={(e) => e.preventDefault()}
        onEnded={ended}
      />
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex min-w-0 flex-1 basis-60 items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-[#3a4050]">
            {t.cover && <Image src={t.cover} alt="" fill sizes="44px" className="object-cover" />}
          </div>
          <div className="min-w-0">
            <a href={`/audio/${t.slug}`} className="block truncate font-semibold text-navy-ink no-underline">{t.title}</a>
            <div className="text-[13px] text-navy-muted">{prayer ? `${prayer.label}${prayer.blocked ? ' · tap play to pray along' : ''}` : 'Catholic My Pride'}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Previous song" onClick={() => step(-1)} className="flex size-11 items-center justify-center rounded-full text-navy-ink"><PrevIcon /></button>
          <button
            type="button"
            aria-label={playing ? 'Pause' : 'Play'}
            onClick={() => {
              if (playing) { pause(); userPaused.current = true; try { sessionStorage.setItem('cmp-paused', '1') } catch {} }
              else play()
            }}
            className="flex size-12 items-center justify-center rounded-full bg-gold text-[#1f2430]"
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button type="button" aria-label="Next song" onClick={() => step(1)} className="flex size-11 items-center justify-center rounded-full text-navy-ink"><NextIcon /></button>
        </div>
        <div className="flex basis-52 items-center gap-2.5">
          <button type="button" aria-label={muted ? 'Unmute' : 'Mute'} aria-pressed={muted} onClick={() => setMuted(!muted)} className="flex size-11 items-center justify-center rounded-full text-navy-ink">
            <VolumeIcon muted={muted || volume === 0} />
          </button>
          <label className="sr-only" htmlFor="cmp-volume">Volume</label>
          <input id="cmp-volume" type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); setMuted(false) }} className="min-w-24 flex-1 accent-gold" />
        </div>
      </div>
    </div>
  )
}
