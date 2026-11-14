'use client'

import { useActionState } from 'react'
import { sendContactMessage, type ContactState } from '@/app/actions'

const field = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 py-2.5 text-ink'
const SUBJECTS = ['General enquiry', 'Suggest a church', 'Ebooks', 'Partnership', 'Report a problem']

export function ContactForm({ subject }: { subject?: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactMessage, null)
  if (state?.ok) return <div role="status" className="flex-[2] basis-[460px] rounded-2xl border border-line bg-surface p-9 text-lg">{state.message}</div>
  return (
    <form action={action} className="flex flex-[2] basis-[460px] flex-col gap-4 rounded-2xl border border-line bg-surface p-7 sm:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-1 basis-52 flex-col gap-1.5 text-sm font-semibold">Name<input name="name" required maxLength={80} className={field} /></label>
        <label className="flex flex-1 basis-52 flex-col gap-1.5 text-sm font-semibold">Email<input name="email" type="email" required className={field} /></label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Subject
        <select name="subject" defaultValue={SUBJECTS.includes(subject ?? '') ? subject : SUBJECTS[0]} className={field}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Message<textarea name="message" rows={6} required maxLength={4000} className={`${field} resize-y`} /></label>
      {state && !state.ok && <p role="alert" className="m-0 text-sm font-semibold text-[#b42318] dark:text-[#ff8a7a]">{state.message}</p>}
      <button type="submit" disabled={pending} className="min-h-12 self-start rounded-md bg-accent px-6 font-semibold text-accent-ink disabled:opacity-50">{pending ? 'Sending…' : 'Send message'}</button>
    </form>
  )
}
