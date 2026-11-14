import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'

/** Markdown written by the admin, rendered to safe HTML. */
export function md(text: string | null | undefined) {
  if (!text) return ''
  const html = marked.parse(text, { async: false, breaks: true }) as string
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'figure', 'figcaption']),
    allowedAttributes: { a: ['href', 'title', 'target', 'rel'], img: ['src', 'alt', 'title', 'width', 'height', 'loading'] },
    transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }) },
  })
}

export function readMinutes(...texts: (string | null | undefined)[]) {
  const words = texts.join(' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function duration(seconds: number | null | undefined) {
  if (!seconds || seconds < 1) return null
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function slugify(s: string) {
  return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

export function dateLabel(iso: string | null | undefined) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://catholicmypride.org'

/** Matches the database rule: web addresses are not allowed in prayer requests. */
export const LINK_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|org|net|ng|io|co|info|xyz|ly|me|uk|app|link)\b)/i
