export type Settings = {
  site_name: string
  tagline: string
  mission: string
  logo_url: string | null
  hero_image_url: string | null
  hero_title: string | null
  hero_subtitle: string | null
  about_image_url: string | null
  default_reading_image?: string | null; default_reading_alt?: string | null
  default_prayer_image?: string | null; default_prayer_alt?: string | null
  whatsapp_channel_url?: string | null
  about_story_title: string | null
  about_story_md: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_address: string | null
  youtube_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  x_url: string | null
  extra_social: { label: string; url: string }[]
  donate_url: string | null
  bank_account_name: string | null
  bank_name: string | null
  bank_account_number: string | null
  donate_needs_md: string | null
  view_threshold: number
  music_fallback: 'songs' | 'audio' | 'all' | 'none'
  seasonal_theme?: import('./season-theme').SeasonMode | null
  music_loop: 'loop' | 'once'
}

export type Category = { id: string; kind: string; name: string; slug: string; seo_title: string | null; seo_description: string | null }

type Seo = { seo_title: string | null; seo_description: string | null }

export type Post = Seo & {
  id: string; slug: string; title: string; excerpt: string | null; body_md: string
  featured_image: string | null; image_alt: string | null; category_id: string | null
  tags: string[]; audio_url: string | null; audio_seconds: number | null; author: string | null
  author_country?: string | null; is_contributor?: boolean | null
  sources?: string | null
  youtube_url?: string | null; video_position?: string | null
  allow_download?: boolean | null
  focus_keyword: string | null; keywords: string | null; noindex: boolean
  published_at: string | null; updated_at: string
  category?: Category | null
}

export type Song = Seo & {
  id: string; slug: string; title: string; about: string | null; lyrics: string | null
  audio_url: string | null; duration_seconds: number | null; featured_image: string | null
  image_alt: string | null; category_id: string | null; allow_download: boolean
  kind: 'song' | 'audio'
  youtube_url: string | null
  on_bar: boolean; bar_days: number[]; bar_start: string | null; bar_end: string | null; bar_order: number
  published_at: string | null
  category?: Category | null
  bar_times?: string[] | null; bar_season?: 'all' | 'easter' | 'not_easter' | null; bar_remind_minutes?: number | null
}

export type Chaplet = Seo & {
  id: string; slug: string; title: string; intro: string | null; body_md: string
  featured_image: string | null; image_alt: string | null
  audio_url: string | null; audio_seconds: number | null; sort: number; allow_download?: boolean | null
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
  start_date: string | null; days_count: number | null; has_opening: boolean | null; repeats_yearly: boolean | null
  allow_download?: boolean | null; youtube_url?: string | null; weekly_on?: string | null; video_position?: string | null
  intro_md: string | null; repeat_prayer_md: string | null; repeat_count: number | null; invitation_md: string | null
  days?: NovenaDay[]
}

export type Saint = Seo & {
  id: string; slug: string; name: string; show_on: string | null; feast_label: string | null
  celebration: string | null; featured_image: string | null; image_alt: string | null
  born: string | null; died: string | null; canonised: string | null; patronage: string[]
  life_md: string | null; quote: string | null; prayer_md: string | null
  kind?: 'saint' | 'celebration' | null
}

export type Prayer = Seo & {
  id: string; slug: string; title: string; category_id: string | null
  time_of_day: 'morning' | 'midday' | 'evening' | 'night' | null; show_on: string | null
  body_md: string; audio_url: string | null; audio_seconds: number | null; allow_download?: boolean | null
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

export type Diocese = { id: string; name: string; kind: string; continent: string; country: string; province: string | null; address?: string | null; map_url?: string | null; total_parishes?: number | null; total_priests?: number | null; catholic_population?: number | null; deaneries?: string[]; deanery_regions?: string | null; featured_image?: string | null; image_alt?: string | null; cathedral?: string | null }
export type Region = { id: string; continent: string; country: string; province: string | null; total_provinces: number | null; total_dioceses: number | null; total_parishes: number | null; total_priests: number | null; catholic_population: number | null }

export type Church = {
  id: string; name: string; address: string | null; map_url: string | null; deanery: string | null; diocese_id: string | null; diocese?: Diocese | null
  slug?: string | null; mass_times?: string | null; phone?: string | null; email?: string | null; website?: string | null; lat?: number | null; lng?: number | null; updated_at?: string | null; featured_image?: string | null; image_alt?: string | null
  /** parish (default), pastoral (pastoral area), special (special jurisdiction) or chaplaincy; needs database updates 0044 and 0045. */
  kind?: 'parish' | 'pastoral' | 'special' | 'chaplaincy' | null
}

export type PublicPrayerRequest = { id: string; first_name: string; country: string | null; body: string; prayed_count: number; created_at: string; approved_at: string | null }

export type Faq = {
  id: string; question: string; slug: string; topic: string; answer_md: string; sources: string | null
  needs_review?: boolean; seo_title?: string | null; seo_description?: string | null; updated_at?: string | null
}

export type QuizQuestion = {
  id: string; question: string; topic: string
  option_a: string; option_b: string; option_c: string; option_d: string
  correct: 'A' | 'B' | 'C' | 'D'; explanation: string | null; source: string | null
}
