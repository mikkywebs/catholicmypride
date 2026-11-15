import { siApplemusic, siApplepodcasts, siAudiomack, siBluesky, siDiscord, siFacebook, siGoogleplay, siInstagram, siKick, siLinktree, siPatreon, siPinterest, siReddit, siRumble, siSnapchat, siSoundcloud, siSpotify, siSubstack, siTelegram, siThreads, siTiktok, siTwitch, siVimeo, siWhatsapp, siX, siYoutube } from 'simple-icons'

type SI = { path: string; title: string; hex: string }

export function BrandIcon({ icon, size = 20, color }: { icon: SI; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color ?? `#${icon.hex}`} aria-hidden="true">
      <path d={icon.path} />
    </svg>
  )
}

export const BRANDS = { youtube: siYoutube, facebook: siFacebook, tiktok: siTiktok, x: siX, whatsapp: siWhatsapp, telegram: siTelegram }

/** Logos for extra social links, keyed by detectPlatform(). Dark logos use the text colour. */
export const EXTRA_BRANDS: Record<string, { icon: SI; mono?: boolean }> = {
  instagram: { icon: siInstagram }, whatsapp: { icon: siWhatsapp }, telegram: { icon: siTelegram }, threads: { icon: siThreads, mono: true },
  pinterest: { icon: siPinterest }, spotify: { icon: siSpotify }, applemusic: { icon: siApplemusic }, applepodcasts: { icon: siApplepodcasts },
  soundcloud: { icon: siSoundcloud }, audiomack: { icon: siAudiomack }, snapchat: { icon: siSnapchat, mono: true }, reddit: { icon: siReddit },
  discord: { icon: siDiscord }, twitch: { icon: siTwitch }, substack: { icon: siSubstack }, patreon: { icon: siPatreon, mono: true },
  bluesky: { icon: siBluesky }, rumble: { icon: siRumble }, vimeo: { icon: siVimeo }, linktree: { icon: siLinktree }, googleplay: { icon: siGoogleplay }, kick: { icon: siKick },
}


type P = { size?: number; className?: string }
const base = (size = 18) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true })

export const PlayIcon = ({ size = 18 }: P) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
export const PauseIcon = ({ size = 18 }: P) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
export const PrevIcon = ({ size = 18 }: P) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z" /></svg>
export const NextIcon = ({ size = 18 }: P) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z" /></svg>
export const DownloadIcon = ({ size }: P) => <svg {...base(size)}><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></svg>
export const ChevronDown = ({ size = 14 }: P) => <svg {...base(size)} strokeWidth={2.4}><path d="M6 9l6 6 6-6" /></svg>
export const SunIcon = ({ size = 20 }: P) => <svg {...base(size)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
export const MoonIcon = ({ size = 20 }: P) => <svg {...base(size)}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
export const EyeIcon = ({ size = 16 }: P) => <svg {...base(size)}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
export const ClockIcon = ({ size = 16 }: P) => <svg {...base(size)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
export const LinkIcon = ({ size = 16 }: P) => <svg {...base(size)}><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>
export const MailIcon = ({ size = 16 }: P) => <svg {...base(size)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
export const ArrowUp = ({ size = 22 }: P) => <svg {...base(size)} strokeWidth={2.4}><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></svg>
export const HeartIcon = ({ size = 16 }: P) => <svg {...base(size)}><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.5 12 21 12 21z" /></svg>
export const ChurchIcon = ({ size = 22 }: P) => <svg {...base(size)} strokeWidth={1.8}><path d="M12 2v6M9 5h6" /><path d="M5 22V12l7-4 7 4v10" /><path d="M10 22v-5h4v5" /></svg>
export const MenuIcon = ({ size = 24 }: P) => <svg {...base(size)}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
export const CloseIcon = ({ size = 24 }: P) => <svg {...base(size)}><path d="M6 6l12 12M18 6L6 18" /></svg>
export const VolumeIcon = ({ size = 20, muted }: P & { muted?: boolean }) => (
  <svg {...base(size)}>
    <path d="M11 5L6 9H3v6h3l5 4z" />
    {muted ? <path d="M23 9l-6 6M17 9l6 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />}
  </svg>
)
