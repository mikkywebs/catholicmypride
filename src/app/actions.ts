'use server'

import { publicClient } from '@/lib/supabase/public'
import { LINK_PATTERN } from '@/lib/format'
import { COUNTRIES } from '@/lib/countries'

export type RequestState = { ok: boolean; message: string } | null

/** Public prayer request form. Links are rejected here and again by the database. */
export async function submitPrayerRequest(_: RequestState, form: FormData): Promise<RequestState> {
  // Honeypot: real people never fill this hidden field.
  if (String(form.get('website') ?? '')) return { ok: true, message: 'Thank you. We will pray for your intention.' }

  const name = String(form.get('name') ?? '').trim().slice(0, 80)
  const email = String(form.get('email') ?? '').trim().slice(0, 120)
  const country = String(form.get('country') ?? '').trim()
  const body = String(form.get('body') ?? '').trim()
  const isPrivate = form.get('private') === 'on'

  if (body.length < 3) return { ok: false, message: 'Please write your prayer intention.' }
  if (body.length > 2000) return { ok: false, message: 'Please keep your intention under 2,000 characters.' }
  if (LINK_PATTERN.test(body) || LINK_PATTERN.test(name)) return { ok: false, message: "Links and web addresses aren't allowed. Please remove them to send your request." }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: 'Please check your email address.' }
  if (country && !COUNTRIES.includes(country)) return { ok: false, message: 'Please choose your country from the list.' }

  const db = publicClient()
  if (!db) return { ok: false, message: 'Prayer requests are not open yet. Please try again soon.' }
  const { error } = await db.from('prayer_requests').insert({
    name: name || null, email: email || null, country: country || null, body, is_private: isPrivate,
  })
  if (error) return { ok: false, message: 'Something went wrong. Please try again.' }
  return {
    ok: true,
    message: isPrivate
      ? 'Thank you. Your private intention has reached our prayer team.'
      : 'Thank you. Your intention will appear on the Prayer Wall once our team approves it.',
  }
}

export type ContactState = { ok: boolean; message: string } | null

export async function sendContactMessage(_: ContactState, form: FormData): Promise<ContactState> {
  if (String(form.get('website') ?? '')) return { ok: true, message: 'Thank you. We will reply soon.' }
  const name = String(form.get('name') ?? '').trim().slice(0, 80)
  const email = String(form.get('email') ?? '').trim().slice(0, 120)
  const subject = String(form.get('subject') ?? '').trim().slice(0, 80)
  const message = String(form.get('message') ?? '').trim()
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: 'Please add your name and a valid email.' }
  if (message.length < 3 || message.length > 4000) return { ok: false, message: 'Please write a message (up to 4,000 characters).' }
  const db = publicClient()
  if (!db) return { ok: false, message: 'Messages are not open yet. Please email us instead.' }
  const { error } = await db.from('contact_messages').insert({ name, email, subject: subject || null, message })
  if (error) return { ok: false, message: 'Something went wrong. Please try again or email us.' }
  return { ok: true, message: 'Thank you. We usually reply within 2 working days.' }
}
