// Small text helpers that are safe to use in the browser (no heavy libraries).

export function slugify(s: string) {
  return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

/** True for youtube.com / youtu.be addresses only. */
export function isYouTubeUrl(u: string) {
  try {
    const h = new URL(u).hostname.replace(/^www\.|^m\./, '')
    return h === 'youtube.com' || h === 'youtu.be' || h === 'music.youtube.com'
  } catch {
    return false
  }
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://catholicmypride.org'

/** Matches the database rule: web addresses are not allowed in prayer requests. */
export const LINK_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|org|net|ng|io|co|info|xyz|ly|me|uk|app|link)\b)/i
