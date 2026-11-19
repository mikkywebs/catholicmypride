'use server'

import { publicClient } from '@/lib/supabase/public'

export type SubmitState = { ok: boolean; message: string; field?: string } | null

const LINK = /(https?:\/\/|www\.|[a-z0-9-]+\.(com|org|net|ng|io|co|info|xyz|ly|me|uk|app|link|blog|site)\b)/i
const MIN_WORDS = 400
const MAX_WORDS = 2500
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

/** A reader's article, saved for the admin to review. Nothing is published automatically. */
export async function submitArticle(_: SubmitState, form: FormData): Promise<SubmitState> {
  const get = (k: string, max: number) => String(form.get(k) ?? '').trim().slice(0, max)
  if (get('website', 200)) return { ok: true, message: 'Thank you!' } // spam trap
  const name = get('name', 80).replace(/\s+/g, ' ')
  const country = get('country', 60)
  const email = get('email', 120)
  const title = get('title', 150).replace(/\s+/g, ' ')
  const body = String(form.get('body') ?? '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  const sources = get('sources', 3000) || null
  const about = get('about', 300) || null

  if (name.length < 2) return { ok: false, field: 'name', message: 'Please enter your name as it should appear on the article.' }
  if (country.length < 2) return { ok: false, field: 'country', message: 'Please choose your country.' }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, field: 'email', message: 'Please enter a valid email address, so we can tell you about your article.' }
  if (title.length < 10) return { ok: false, field: 'title', message: 'Please give your article a title of at least a few words.' }
  const n = words(body)
  if (n < MIN_WORDS) return { ok: false, field: 'body', message: `Your article has ${n} words. Please write at least ${MIN_WORDS}.` }
  if (n > MAX_WORDS || body.length > 20000) return { ok: false, field: 'body', message: `Your article has ${n} words. Please keep it under ${MAX_WORDS}.` }
  for (const [field, v] of [['title', title], ['body', body], ['sources', sources], ['about', about], ['name', name]] as const) {
    if (v && LINK.test(v)) return { ok: false, field, message: 'Please remove all links and web addresses. Give your sources as plain text, for example “Catechism of the Catholic Church, 1324”.' }
  }
  for (const c of ['c_original', 'c_unpublished', 'c_review', 'c_public']) {
    if (form.get(c) !== 'on') return { ok: false, field: c, message: 'Please tick all four boxes at the end of the form.' }
  }

  const db = publicClient()
  if (!db) return { ok: false, message: 'Sorry, articles cannot be sent right now. Please try again later.' }
  const { error } = await db.from('article_submissions').insert({ name, country, email, title, body, sources, about_author: about })
  if (error) return { ok: false, message: 'Sorry, your article could not be sent. Please try again later.' }
  return { ok: true, message: `Thank you, ${name.split(' ')[0]}! Your article has been sent for review. We will email you at ${email} once we have read it.` }
}
