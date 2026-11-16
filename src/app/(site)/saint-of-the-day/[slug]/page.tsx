import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { SaintView } from '@/components/saint-view'
import { getSaint, getSaintsAround, getSaintsForDate, getSettings } from '@/lib/data'

export async function generateMetadata({ params }: PageProps<'/saint-of-the-day/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const saint = await getSaint(slug)
  if (!saint) return {}
  const title = saint.seo_title || `${saint.name}: Life, Patronage and Prayer`
  const description = saint.seo_description || `The life story of ${saint.name}${saint.patronage.length ? `, patron of ${saint.patronage.join(', ')}` : ''}, with a prayer.`
  return { title, description, alternates: { canonical: `/saint-of-the-day/${slug}` }, openGraph: { title, description, images: saint.featured_image ? [saint.featured_image] : undefined } }
}

export default function Page(props: PageProps<'/saint-of-the-day/[slug]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content params={props.params} /></Suspense>
}

async function Content({ params }: { params: PageProps<'/saint-of-the-day/[slug]'>['params'] }) {
  const { slug } = await params
  const saint = await getSaint(slug)
  if (!saint) notFound()
  const [s, week, all] = await Promise.all([getSettings(), getSaintsAround(saint.show_on ?? '9999-12-31'), saint.show_on ? getSaintsForDate(saint.show_on) : Promise.resolve([])])
  return <SaintView saint={saint} s={s} week={week} others={all.filter((o) => o.slug !== saint.slug)} />
}
