'use client'

import { useState } from 'react'

const b64url = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

export function KeyMaker() {
  const [keys, setKeys] = useState<{ pub: string; priv: string } | null>(null)
  const [copied, setCopied] = useState('')
  const make = async () => {
    const pair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
    const pub = b64url(await crypto.subtle.exportKey('raw', pair.publicKey))
    const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey)
    setKeys({ pub, priv: jwk.d ?? '' })
  }
  const copy = async (label: string, v: string) => { await navigator.clipboard.writeText(v); setCopied(label); setTimeout(() => setCopied(''), 2000) }
  if (!keys) return <button type="button" onClick={make} className="self-start rounded-md bg-accent px-5 py-2.5 font-semibold text-accent-ink">Make my keys</button>
  return (
    <div className="flex flex-col gap-3">
      {([['Public key', 'NEXT_PUBLIC_VAPID_PUBLIC_KEY', keys.pub], ['Private key', 'VAPID_PRIVATE_KEY', keys.priv]] as const).map(([label, name, v]) => (
        <div key={name} className="flex flex-col gap-1 rounded-xl border border-line bg-surface p-3">
          <span className="text-[14px] font-semibold">{label} → <code>{name}</code></span>
          <code className="break-all text-[13px]">{v}</code>
          <button type="button" onClick={() => copy(label, v)} className="self-start rounded-md border border-field px-3 py-1.5 text-sm font-semibold">{copied === label ? 'Copied ✓' : `Copy ${label.toLowerCase()}`}</button>
        </div>
      ))}
      <p className="m-0 text-[14px] text-muted">Keep this page open until both are in Vercel. If you leave, just make a new pair. Never share the private key.</p>
    </div>
  )
}
