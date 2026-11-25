import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
export { slugify, SITE_URL, LINK_PATTERN } from './text'

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

export type Source = { title: string; url: string; host: string }

/** References typed one per line as “Title | link”, “[Title](link)” or just a link. Only web links are kept. */
export function parseSources(text: string | null | undefined): Source[] {
  const out: Source[] = []
  for (const raw of (text ?? '').split(/\r?\n/)) {
    const line = raw.trim().replace(/^[-*•\d.)\s]+(?=\S)/, '')
    if (!line) continue
    const md = line.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/)
    const rawUrl = md?.[2] ?? line.match(/https?:\/\/\S+/)?.[0]
    const url = rawUrl?.replace(/[.,;)]+$/, '')
    if (!url || !rawUrl) continue
    let host = ''
    try { host = new URL(url).hostname.replace(/^www\./, '') } catch { continue }
    const title = (md?.[1] ?? line.replace(rawUrl, '').replace(/[|–—:\-\s]+$/, '').replace(/^[|–—:\-\s]+/, '')).trim()
    out.push({ title: title || host, url, host })
  }
  return out
}

export type TocItem = { id: string; text: string; level: 2 | 3 }

const decode = (t: string) => t.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, '’').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim()

/** Like md(), but gives every ## and ### heading an anchor and returns the list, for a table of contents. */
export function mdWithToc(text: string | null | undefined): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = []
  const used = new Map<string, number>()
  const html = md(text).replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_m, lvl: string, inner: string) => {
    const label = decode(inner)
    const base = label.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'section'
    const n = used.get(base) ?? 0
    used.set(base, n + 1)
    const id = n ? `${base}-${n + 1}` : base
    toc.push({ id, text: label, level: Number(lvl) as 2 | 3 })
    return `<h${lvl} id="${id}">${inner}</h${lvl}>`
  })
  return { html, toc }
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


export function dateLabel(iso: string | null | undefined) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}


