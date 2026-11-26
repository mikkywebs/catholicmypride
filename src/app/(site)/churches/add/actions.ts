'use server'

import { publicClient } from '@/lib/supabase/public'
import { coordsFromMapUrl } from '@/lib/directory'

export type ParishState = { ok: boolean; message: string; field?: string } | null

/** A new parish, or a correction to a listed one, saved for the admin to check. Nothing goes live by itself. */
export async function submitParish(_: ParishState, form: FormData): Promise<ParishState> {
  const get = (k: string, max: number) => String(form.get(k) ?? '').trim().replace(/[ \t]+/g, ' ').slice(0, max)
  if (get('company', 100)) return { ok: true, message: 'Thank you!' } // spam trap
  const kind = get('kind', 10) === 'update' ? 'update' : 'new'
  const church_id = kind === 'update' ? get('church_id', 40) || null : null
  const diocese_id = get('diocese_id', 40)
  const name = get('name', 120)
  const map_url = get('map_url', 600) || null
  const website = get('website_url', 200) || null
  const email = get('email', 120) || null
  const submitter_name = get('submitter_name', 80)
  const submitter_contact = get('submitter_contact', 120)
  let lat = Number(form.get('lat')), lng = Number(form.get('lng'))
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) { const c = coordsFromMapUrl(map_url); lat = c?.lat ?? NaN; lng = c?.lng ?? NaN }

  if (!/^[0-9a-f-]{36}$/i.test(diocese_id)) return { ok: false, field: 'diocese_id', message: 'Please choose the country and the archdiocese or diocese.' }
  if (name.length < 3) return { ok: false, field: 'name', message: 'Please enter the parish name, for example “St Leo Catholic Church, Ikeja”.' }
  if (map_url && !/^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(map_url)) return { ok: false, field: 'map_url', message: 'The map link must be a Google Maps link. Leave it empty if you do not have one.' }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, field: 'email', message: 'Please check the parish email address.' }
  if (submitter_name.length < 2) return { ok: false, field: 'submitter_name', message: 'Please enter your name.' }
  if (submitter_contact.length < 5) return { ok: false, field: 'submitter_contact', message: 'Please give your phone number or email, in case we need to check something.' }

  const db = publicClient()
  if (!db) return { ok: false, message: 'Sorry, this cannot be sent right now. Please try again later.' }
  let phone: string | null = get('phone', 40) || null, mail = email, site = website
  if (kind === 'update') {
    if (!church_id || !/^[0-9a-f-]{36}$/i.test(church_id)) return { ok: false, message: 'Sorry, we could not find that parish. Please open it again from the parish finder.' }
    const { data: now } = await db.from('churches').select('phone, email, website').eq('id', church_id).maybeSingle()
    // Listed contact details are protected: only the parish can change them, by writing to us.
    if (now?.phone) phone = null
    if (now?.email) mail = null
    if (now?.website) site = null
  }
  const { error } = await db.from('church_submissions').insert({
    kind, church_id, diocese_id, name,
    deanery: get('deanery', 80) || null, address: get('address', 300) || null, map_url,
    mass_times: String(form.get('mass_times') ?? '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 1500) || null,
    phone, email: mail, website: site,
    lat: Number.isFinite(lat) ? lat : null, lng: Number.isFinite(lng) ? lng : null,
    submitter_name, submitter_contact, role: get('role', 60) || null, note: get('note', 600) || null,
  })
  if (error) return { ok: false, message: /church_submissions/.test(error.message) ? 'Sorry, parish submissions are not open yet. Please try again soon.' : 'Sorry, this could not be sent. Please try again later.' }
  return { ok: true, message: `Thank you, ${submitter_name.split(' ')[0]}! ${kind === 'update' ? 'Your update' : 'Your parish'} has been sent. We check every entry before it appears, usually within a few days.` }
}
