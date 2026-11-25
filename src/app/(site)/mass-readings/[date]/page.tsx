import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ReadingView } from '@/components/reading-view'
import { getHomeImages, getReading, getSettings } from '@/lib/data'
import { readingImage } from '@/lib/reading-image'
import { formatLong } from '@/lib/liturgical'

const valid = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d)

export async function generateMetadata({ params }: PageProps<'/mass-readings/[date]'>): Promise<Metadata> {
  const { date } = await params
  if (!valid(date)) return {}
  const [r, images, s] = await Promise.all([getReading(date), getHomeImages(), getSettings()])
  const pic = readingImage(date, r, images, { url: s.default_reading_image })
  const title = r?.seo_title || `Mass Readings for ${formatLong(date)}, Reflection`
  const description = r?.seo_description || [r?.title, r?.first_ref && `First Reading ${r.first_ref}`, r?.psalm_ref && `Psalm ${r.psalm_ref}`, r?.gospel_ref && `Gospel ${r.gospel_ref}`].filter(Boolean).join('. ')
  return {
    title, description,
    alternates: { canonical: `/mass-readings/${date}` },
    openGraph: { title, description, type: 'article', images: pic.url ? [pic.url] : undefined },
  }
}

export default function Page({ params }: PageProps<'/mass-readings/[date]'>) {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <Content params={params} />
    </Suspense>
  )
}

async function Content({ params }: { params: PageProps<'/mass-readings/[date]'>['params'] }) {
  const { date } = await params
  if (!valid(date)) notFound()
  const [r, s] = await Promise.all([getReading(date), getSettings()])
  if (!r) notFound()
  return <ReadingView r={r} s={s} />
}
