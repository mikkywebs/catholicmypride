import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AddParishForm } from '@/components/add-parish-form'
import { Breadcrumb } from '@/components/ui'
import { getChurches, getDioceses, getSettings } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Add Your Parish to the Catholic Parish Finder',
  description: 'Add your Catholic parish, its address and Mass times to the Catholic My Pride parish finder, or send an update for a parish already listed.',
  alternates: { canonical: '/churches/add' },
}

export default function Page(props: PageProps<'/churches/add'>) {
  return <Suspense fallback={<div className="h-96" />}><Content searchParams={props.searchParams} /></Suspense>
}

async function Content({ searchParams }: { searchParams: PageProps<'/churches/add'>['searchParams'] }) {
  const sp = await searchParams
  const [dioceses, churches, settings] = await Promise.all([getDioceses(), getChurches(), getSettings()])
  const church = typeof sp.update === 'string' ? churches.find((c) => c.id === sp.update) ?? null : null
  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-6 px-6 pb-[72px] pt-8">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Parish Directory', href: '/churches' }, { label: church ? 'Update a parish' : 'Add your parish' }]} />
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-serif text-[36px] font-semibold leading-tight sm:text-[46px]">{church ? `Update: ${church.name}` : 'Add your parish'}</h1>
        <p className="m-0 text-[17px] text-muted">{church ? 'Correct anything that is wrong or missing, such as the Mass times or the address. We check every update before it appears.' : 'Help Catholics find Mass wherever they are. Tell us about your parish; we check every entry before it appears on the website.'}</p>
      </div>
      <AddParishForm dioceses={dioceses.map(({ id, name, kind, country, deaneries }) => ({ id, name, kind, country, deaneries }))} church={church} initialCountry={typeof sp.country === 'string' ? sp.country : undefined} initialDiocese={typeof sp.diocese === 'string' ? sp.diocese : undefined} contactEmail={settings.contact_email} />
    </div>
  )
}
