import { ShareBar, ViewCount } from './engage'
import { SITE_URL } from '@/lib/format'

/** Structured data so Google understands each page. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}

export function articleLd(o: { title: string; description?: string | null; image?: string | null; path: string; published?: string | null; modified?: string | null; author?: string | null }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: o.title,
    description: o.description ?? undefined,
    image: o.image ? [o.image] : undefined,
    mainEntityOfPage: `${SITE_URL}${o.path}`,
    datePublished: o.published ?? undefined,
    dateModified: o.modified ?? o.published ?? undefined,
    author: { '@type': 'Organization', name: o.author || 'Catholic My Pride' },
    publisher: { '@type': 'Organization', name: 'Catholic My Pride', logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` } },
  }
}

export function Share({ title }: { title: string }) {
  return <ShareBar title={title} />
}

export { ViewCount }
