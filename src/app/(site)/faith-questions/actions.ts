'use server'

import { publicClient } from '@/lib/supabase/public'

export type AskState = { ok: boolean; message: string } | null
const LINK = /(https?:\/\/|www\.|[a-z0-9-]+\.(com|org|net|ng|io|co|info|xyz|ly|me|uk|app|link)\b)/i

/** A visitor's question, sent to the admin to answer or ignore. */
export async function askQuestion(_: AskState, form: FormData): Promise<AskState> {
  const question = String(form.get('question') ?? '').trim().replace(/\s+/g, ' ')
  const name = String(form.get('name') ?? '').trim().slice(0, 80) || null
  const country = String(form.get('country') ?? '').trim().slice(0, 60) || null
  if (String(form.get('website') ?? '')) return { ok: true, message: 'Thank you!' } // spam trap
  if (question.length < 8) return { ok: false, message: 'Please write your question in a few more words.' }
  if (question.length > 300) return { ok: false, message: 'Please keep your question under 300 characters.' }
  if (LINK.test(question) || (name && LINK.test(name))) return { ok: false, message: 'Please remove any links from your question.' }
  const db = publicClient()
  if (!db) return { ok: false, message: 'Sorry, questions cannot be sent right now.' }
  const { error } = await db.from('faq_submissions').insert({ question: question.endsWith('?') ? question : `${question}?`, name, country })
  if (error) return { ok: false, message: 'Sorry, your question could not be sent. Please try again later.' }
  return { ok: true, message: 'Thank you! Your question has been sent. Once it is answered, it will appear in this list.' }
}
