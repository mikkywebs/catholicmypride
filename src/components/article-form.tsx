'use client'

import { useActionState, useState } from 'react'
import { submitArticle, type SubmitState } from '@/app/(site)/write-for-us/actions'
import { LINK_PATTERN } from '@/lib/text'
import { CountryPicker } from './prayer-form'

const field = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 py-2.5 text-ink'
const MIN = 400
const MAX = 2500
const count = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

export function ArticleForm() {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitArticle, null)
  const [body, setBody] = useState('')
  const [sources, setSources] = useState('')
  const n = count(body)
  const hasLink = LINK_PATTERN.test(body) || LINK_PATTERN.test(sources)

  if (state?.ok) {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-8 text-lg">
        <p className="m-0 font-serif text-[28px] font-semibold">🙏 Article received</p>
        <p className="m-0">{state.message}</p>
      </div>
    )
  }

  const err = (f: string) => (state && !state.ok && state.field === f ? <p role="alert" className="m-0 text-sm font-semibold text-[#b42318]">{state.message}</p> : null)
  const tooShort = n > 0 && n < MIN
  const tooLong = n > MAX

  return (
    <form action={action} className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6 sm:p-9">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <h2 className="m-0 font-serif text-[30px] font-semibold">Send your article</h2>

      <div className="flex flex-wrap gap-4">
        <label className="flex flex-1 basis-52 flex-col gap-1.5 text-sm font-semibold">Your name (shown on the article)
          <input name="name" required maxLength={80} autoComplete="name" className={field} />
        </label>
        <CountryPicker id="art-country" required label="Your country (shown on the article)" />
      </div>
      {err('name')}{err('country')}
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Email (private, never shown)
        <input name="email" type="email" required maxLength={120} autoComplete="email" className={field} />
        <span className="text-[13px] font-normal text-muted">We only use it to tell you whether your article was accepted, or to ask you a question.</span>
      </label>
      {err('email')}

      <label className="flex flex-col gap-1.5 text-sm font-semibold">Title
        <input name="title" required minLength={10} maxLength={150} className={field} />
      </label>
      {err('title')}

      <label className="flex flex-col gap-1.5 text-sm font-semibold">Your article
        <textarea name="body" required rows={18} value={body} onChange={(e) => setBody(e.target.value)} className={`${field} resize-y leading-relaxed`} />
        <span className={`text-[13px] font-normal ${tooShort || tooLong ? 'text-[#b42318]' : 'text-muted'}`} aria-live="polite">
          {n} words · between {MIN} and {MAX}. Leave an empty line between paragraphs. You can quote Scripture or the Catechism.
        </span>
      </label>
      {err('body')}

      <label className="flex flex-col gap-1.5 text-sm font-semibold">Sources (optional)
        <textarea name="sources" rows={4} maxLength={3000} value={sources} onChange={(e) => setSources(e.target.value)} placeholder={'For example:\nCatechism of the Catholic Church, 1324\nPope Benedict XVI, Deus Caritas Est (2005), 12'} className={`${field} resize-y`} />
        <span className="text-[13px] font-normal text-muted">Write each source as plain text: the book or document, and where the fact is found. No links, please.</span>
      </label>
      {err('sources')}
      {hasLink && <p role="alert" className="m-0 rounded-lg bg-[#fdecea] px-4 py-3 text-sm font-semibold text-[#8c1d18]">Please remove the link or web address. Articles cannot contain links; give the source as plain text instead.</p>}

      <label className="flex flex-col gap-1.5 text-sm font-semibold">About you (optional, up to 300 characters)
        <textarea name="about" rows={2} maxLength={300} placeholder="e.g. Catechist and mother of three, parishioner of St Joseph’s." className={`${field} resize-y`} />
      </label>
      {err('about')}

      <fieldset className="m-0 flex flex-col gap-2.5 rounded-xl border border-line p-4">
        <legend className="px-1 text-sm font-semibold">Please confirm</legend>
        {[
          ['c_original', 'This article is my own work. I have not copied it from anyone else or written it with an AI tool.'],
          ['c_unpublished', 'It has not been published anywhere else, online or in print.'],
          ['c_review', 'Catholic My Pride may edit it lightly, publish it, or decline it.'],
          ['c_public', 'My name and country may be shown with the article. My email stays private.'],
        ].map(([n, t]) => (
          <label key={n} className="flex items-start gap-2.5 text-[15px]"><input type="checkbox" name={n} required className="mt-1 size-4 shrink-0 accent-[var(--accent)]" />{t}</label>
        ))}
      </fieldset>
      {err('c_original')}{err('c_unpublished')}{err('c_review')}{err('c_public')}
      {state && !state.ok && !state.field && <p role="alert" className="m-0 font-semibold text-[#b42318]">{state.message}</p>}

      <button disabled={pending || hasLink} className="min-h-12 self-start rounded-md bg-accent px-8 text-lg font-bold text-accent-ink disabled:opacity-50">{pending ? 'Sending…' : 'Send my article for review'}</button>
    </form>
  )
}
