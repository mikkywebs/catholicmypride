'use client'

import { useSyncExternalStore } from 'react'
import { MoonIcon, SunIcon } from './icons'

/** Runs before first paint: follows the device setting unless the visitor chose a theme. */
export const themeScript = `(function(){try{var t=localStorage.getItem('cmp-theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => obs.disconnect()
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains('dark'), () => false)
  const toggle = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('cmp-theme', next ? 'dark' : 'light') } catch {}
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to day mode' : 'Switch to dark mode'}
      title={dark ? 'Day mode' : 'Dark mode'}
      className="flex size-11 items-center justify-center rounded-full border border-line text-ink"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
