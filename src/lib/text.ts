// Small text helpers that are safe to use in the browser (no heavy libraries).

export function slugify(s: string) {
  return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://catholicmypride.org'

/** Matches the database rule: web addresses are not allowed in prayer requests. */
export const LINK_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|org|net|ng|io|co|info|xyz|ly|me|uk|app|link)\b)/i
