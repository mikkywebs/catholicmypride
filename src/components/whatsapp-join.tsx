'use client'

import { BrandIcon, BRANDS } from './icons'
import { markJoined } from './milestone'

type Links = { whatsapp_channel_url?: string | null; youtube_url?: string | null; facebook_url?: string | null; x_url?: string | null }

/**
 * “Stay connected” box after prayers, audio, blog posts and the quiz: our WhatsApp Channel,
 * plus YouTube, Facebook and X. Each part shows only when its link is set in Settings.
 */
export function StayConnected({ s }: { s: Links }) {
  const follow = [
    s.youtube_url && { name: 'YouTube', cta: 'Subscribe on YouTube', url: s.youtube_url, icon: BRANDS.youtube, color: undefined, key: 'yt' },
    s.facebook_url && { name: 'Facebook', cta: 'Follow on Facebook', url: s.facebook_url, icon: BRANDS.facebook, color: undefined, key: 'fb' },
    s.x_url && { name: 'X', cta: 'Follow on X', url: s.x_url, icon: BRANDS.x, color: 'currentColor', key: 'x' },
  ].filter(Boolean) as { name: string; cta: string; url: string; icon: typeof BRANDS.x; color?: string; key: string }[]
  if (!s.whatsapp_channel_url && !follow.length) return null
  return (
    <aside aria-label="Stay connected with Catholic My Pride" className="reveal flex flex-col gap-4 rounded-2xl border border-line bg-surface px-5 py-5 sm:px-6">
      {s.whatsapp_channel_url && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-5 text-center">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"><BrandIcon icon={BRANDS.whatsapp} size={26} color="#ffffff" /></span>
          <div className="flex max-w-[520px] flex-col items-center gap-1">
            <strong className="text-lg leading-snug">Join our WhatsApp Channel</strong>
            <span className="text-[15px] text-muted">Get the Mass readings, the saint or feast of the day, the Rosary and a daily prayer on your phone every morning.</span>
          </div>
          <a href={s.whatsapp_channel_url} target="_blank" rel="noopener noreferrer" onClick={() => markJoined('cmp-joined-whatsapp')} className="rounded-md bg-[#25D366] px-5 py-2.5 font-semibold text-[#0b3d1f] no-underline hover:text-[#0b3d1f]">Join the channel</a>
        </div>
      )}
      {follow.length > 0 && (
        <div className="flex flex-col items-center gap-2.5 text-center">
          <p className="m-0 font-semibold">Follow Catholic My Pride for videos, prayers and daily inspiration</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {follow.map((f) => (
              <a key={f.key} href={f.url} target="_blank" rel="noopener noreferrer" onClick={f.key === 'yt' ? () => markJoined('cmp-followed-youtube') : undefined}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-bg px-4 font-semibold text-ink no-underline hover:border-ink hover:text-ink">
                <BrandIcon icon={f.icon} size={18} color={f.color} /> {f.cta}
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

/** Older name, kept so existing pages keep working. */
export function WhatsAppJoin({ url }: { url: string | null | undefined }) {
  return <StayConnected s={{ whatsapp_channel_url: url }} />
}
