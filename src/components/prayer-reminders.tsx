'use client'

import { useEffect, useState } from 'react'

// "Remind me at prayer times": turns on phone notifications for the timed prayers
// (Angelus, Prayer for the Holy Father, Divine Mercy…), sent on the visitor's own clock.

type State = 'loading' | 'hidden' | 'ios-install' | 'off' | 'on' | 'denied' | 'busy' | 'error'

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function keyBytes(b64: string) {
  const s = (b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(s)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

async function registration() {
  return (await navigator.serviceWorker.getRegistration()) ?? navigator.serviceWorker.register('/sw.js')
}

export function PrayerReminders({ tone = 'light', onlyOffer = false }: { tone?: 'light' | 'dark'; onlyOffer?: boolean }) {
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    let cancelled = false
    const set = (s: State) => { if (!cancelled) setState(s) }
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
    if (!KEY) return set('hidden')
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return set(ios && !standalone ? 'ios-install' : 'hidden')
    if (Notification.permission === 'denied') return set('denied')
    registration().then((r) => r.pushManager.getSubscription()).then((sub) => set(sub ? 'on' : 'off')).catch(() => set('off'))
    return () => { cancelled = true }
  }, [])

  const turnOn = async () => {
    setState('busy')
    try {
      if ((await Notification.requestPermission()) !== 'granted') return setState('denied')
      const reg = await registration()
      await navigator.serviceWorker.ready
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(KEY) }))
      const res = await fetch('/api/push/subscribe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...sub.toJSON(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone }) })
      setState(res.ok ? 'on' : 'error')
    } catch { setState('error') }
  }

  const turnOff = async () => {
    setState('busy')
    try {
      const sub = await (await registration()).pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) })
        await sub.unsubscribe()
      }
      setState('off')
    } catch { setState('error') }
  }

  if (state === 'loading' || state === 'hidden') return null
  // In the prayer banners, only offer the button (no status lines).
  if (onlyOffer && state !== 'off' && state !== 'busy' && state !== 'error') return null
  const muted = tone === 'dark' ? 'text-navy-muted' : 'text-muted'
  const btn = 'inline-flex min-h-11 items-center gap-2 rounded-md px-4 font-bold'
  if (state === 'ios-install') return <p className={`m-0 text-[14px] ${muted}`}>🔔 Prayer-time reminders on iPhone: tap <strong>Share</strong> → <strong>Add to Home Screen</strong>, then open the site from your Home Screen.</p>
  if (state === 'denied') return <p className={`m-0 text-[14px] ${muted}`}>🔔 Reminders are blocked for this site. Allow notifications in your browser settings to turn them on.</p>
  if (state === 'on') return (
    <span className={`inline-flex flex-wrap items-center gap-2 text-[14px] ${muted}`}>
      🔔 Prayer-time reminders are on for this device.
      <button type="button" onClick={turnOff} className="underline">Turn off</button>
    </span>
  )
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button type="button" onClick={turnOn} disabled={state === 'busy'} className={`${btn} bg-gold text-[#1f2430] disabled:opacity-60`}>🔔 Remind me at prayer times</button>
      {state === 'error' && <span className={`text-[14px] ${muted}`}>That didn’t work. Please try again.</span>}
    </span>
  )
}
