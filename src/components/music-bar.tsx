'use client'

import Image from 'next/image'
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { announcePlay, onOtherPlay } from './audio-bus'
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, VolumeIcon } from './icons'
import { useClientValue } from './use-client'
import { PrayerReminders } from './prayer-reminders'
import { activeSlots, clock, dueTimed, recentTimed, type BarSlot, type TimedPrayer } from '@/lib/schedule'

export type Track = { id: string; slug: string; title: string; src: string; cover: string | null }

const ID = 'music-bar'

// Re-check the schedule every 15 seconds.
function subscribeClock(cb: () => void) {
  const t = setInterval(cb, 15_000)
  return () => clearInterval(t)
}
const minuteNow = () => Math.floor(Date.now() / 60_000)
const setMute = (el: HTMLAudioElement, m: boolean) => { el.muted = m }

/**
 * Sticky music bar. Music starts only when the visitor presses Play, plays the list once and stops
 * (never the same item twice in a row). Prayers with set times are handled by the timed-prayer logic.
 * There is no download control.
 */
export function MusicBar({ library, slots, fallback, timed = [] }: { library: Track[]; slots: BarSlot[]; fallback: string[]; timed?: TimedPrayer[] }) {
  const audio = useRef<HTMLAudioElement>(null)
  const minute = useSyncExternalStore(subscribeClock, minuteNow, () => 0)
  const byId = new Map(library.map((t) => [t.id, t]))
  // Prayers with set times (Angelus, Divine Mercy) never come up through Previous/Next.
  const timedIds = new Set(timed.map((p) => p.id))
  const rotation = library.filter((x) => !timedIds.has(x.id))
  const scheduled = minute ? activeSlots(slots, new Date(minute * 60_000)).map((x) => x.id) : []
  const ids = scheduled.length ? scheduled : fallback
  const tracks = ids.map((id) => byId.get(id)).filter(Boolean) as Track[]
  // A prayer at its set time (Angelus, Divine Mercy) interrupts the music, then the music carries on.
  const [prayer, setPrayer] = useState<{ id: string; label: string; resume: boolean; blocked: boolean } | null>(null)
  const queueKey = ids.join(',')
  const [pos, setPos] = useState({ key: '', i: 0 })
  const i = pos.key === queueKey && pos.i < tracks.length ? pos.i : 0
  const setI = (n: number) => { setExtra(null); setPos({ key: queueKey, i: n }) }
  // When the list has only one item, Previous/Next move through all the audio instead.
  const [extra, setExtra] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  // Remember volume and mute between visits.
  const storedVolume = useClientValue(() => Number(localStorage.getItem('cmp-volume') ?? 0.6), 0.6)
  const storedMuted = useClientValue(() => localStorage.getItem('cmp-muted') === '1', false)
  const [volOverride, setVolume] = useState<number | null>(null)
  const [muteOverride, setMuted] = useState<boolean | null>(null)
  const volume = volOverride ?? storedVolume
  const muted = muteOverride ?? storedMuted
  const userPaused = useRef(false)
  const unlocking = useRef(false) // a first-tap unlock is in progress (see below)
  const [loadError, setLoadError] = useState(false)
  useEffect(() => { try { userPaused.current = sessionStorage.getItem('cmp-paused') === '1' } catch {} }, [])

  useEffect(() => {
    if (!audio.current) return
    audio.current.volume = volume
    audio.current.muted = muted
    try { localStorage.setItem('cmp-volume', String(volume)); localStorage.setItem('cmp-muted', muted ? '1' : '0') } catch {}
  }, [volume, muted])

  const play = async () => {
    if (!audio.current) return
    unlocking.current = false
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

  useEffect(() => onOtherPlay(ID, pause), [])

  // Phones only let a page start sound by itself after the visitor has tapped it, and an iPhone only lets
  // a player that a tap has started once play later on its own. So the first tap anywhere on the site
  // starts and stops the (silent, muted) player once. After that, a prayer at its set time can start by itself.
  useEffect(() => {
    const unlock = () => {
      const a = audio.current
      if (!a || !a.paused || a.dataset.unlocked) return
      const wasMuted = a.muted
      unlocking.current = true
      a.muted = true
      a.play().then(() => {
        a.dataset.unlocked = '1'
        if (unlocking.current) { a.pause(); a.currentTime = 0 }
      }).catch(() => {}).finally(() => { setMute(a, wasMuted); unlocking.current = false })
    }
    const opts = { capture: true, passive: true } as const
    for (const e of ['pointerdown', 'touchend', 'keydown']) document.addEventListener(e, unlock, opts)
    return () => { for (const e of ['pointerdown', 'touchend', 'keydown']) document.removeEventListener(e, unlock, opts) }
  }, [])

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

  // Late visitors: a prayer whose time passed a few minutes ago is offered, never played by itself.
  const [late, setLate] = useState<{ id: string; key: string; title: string; time: string; ago: number } | null>(null)
  useEffect(() => {
    if (!minute) return
    const r = recentTimed(timed, new Date())
    let show = r && byId.has(r.id) ? r : null
    try {
      // Already heard or offered at that time on this device, or closed: don't offer it again.
      if (show && (localStorage.getItem('cmp-timed') === show.key || localStorage.getItem('cmp-late-closed') === show.key)) show = null
    } catch {}
    const t = setTimeout(() => setLate(show), 0)
    return () => clearTimeout(t)
  }, [minute]) // eslint-disable-line react-hooks/exhaustive-deps
  // Opened from a prayer-time notification (/?pray=<slug>): start that prayer, or offer "Pray now" if sound is blocked.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const want = q.get('pray')
    if (!want) return
    const t = library.find((x) => x.id === want || x.slug === want)
    q.delete('pray')
    history.replaceState(null, '', window.location.pathname + (q.size ? `?${q}` : '') + window.location.hash)
    if (!t) return
    const p = timed.find((x) => x.id === t.id)
    const due = p ? dueTimed([p], new Date()) : null
    try { if (due) localStorage.setItem('cmp-timed', due.key) } catch {}
    // Label with the prayer time that has just passed (the Angelus has three).
    const n = new Date(), mins = n.getHours() * 60 + n.getMinutes()
    const at = (x: string) => Number(x.slice(0, 2)) * 60 + Number(x.slice(3, 5))
    const last = p?.times.filter((x) => at(x) <= mins).sort((a, b) => at(b) - at(a))[0] ?? p?.times[0]
    const id = setTimeout(() => setPrayer({ id: t.id, label: `${last ? clock(last) + ' · ' : ''}${t.title}`, resume: false, blocked: false }), 300)
    return () => clearTimeout(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Admin preview: open any page with ?prayer-preview=<id or slug> to see what visitors see at prayer time,
  // or add &late=1 to see the reminder for late arrivals. Nothing is remembered on the device.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const want = q.get('prayer-preview')
    if (!want) return
    const t = library.find((x) => x.id === want || x.slug === want)
    if (!t) return
    const p = timed.find((x) => x.id === t.id)
    const time = p?.times[0] ? clock(p.times[0]) : 'its time'
    const id = setTimeout(() => {
      if (q.get('late') === '1') setLate({ id: t.id, key: 'preview', title: t.title, time, ago: 5 })
      else setPrayer({ id: t.id, label: `${time} · ${t.title} (preview)`, resume: false, blocked: false })
    }, 600)
    return () => clearTimeout(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Phones only allow sound that starts inside the tap itself, so load and play the prayer right here,
  // not after the next render.
  const startedBy = useRef<string | null>(null)
  const loadSrc = (src: string) => {
    const a = audio.current
    if (a && a.dataset.src !== src) { a.src = src; a.dataset.src = src; setLoadError(false) }
  }
  const prayLate = () => {
    if (!late) return
    if (late.key !== 'preview') try { localStorage.setItem('cmp-timed', late.key) } catch {}
    const track = byId.get(late.id)
    const a = audio.current
    if (a && track) {
      loadSrc(track.src)
      unlocking.current = false
      setMute(a, muted)
      startedBy.current = late.id
      announcePlay(ID)
      a.play().then(() => setPlaying(true)).catch(() => setPrayer((p) => (p ? { ...p, blocked: true } : p)))
    }
    setLate(null)
    setPrayer({ id: late.id, label: `${late.time} · ${late.title}`, resume: playing, blocked: false })
  }
  const closeLate = () => {
    if (late && late.key !== 'preview') try { localStorage.setItem('cmp-late-closed', late.key) } catch {}
    setLate(null)
  }

  // When a prayer is set, play it; if the browser blocks sound (no tap yet), show a button.
  useEffect(() => {
    if (!prayer || prayer.blocked || !audio.current) return
    if (startedBy.current === prayer.id) { startedBy.current = null; return } // already started by the tap
    const a = audio.current
    unlocking.current = false
    setMute(a, muted)
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
  const lateBanner = late && !prayer ? (
    <div role="status" className="fixed inset-x-0 bottom-[76px] z-40 px-4 sm:bottom-[72px]">
      <div className="mx-auto flex max-w-[640px] flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border-2 border-gold bg-navy px-5 py-3 text-navy-ink shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        <span className="min-w-0 flex-1 basis-60 text-[15px]">🔔 <strong>{late.title}</strong> was prayed at {late.time} ({late.ago} minutes ago). Pray it with us now?</span>
        <button type="button" onClick={prayLate} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-gold px-4 font-bold text-[#1f2430]"><PlayIcon size={16} /> Pray it now</button>
        <PrayerReminders tone="dark" onlyOffer />
        <button type="button" onClick={closeLate} aria-label="Close" className="flex size-10 items-center justify-center rounded-full text-navy-muted">✕</button>
      </div>
    </div>
  ) : null
  const blockedBanner = prayer?.blocked && prayerTrack ? (
    <div role="alert" className="fixed inset-x-0 bottom-[76px] z-40 px-4 sm:bottom-[72px]">
      <div className="mx-auto flex max-w-[640px] flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border-2 border-gold bg-navy px-5 py-3 text-navy-ink shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        <span className="min-w-0 flex-1 basis-60 text-[15px]">🔔 It is time to pray: <strong>{prayer.label}</strong></span>
        <button type="button" onClick={play} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-gold px-4 font-bold text-[#1f2430]"><PlayIcon size={16} /> Pray now</button>
        <PrayerReminders tone="dark" onlyOffer />
        <button type="button" onClick={() => setPrayer(null)} aria-label="Close" className="flex size-10 items-center justify-center rounded-full text-navy-muted">✕</button>
      </div>
    </div>
  ) : null
  const extraTrack = extra ? byId.get(extra) : undefined
  const t: Track | undefined = prayerTrack ?? extraTrack ?? tracks[i]
  // Keep the player on the current item. Set here by code (not as a React prop), so a tap that has
  // already started a prayer is never cut off by a re-render. Runs before any queued play().
  useLayoutEffect(() => { if (t?.src) loadSrc(t.src) }, [t?.src])
  const step = (d: number) => {
    if (prayer) { setPrayer(null); setTimeout(() => { if (playing) play() }, 0); return }
    if (tracks.length > 1 && !extraTrack) {
      setI((i + d + tracks.length) % tracks.length)
    } else if (rotation.length > 1) {
      // Only one item scheduled: go through all the audio, so Next always brings something different.
      const at = Math.max(0, rotation.findIndex((x) => x.id === t?.id))
      setExtra(rotation[(at + d + rotation.length) % rotation.length].id)
    }
    setTimeout(() => { if (playing) play() }, 0)
  }
  const ended = () => {
    if (prayer) {
      resumeAfter.current = prayer.resume && tracks.length > 0
      setPrayer(null)
      setPlaying(false)
      return
    }
    // Carry on to the next different item; at the end of the list, stop. Nothing repeats by itself.
    if (extraTrack) {
      const at = rotation.findIndex((x) => x.id === extraTrack.id)
      if (at >= 0 && at + 1 < rotation.length) { setExtra(rotation[at + 1].id); setTimeout(play, 0) }
      else setPlaying(false)
      return
    }
    if (i + 1 < tracks.length) { setI(i + 1); setTimeout(play, 0) }
    else setPlaying(false)
  }

  const audioEl = (
    <audio
      ref={audio}
      preload="none"
      controlsList="nodownload noplaybackrate"
      onContextMenu={(e) => e.preventDefault()}
      onEnded={ended}
      onError={() => { if (audio.current?.dataset.src) setLoadError(true) }}
    />
  )
  if (!t) return <>{audioEl}{lateBanner}</>

  return (
    <>
    {audioEl}
    {lateBanner}
    {blockedBanner}
    <div data-music-bar role="region" aria-label="Music player" className="sticky bottom-0 z-40 border-t-2 border-gold bg-navy px-5 py-2.5 text-navy-ink shadow-[0_-4px_16px_rgba(0,0,0,0.15)]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex min-w-0 flex-1 basis-60 items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-[#3a4050]">
            {t.cover && <Image src={t.cover} alt="" fill sizes="44px" className="object-cover" />}
          </div>
          <div className="min-w-0">
            <a href={`/audio/${t.slug}`} className="block truncate font-semibold text-navy-ink no-underline">{t.title}</a>
            <div className="text-[13px] text-navy-muted">{loadError ? 'This recording could not be loaded. Please try again later.' : prayer ? `${prayer.label}${prayer.blocked ? ' · tap play to pray along' : ''}` : 'Catholic My Pride'}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Previous" onClick={() => step(-1)} className="flex size-11 items-center justify-center rounded-full text-navy-ink"><PrevIcon /></button>
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
          <button type="button" aria-label="Next" onClick={() => step(1)} className="flex size-11 items-center justify-center rounded-full text-navy-ink"><NextIcon /></button>
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
    </>
  )
}
