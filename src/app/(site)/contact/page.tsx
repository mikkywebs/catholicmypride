import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ContactForm } from '@/components/contact-form'
import { Eyebrow, H1 } from '@/components/ui'
import { getSettings } from '@/lib/data'

export const metadata: Metadata = { title: 'Contact us', description: 'Get in touch with the Catholic My Pride apostolate.', alternates: { canonical: '/contact' } }

export default async function Page(props: PageProps<'/contact'>) {
  const s = await getSettings()
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-6 pb-[72px] pt-10">
      <div className="text-center">
        <Eyebrow>Contact us</Eyebrow>
        <H1 className="mt-2">We&apos;d love to hear from you</H1>
        <p className="mt-3 text-muted">For prayer intentions, please use the <a href="/prayer-requests">Prayer Requests</a> page.</p>
      </div>
      <div className="flex flex-wrap items-start gap-7">
        <Suspense fallback={<ContactForm />}><FormWithSubject searchParams={props.searchParams} /></Suspense>
        <aside className="flex flex-1 basis-72 flex-col gap-4">
          <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-6">
            {s.contact_email && <div><strong>Email</strong><p className="m-0 mt-0.5"><a href={`mailto:${s.contact_email}`}>{s.contact_email}</a></p></div>}
            {s.contact_phone && <div><strong>Phone / WhatsApp</strong><p className="m-0 mt-0.5 text-muted">{s.contact_phone}</p></div>}
            {s.contact_address && <div><strong>Address</strong><p className="m-0 mt-0.5 whitespace-pre-line text-muted">{s.contact_address}</p></div>}
          </div>
          <div className="rounded-2xl bg-sky px-6 py-5 text-body">We usually reply within 2 working days.</div>
        </aside>
      </div>
    </div>
  )
}

async function FormWithSubject({ searchParams }: { searchParams: PageProps<'/contact'>['searchParams'] }) {
  const sp = await searchParams
  return <ContactForm subject={typeof sp.subject === 'string' ? sp.subject : undefined} />
}
