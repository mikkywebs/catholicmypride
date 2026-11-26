'use client'

import { useEffect, useState } from 'react'
import { OFFLINE_SVG } from './offline-art'

/**
 * Registers the offline helper (public/sw.js), and shows a full-screen notice if the connection drops
 * while someone is on the site. The notice goes away by itself when the internet is back.
 */
export function OfflineGuard() {
  const [offline, setOffline] = useState(false)
  useEffect(() => {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('/sw.js').catch(() => {})
    const off = () => setOffline(true)
    const on = () => setOffline(false)
    const t = setTimeout(() => setOffline(!navigator.onLine), 0)
    addEventListener('offline', off)
    addEventListener('online', on)
    return () => { clearTimeout(t); removeEventListener('offline', off); removeEventListener('online', on) }
  }, [])
  if (!offline) return null
  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="offline-title" className="fixed inset-0 z-[100] grid place-items-center bg-bg/95 p-6 text-center backdrop-blur-sm">
      <div className="flex max-w-[440px] flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Catholic My Pride" className="size-20 rounded-full opacity-85 grayscale" />
        <div className="w-[min(320px,86vw)] text-[#9a9da3] [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: OFFLINE_SVG }} />
        <h2 id="offline-title" className="m-0 font-serif text-[36px] font-semibold">You’re offline</h2>
        <p className="m-0 text-[17px] text-muted">Please check your internet connection. Turn on mobile data or Wi-Fi, or turn off airplane mode.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => location.reload()} className="rounded-lg bg-ink px-6 py-3 font-semibold text-bg">Try again</button>
          <button type="button" onClick={() => setOffline(false)} className="rounded-lg border border-line px-5 py-3 font-semibold text-muted">Keep reading</button>
        </div>
        <p className="m-0 text-[13px] text-muted">This message goes away by itself when you’re back online.</p>
      </div>
    </div>
  )
}
