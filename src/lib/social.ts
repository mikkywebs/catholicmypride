// Browser-safe: works out which platform a link belongs to.
export type SocialLink = { label: string; url: string }

const PLATFORMS: [RegExp, string, string][] = [
  [/(^|\.)instagram\.com$/, 'instagram', 'Instagram'],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, 'whatsapp', 'WhatsApp'],
  [/(^|\.)(t\.me|telegram\.me|telegram\.org)$/, 'telegram', 'Telegram'],
  [/(^|\.)threads\.(net|com)$/, 'threads', 'Threads'],
  [/(^|\.)pinterest\.[a-z.]+$/, 'pinterest', 'Pinterest'],
  [/(^|\.)spotify\.com$/, 'spotify', 'Spotify'],
  [/(^|\.)music\.apple\.com$/, 'applemusic', 'Apple Music'],
  [/(^|\.)podcasts\.apple\.com$/, 'applepodcasts', 'Apple Podcasts'],
  [/(^|\.)soundcloud\.com$/, 'soundcloud', 'SoundCloud'],
  [/(^|\.)audiomack\.com$/, 'audiomack', 'Audiomack'],
  [/(^|\.)snapchat\.com$/, 'snapchat', 'Snapchat'],
  [/(^|\.)reddit\.com$/, 'reddit', 'Reddit'],
  [/(^|\.)(discord\.gg|discord\.com)$/, 'discord', 'Discord'],
  [/(^|\.)twitch\.tv$/, 'twitch', 'Twitch'],
  [/(^|\.)substack\.com$/, 'substack', 'Substack'],
  [/(^|\.)patreon\.com$/, 'patreon', 'Patreon'],
  [/(^|\.)bsky\.app$/, 'bluesky', 'Bluesky'],
  [/(^|\.)rumble\.com$/, 'rumble', 'Rumble'],
  [/(^|\.)vimeo\.com$/, 'vimeo', 'Vimeo'],
  [/(^|\.)linktr\.ee$/, 'linktree', 'Linktree'],
  [/(^|\.)play\.google\.com$/, 'googleplay', 'Google Play'],
  [/(^|\.)kick\.com$/, 'kick', 'Kick'],
]

export function detectPlatform(url: string): { key: string | null; name: string | null } {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
    const hit = PLATFORMS.find(([re]) => re.test(host))
    return hit ? { key: hit[1], name: hit[2] } : { key: null, name: null }
  } catch {
    return { key: null, name: null }
  }
}
