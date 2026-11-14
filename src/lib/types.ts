export type Settings = {
  site_name: string
  tagline: string
  mission: string
  logo_url: string | null
  hero_image_url: string | null
  hero_title: string | null
  hero_subtitle: string | null
  about_image_url: string | null
  about_story_title: string | null
  about_story_md: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_address: string | null
  youtube_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  x_url: string | null
  donate_url: string | null
  bank_account_name: string | null
  bank_name: string | null
  bank_account_number: string | null
  donate_needs_md: string | null
  view_threshold: number
}

export type Category = { id: string; kind: string; name: string; slug: string; seo_title: string | null; seo_description: string | null }

type Seo = { seo_title: string | null; seo_description: string | null }

export type Post = Seo & {
  id: string; slug: string; title: string; excerpt: string | null; body_md: string
  featured_image: string | null; image_alt: string | null; category_id: string | null
  tags: string[]; audio_url: string | null; audio_seconds: number | null; author: string | null
  focus_keyword: string | null; keywords: string | null; noindex: boolean
  published_at: string | null; updated_at: string
  category?: Category | null
}

export type Song = Seo & {
  id: string; slug: string; title: string; about: string | null; lyrics: string | null
  audio_url: string | null; duration_seconds: number | null; featured_image: string | null
  image_alt: string | null; category_id: string | null; allow_download: boolean
  kind: 'song' | 'audio'
  published_at: string | null
  category?: Category | null
}

export type Chaplet = Seo & {
  id: string; slug: string; title: string; intro: string | null; body_md: string
  featured_image: string | null; image_alt: string | null
  audio_url: string | null; audio_seconds: number | null; sort: number
}

export type Reading = Seo & {
  id: string; date: string; title: string | null; day_type: string | null; season: string | null
  vestment: string | null; featured_image: string | null; image_alt: string | null
  first_ref: string | null; first_text: string | null
  psalm_ref: string | null; psalm_response: string | null; psalm_text: string | null
  second_ref: string | null; second_text: string | null
  acclamation_ref: string | null; acclamation_text: string | null
  gospel_ref: string | null; gospel_text: string | null
  reflection_title: string | null; reflection_md: string | null; remarks_md: string | null
}

export type NovenaDay = { day: number; title: string | null; prayer_md: string | null; audio_url: string | null; audio_seconds: number | null }

export type Novena = Seo & {
  id: string; slug: string; title: string; feast_name: string | null; feast_date: string
  featured_image: string | null; image_alt: string | null; common_prayers_md: string | null
  days?: NovenaDay[]
}

export type Saint = Seo & {
  id: string; slug: string; name: string; show_on: string | null; feast_label: string | null
  celebration: string | null; featured_image: string | null; image_alt: string | null
  born: string | null; died: string | null; canonised: string | null; patronage: string[]
  life_md: string | null; quote: string | null; prayer_md: string | null
}

export type Prayer = Seo & {
  id: string; slug: string; title: string; category_id: string | null
  time_of_day: 'morning' | 'midday' | 'evening' | 'night' | null; show_on: string | null
  body_md: string; audio_url: string | null; audio_seconds: number | null
  featured_image: string | null; image_alt: string | null
  category?: Category | null
}

export type Book = Seo & {
  id: string; slug: string; title: string; author: string | null; category_id: string | null
  cover_url: string | null; description_md: string | null; keywords: string[]; remarks: string | null
  is_free: boolean; price_label: string | null; buy_url: string | null; file_url: string | null
  pages: number | null; format: string | null
  category?: Category | null
}

export type Church = { id: string; country: string; state: string; diocese: string; diocese_kind: string; name: string; address: string; map_url: string | null }

export type PublicPrayerRequest = { id: string; first_name: string; country: string | null; body: string; prayed_count: number; created_at: string; approved_at: string | null }
