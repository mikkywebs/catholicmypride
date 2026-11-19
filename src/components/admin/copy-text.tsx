'use client'

import { useState } from 'react'

/** Shows the message and copies it in one tap. */
export function CopyText({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2500) } catch { setDone(false) }
  }
  return (
    <div className="flex flex-col gap-3">
      <textarea readOnly value={text} rows={Math.min(28, text.split('\n').length + 1)} className="w-full resize-y rounded-xl border border-field bg-surface p-4 font-mono text-[14px] leading-relaxed text-ink" onFocus={(e) => e.currentTarget.select()} />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={copy} className="rounded-md bg-[#25D366] px-5 py-2.5 font-semibold text-[#0b3d1f]">{done ? 'Copied ✓' : 'Copy message'}</button>
        <span className="text-sm text-muted">Then open your channel in WhatsApp, paste and send.</span>
      </div>
    </div>
  )
}
