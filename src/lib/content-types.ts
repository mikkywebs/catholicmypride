// One description of every editable content type. The admin list, form,
// save action and cache refresh all read from this.

export type Field = (
  | { name: string; label: string; type: 'text' | 'url' | 'date' | 'datetime' | 'number'; required?: boolean; help?: string; placeholder?: string; half?: boolean }
  | { name: string; label: string; type: 'textarea' | 'markdown'; rows?: number; required?: boolean; help?: string; placeholder?: string }
  | { name: string; label: string; type: 'select'; options: string[]; required?: boolean; help?: string; half?: boolean; empty?: string }
  | { name: string; label: string; type: 'category'; kind: 'blog' | 'song' | 'book' | 'prayer'; half?: boolean }
  | { name: string; label: string; type: 'image'; shape: '16:9' | '4:5' | '2:3' | 'square'; altField?: string }
  | { name: string; label: string; type: 'audio'; secondsField: string; help?: string }
  | { name: string; label: string; type: 'file'; accept: string; help?: string }
  | { name: string; label: string; type: 'tags'; help?: string; placeholder?: string }
  | { name: string; label: string; type: 'boolean'; help?: string }
  | { name: string; label: string; type: 'heading' }
  | { name: string; label: string; type: 'place'; countryName: string; provinceName?: string; help?: string }
  | { name: string; label: string; type: 'diocese'; deaneryName?: string; help?: string }
  | { name: string; label: string; type: 'weekdays'; help?: string }
  | { name: string; label: string; type: 'time'; help?: string; half?: boolean }
  | { name: string; label: string; type: 'musicbar' }
) & {
  /** Show this field only when another field has a given value (e.g. only for saints, not feasts). */
  showWhen?: { field: string; is: string }
}

export type ContentType = {
  key: string
  table: string
  singular: string
  plural: string
  titleField: string
  slugFrom?: string
  /** Public address prefix, e.g. '/blog/'. Plain data so it can be sent to the browser. */
  publicBase?: string
  /** Field appended to publicBase: 'slug' or 'date'. */
  publicField?: 'slug' | 'date'
  listColumns: { field: string; label: string }[]
  orderBy: string
  tags: string[]
  seo?: boolean
  status?: boolean
  fields: Field[]
}

const STATUS_FIELDS: Field[] = [
  { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published'], half: true },
  { name: 'published_at', label: 'Publish date (leave empty for now; future = scheduled)', type: 'datetime', half: true },
]

const SEO_FIELDS: Field[] = [
  { name: 'seo_title', label: 'SEO title', type: 'text', help: '30–60 characters. Shown in Google results.' },
  { name: 'seo_description', label: 'Meta description', type: 'textarea', rows: 3, help: '120–160 characters.' },
]

const featured = (alt = true): Field => ({ name: 'featured_image', label: 'Featured image', type: 'image', shape: '16:9', altField: alt ? 'image_alt' : undefined })

export const CONTENT_TYPES: Record<string, ContentType> = {
  posts: {
    key: 'posts', table: 'posts', singular: 'blog post', plural: 'Blog', titleField: 'title', slugFrom: 'title',
    publicBase: '/blog/', publicField: 'slug',
    listColumns: [{ field: 'title', label: 'Title' }, { field: 'status', label: 'Status' }, { field: 'published_at', label: 'Published' }],
    orderBy: 'created_at', tags: ['posts', 'content'], seo: true, status: true,
    fields: [
      { name: 'title', label: 'Post title', type: 'text', required: true },
      { name: 'slug', label: 'Web address (slug)', type: 'text', required: true, help: 'Made from the title. Avoid changing it after publishing.' },
      { name: 'category_id', label: 'Category', type: 'category', kind: 'blog', half: true },
      { name: 'author', label: 'Author', type: 'text', half: true },
      { name: 'author_country', label: 'Author’s country (for contributors)', type: 'text', half: true },
      { name: 'is_contributor', label: 'Written by a reader (shows a “Contributor” label)', type: 'boolean' },
      featured(),
      { name: 'excerpt', label: 'Short summary', type: 'textarea', rows: 2, help: 'Shown on cards and in search results if no meta description.' },
      { name: 'body_md', label: 'Article', type: 'markdown', rows: 18, required: true, help: 'Tip: start each section with ## Heading (and ### for a sub-section). With 3 or more headings, readers get an “In this article” contents box.' },
      { name: 'sources', label: 'References (sources you used)', type: 'textarea', rows: 5, placeholder: 'Catechism of the Catholic Church, 2558 | https://www.vatican.va/archive/ENG0015/__P8Z.HTM\nSaint Andrew, Catholic Encyclopedia | https://www.newadvent.org/cathen/01471a.htm', help: 'One per line: the title, a | sign, then the link. A link on its own also works. They are listed as “References” at the end of the post.' },
      { name: 'youtube_url', label: 'YouTube video (optional)', type: 'url', placeholder: 'https://www.youtube.com/watch?v=…', help: 'Paste the link of a video about this post. It plays right on the page.' },
      { name: 'video_position', label: 'Where the video appears', type: 'select', options: ['after the first paragraph', 'instead of the featured image'], help: 'Instead of the featured image: the video takes the picture’s place at the top. The picture is still used when the link is shared.' },
      { name: 'audio_url', label: 'Audio version (optional)', type: 'audio', secondsField: 'audio_seconds' },
      { name: 'allow_download', label: 'Allow people to download this audio (shows a Download MP3 button)', type: 'boolean' },
      { name: 'tags', label: 'Tags', type: 'tags', placeholder: 'rosary, advent, mercy' },
      { name: 'focus_keyword', label: 'Focus keyword', type: 'text', help: 'The phrase people would type into Google to find this post.' },
      ...SEO_FIELDS,
      { name: 'keywords', label: 'Extra keywords (comma separated)', type: 'text' },
      { name: 'noindex', label: 'Hide this post from Google', type: 'boolean' },
      ...STATUS_FIELDS,
    ],
  },
  songs: {
    key: 'songs', table: 'songs', singular: 'song or audio', plural: 'Music & Audio', titleField: 'title', slugFrom: 'title',
    publicBase: '/audio/', publicField: 'slug',
    listColumns: [{ field: 'title', label: 'Title' }, { field: 'kind', label: 'Type' }, { field: 'on_bar', label: 'On music bar' }, { field: 'status', label: 'Status' }],
    orderBy: 'created_at', tags: ['songs', 'content'], seo: true, status: true,
    fields: [
      { name: 'kind', label: 'Is this a song, or an audio message / prayer?', type: 'select', options: ['song', 'audio'], required: true, help: 'Song = music with singing. Audio = a spoken message, teaching or prayer.' },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Web address (slug)', type: 'text', required: true },
      { name: 'category_id', label: 'Category', type: 'category', kind: 'song', half: true },
      { name: 'featured_image', label: 'Cover image (4:5, like an album cover)', type: 'image', shape: '4:5', altField: 'image_alt' },
      { name: 'about', label: 'About this song or message', type: 'textarea', rows: 3 },
      { name: 'lyrics', label: 'Lyrics or transcript (optional)', type: 'textarea', rows: 12 },
      { name: 'audio_url', label: 'MP3 file', type: 'audio', secondsField: 'duration_seconds' },
      { name: 'youtube_url', label: 'YouTube link (only if it is published on our channel)', type: 'url', placeholder: 'https://www.youtube.com/watch?v=…', help: 'Leave empty if it is not on YouTube. A “Watch on YouTube” button appears only when this is filled in.' },
      { name: 'allow_download', label: 'Allow people to download this audio (shows a Download MP3 button)', type: 'boolean' },
      { name: 'on_bar', label: 'Music bar', type: 'musicbar' },
      ...SEO_FIELDS,
      ...STATUS_FIELDS,
    ],
  },
  readings: {
    key: 'readings', table: 'readings', singular: 'Mass readings', plural: 'Mass Readings', titleField: 'date',
    publicBase: '/mass-readings/', publicField: 'date',
    listColumns: [{ field: 'date', label: 'Date' }, { field: 'title', label: 'Day' }, { field: 'auto_filled', label: 'Auto-filled' }, { field: 'needs_check', label: 'Please check' }, { field: 'status', label: 'Status' }],
    orderBy: 'date', tags: ['readings', 'content'], seo: true, status: true,
    fields: [
      { name: 'h1', label: '1 · The day', type: 'heading' },
      { name: 'date', label: 'Date', type: 'date', required: true, half: true },
      { name: 'day_type', label: 'Day type', type: 'select', options: ['Weekday', 'Optional Memorial', 'Memorial', 'Feast', 'Solemnity', 'Sunday'], half: true, empty: '—' },
      { name: 'season', label: 'Season (leave empty to work it out from the date)', type: 'select', options: ['Advent', 'Christmas', 'Ordinary Time', 'Lent', 'Holy Week', 'Easter'], half: true, empty: 'Automatic' },
      { name: 'vestment', label: 'Vestment colour (empty = season colour)', type: 'select', options: ['White', 'Red', 'Green', 'Violet', 'Rose', 'Black', 'Gold'], half: true, empty: 'Automatic' },
      { name: 'title', label: 'Title of the day', type: 'text', placeholder: 'e.g. Saturday of the 32nd Week in Ordinary Time' },
      featured(),
      { name: 'h2', label: '2 · First Reading', type: 'heading' },
      { name: 'first_ref', label: 'Reference', type: 'text', placeholder: 'e.g. Wisdom 18:14-16; 19:6-9' },
      { name: 'first_text', label: 'Text', type: 'textarea', rows: 8 },
      { name: 'h3', label: '3 · Responsorial Psalm', type: 'heading' },
      { name: 'psalm_ref', label: 'Reference', type: 'text', half: true },
      { name: 'psalm_response', label: 'Response (R.)', type: 'text', half: true },
      { name: 'psalm_text', label: 'Verses', type: 'textarea', rows: 8 },
      { name: 'h4', label: '4 · Second Reading (optional, hidden if empty)', type: 'heading' },
      { name: 'second_ref', label: 'Reference', type: 'text' },
      { name: 'second_text', label: 'Text', type: 'textarea', rows: 8 },
      { name: 'h5', label: '5 · Gospel Acclamation', type: 'heading' },
      { name: 'acclamation_ref', label: 'Reference', type: 'text' },
      { name: 'acclamation_text', label: 'Acclamation text', type: 'textarea', rows: 3 },
      { name: 'h6', label: '6 · Gospel', type: 'heading' },
      { name: 'gospel_ref', label: 'Reference', type: 'text' },
      { name: 'gospel_text', label: 'Text', type: 'textarea', rows: 10 },
      { name: 'h7', label: '7 · Reflection', type: 'heading' },
      { name: 'reflection_title', label: 'Reflection title', type: 'text' },
      { name: 'reflection_md', label: 'Your reflection', type: 'markdown', rows: 12 },
      { name: 'remarks_md', label: 'Other remarks (optional)', type: 'markdown', rows: 4 },
      ...SEO_FIELDS,
      ...STATUS_FIELDS,
    ],
  },
  novenas: {
    key: 'novenas', table: 'novenas', singular: 'novena', plural: 'Novenas', titleField: 'title', slugFrom: 'title',
    publicBase: '/novenas/', publicField: 'slug',
    listColumns: [{ field: 'title', label: 'Title' }, { field: 'feast_date', label: 'Feast' }, { field: 'days_count', label: 'Days' }, { field: 'status', label: 'Status' }],
    orderBy: 'feast_date', tags: ['novenas', 'content'], seo: true, status: true,
    fields: [
      { name: 'title', label: 'Novena title', type: 'text', required: true, placeholder: 'e.g. Novena to the Immaculate Conception' },
      { name: 'slug', label: 'Web address (slug)', type: 'text', required: true },
      { name: 'feast_name', label: 'Feast name', type: 'text', half: true },
      { name: 'feast_date', label: 'Feast date', type: 'date', required: true, half: true },
      { name: 'start_date', label: 'Day 1 is on (leave empty for 9 days before the feast)', type: 'date', half: true },
      { name: 'days_count', label: 'Number of days or weeks (usually 9)', type: 'number', half: true, placeholder: '9' },
      { name: 'weekly_on', label: 'Prayed once a week on', type: 'select', options: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], empty: 'Every day (a normal novena)', half: true, help: 'For weekly devotions like the Seven Sundays of St Joseph or the Thirteen Tuesdays of St Anthony. They end on the last such day before the feast.' },
      { name: 'repeats_yearly', label: 'Repeats every year (the dates move to next year by themselves)', type: 'boolean', help: 'Tick this for novenas on fixed dates, like the Immaculate Conception. Leave it off for movable feasts such as Pentecost or Divine Mercy Sunday, and update their dates each year.' },
      featured(),
      { name: 'intro_md', label: 'About this novena (shown above the days)', type: 'markdown', rows: 5 },
      { name: 'youtube_url', label: 'YouTube video (optional)', type: 'url', placeholder: 'https://www.youtube.com/watch?v=…', help: 'Paste the link of a video about this novena. It plays right on the page.' },
      { name: 'video_position', label: 'Where the video appears', type: 'select', options: ['after the first paragraph', 'instead of the featured image'], help: 'Instead of the featured image: the video takes the picture’s place at the top. The picture is still used when the link is shared.' },
      { name: 'repeat_prayer_md', label: 'Prayer repeated each day (optional, e.g. the Saint Andrew prayer)', type: 'markdown', rows: 4 },
      { name: 'repeat_count', label: 'Times to repeat it each day (visitors get a tap counter)', type: 'number', half: true, placeholder: 'e.g. 15' },
      { name: 'common_prayers_md', label: 'Prayers said at the end of every day', type: 'markdown', rows: 6 },
      { name: 'allow_download', label: 'Allow people to download the daily audio (shows a Download MP3 button on each day)', type: 'boolean' },
      { name: 'invitation_md', label: 'Invitation to share on social media (not shown on the website)', type: 'markdown', rows: 6 },
      ...SEO_FIELDS,
      ...STATUS_FIELDS,
    ],
  },
  saints: {
    key: 'saints', table: 'saints', singular: 'saint or feast', plural: 'Saints & Feasts', titleField: 'name', slugFrom: 'name',
    publicBase: '/saint-of-the-day/', publicField: 'slug',
    listColumns: [{ field: 'name', label: 'Saint or feast' }, { field: 'kind', label: 'Type' }, { field: 'show_on', label: 'Shown on' }, { field: 'celebration', label: 'Celebration' }, { field: 'auto_filled', label: 'Auto-filled' }, { field: 'status', label: 'Status' }],
    orderBy: 'show_on', tags: ['saints', 'content'], seo: true, status: true,
    fields: [
      { name: 'name', label: 'Name of the saint or feast', type: 'text', required: true },
      { name: 'kind', label: 'This is a…', type: 'select', options: ['saint', 'celebration'], required: true, half: true, help: 'saint = a holy person. celebration = a Church feast or event (e.g. the Presentation of Mary, the Assumption, the Chair of Saint Peter). Celebrations are shown as “Feast of the Day”, without Born, Died, Canonised or Patron of.' },
      { name: 'slug', label: 'Web address (slug)', type: 'text', required: true },
      { name: 'show_on', label: 'Show on (date)', type: 'date', half: true },
      { name: 'celebration', label: 'Celebration', type: 'select', options: ['Solemnity', 'Feast', 'Memorial', 'Optional Memorial', 'Local Memorial'], half: true, empty: '—' },
      { name: 'featured_image', label: 'Featured image (portrait 4:5, like Instagram)', type: 'image', shape: '4:5', altField: 'image_alt' },
      { name: 'feast_label', label: 'Feast day', type: 'text', placeholder: 'e.g. 21 November' },
      { name: 'born', label: 'Born', type: 'text', half: true, showWhen: { field: 'kind', is: 'saint' } },
      { name: 'died', label: 'Died', type: 'text', half: true, showWhen: { field: 'kind', is: 'saint' } },
      { name: 'canonised', label: 'Canonised', type: 'text', half: true, showWhen: { field: 'kind', is: 'saint' } },
      { name: 'patronage', label: 'Patron of', type: 'tags', placeholder: 'students, travellers', showWhen: { field: 'kind', is: 'saint' } },
      { name: 'life_md', label: 'Life story (for a saint) or what the Church celebrates (for a feast)', type: 'markdown', rows: 14 },
      { name: 'quote', label: 'A saying of the saint (optional)', type: 'textarea', rows: 2, showWhen: { field: 'kind', is: 'saint' } },
      { name: 'prayer_md', label: 'Prayer (to the saint, or for the feast)', type: 'markdown', rows: 6 },
      ...SEO_FIELDS,
      ...STATUS_FIELDS,
    ],
  },
  prayers: {
    key: 'prayers', table: 'prayers', singular: 'prayer', plural: 'Daily Prayers', titleField: 'title', slugFrom: 'title',
    publicBase: '/daily-prayers/', publicField: 'slug',
    listColumns: [{ field: 'title', label: 'Title' }, { field: 'time_of_day', label: 'Time' }, { field: 'show_on', label: 'Date' }, { field: 'auto_filled', label: 'Auto-filled' }, { field: 'status', label: 'Status' }],
    orderBy: 'show_on', tags: ['prayers', 'content'], seo: true, status: true,
    fields: [
      { name: 'title', label: 'Prayer title', type: 'text', required: true },
      { name: 'slug', label: 'Web address (slug)', type: 'text', required: true },
      { name: 'category_id', label: 'Library category (optional)', type: 'category', kind: 'prayer', half: true },
      { name: 'time_of_day', label: 'Daily tab (optional)', type: 'select', options: ['morning', 'midday', 'evening', 'night'], half: true, empty: 'Library only' },
      { name: 'show_on', label: 'Date for the daily tab (optional)', type: 'date', half: true },
      featured(),
      { name: 'body_md', label: 'Prayer text', type: 'markdown', rows: 14, required: true },
      { name: 'audio_url', label: 'Audio (optional)', type: 'audio', secondsField: 'audio_seconds' },
      { name: 'allow_download', label: 'Allow people to download this audio (shows a Download MP3 button)', type: 'boolean' },
      ...SEO_FIELDS,
      ...STATUS_FIELDS,
    ],
  },
  faqs: {
    key: 'faqs', table: 'faqs', singular: 'question', plural: 'Questions & Answers', titleField: 'question', slugFrom: 'question',
    publicBase: '/faith-questions/', publicField: 'slug',
    listColumns: [{ field: 'question', label: 'Question' }, { field: 'topic', label: 'A–Z topic' }, { field: 'needs_review', label: 'Please review' }, { field: 'status', label: 'Status' }],
    orderBy: 'topic', tags: ['faqs', 'content'], seo: true, status: true,
    fields: [
      { name: 'question', label: 'Question', type: 'text', required: true, placeholder: 'e.g. Why do Catholics pray to saints?' },
      { name: 'slug', label: 'Web address (slug)', type: 'text', required: true },
      { name: 'topic', label: 'A–Z topic (one or two words)', type: 'text', required: true, placeholder: 'e.g. Saints', help: 'Its first letter decides where it is listed in A–Z.' },
      { name: 'answer_md', label: 'Answer', type: 'markdown', rows: 10, required: true },
      { name: 'sources', label: 'Sources (optional)', type: 'text', placeholder: 'e.g. CCC 956; Hebrews 12:1; James 5:16' },
      { name: 'needs_review', label: 'Still needs review (shown only in the admin)', type: 'boolean' },
      ...SEO_FIELDS,
      ...STATUS_FIELDS,
    ],
  },
  quotes: {
    key: 'quotes', table: 'quotes', singular: 'quote', plural: 'Quotes', titleField: 'text',
    listColumns: [{ field: 'text', label: 'Quote' }, { field: 'author', label: 'By' }, { field: 'kind', label: 'From' }, { field: 'show_on', label: 'Quote of the Day on' }],
    orderBy: 'author', tags: ['quotes', 'content'], status: false,
    fields: [
      { name: 'text', label: 'Quote', type: 'textarea', rows: 4, required: true, help: 'Quote the exact words. Many famous quotes online are wrongly attributed: please add only quotes with a known source.' },
      { name: 'author', label: 'Said or written by', type: 'text', required: true, half: true, placeholder: 'e.g. Saint Augustine of Hippo' },
      { name: 'kind', label: 'From', type: 'select', options: ['jesus', 'mary', 'bible', 'saint', 'pope', 'bishop', 'scholar', 'church'], required: true, half: true, help: 'mary = Our Lady’s words, in Scripture or in a Church-approved apparition (Lourdes, Fatima, Guadalupe…).' },
      { name: 'source', label: 'Source (book, chapter, document or verse)', type: 'text', placeholder: 'e.g. Confessions, Book 1, chapter 1' },
      { name: 'show_on', label: 'Show as Quote of the Day on (optional)', type: 'date', half: true, help: 'Leave empty: it comes up in turn with the others.' },
      { name: 'status', label: 'Status', type: 'select', options: ['published', 'draft'], half: true },
      { name: 'needs_review', label: 'Still needs review (shown only in the admin)', type: 'boolean' },
    ],
  },
  quiz: {
    key: 'quiz', table: 'quiz_questions', singular: 'quiz question', plural: 'Quiz Questions', titleField: 'question',
    listColumns: [{ field: 'question', label: 'Question' }, { field: 'topic', label: 'A–Z topic' }, { field: 'correct', label: 'Answer' }, { field: 'status', label: 'Status' }],
    orderBy: 'topic', tags: ['quiz', 'content'], status: false,
    fields: [
      { name: 'question', label: 'Question', type: 'textarea', rows: 2, required: true },
      { name: 'topic', label: 'A–Z topic (one or two words)', type: 'text', required: true, placeholder: 'e.g. Sacraments' },
      { name: 'option_a', label: 'Option A', type: 'text', required: true, half: true },
      { name: 'option_b', label: 'Option B', type: 'text', required: true, half: true },
      { name: 'option_c', label: 'Option C', type: 'text', required: true, half: true },
      { name: 'option_d', label: 'Option D', type: 'text', required: true, half: true },
      { name: 'correct', label: 'Correct answer', type: 'select', options: ['A', 'B', 'C', 'D'], half: true },
      { name: 'status', label: 'Status', type: 'select', options: ['published', 'draft'], half: true },
      { name: 'explanation', label: 'Explanation (shown after answering)', type: 'textarea', rows: 3 },
      { name: 'source', label: 'Source (optional)', type: 'text', placeholder: 'e.g. CCC 1213; Matthew 28:19' },
      { name: 'needs_review', label: 'Still needs review (shown only in the admin)', type: 'boolean' },
    ],
  },
  chaplets: {
    key: 'chaplets', table: 'chaplets', singular: 'chaplet', plural: 'Chaplets', titleField: 'title', slugFrom: 'title',
    publicBase: '/chaplets/', publicField: 'slug',
    listColumns: [{ field: 'title', label: 'Chaplet' }, { field: 'sort', label: 'Order' }, { field: 'status', label: 'Status' }],
    orderBy: 'sort', tags: ['chaplets', 'content'], seo: true, status: true,
    fields: [
      { name: 'title', label: 'Chaplet name', type: 'text', required: true, placeholder: 'e.g. Chaplet of Divine Mercy' },
      { name: 'slug', label: 'Web address (slug)', type: 'text', required: true },
      { name: 'sort', label: 'Order in the list (1 = first)', type: 'number', half: true },
      featured(),
      { name: 'intro', label: 'Short introduction', type: 'textarea', rows: 3, help: 'Its origin and when it is prayed.' },
      { name: 'body_md', label: 'How to pray it (steps and prayers)', type: 'markdown', rows: 20, required: true, help: 'Tip: use ## for each step, e.g. ## On the large beads.' },
      { name: 'audio_url', label: 'Pray-along audio (optional)', type: 'audio', secondsField: 'audio_seconds' },
      { name: 'allow_download', label: 'Allow people to download this audio (shows a Download MP3 button)', type: 'boolean' },
      ...SEO_FIELDS,
      ...STATUS_FIELDS,
    ],
  },
  books: {
    key: 'books', table: 'books', singular: 'ebook', plural: 'Ebooks', titleField: 'title', slugFrom: 'title',
    publicBase: '/ebooks/', publicField: 'slug',
    listColumns: [{ field: 'title', label: 'Title' }, { field: 'status', label: 'Status' }, { field: 'published_at', label: 'Published' }],
    orderBy: 'created_at', tags: ['books', 'content'], seo: true, status: true,
    fields: [
      { name: 'title', label: 'Book title', type: 'text', required: true },
      { name: 'slug', label: 'Web address (slug)', type: 'text', required: true },
      { name: 'author', label: 'Author', type: 'text', half: true },
      { name: 'category_id', label: 'Category', type: 'category', kind: 'book', half: true },
      { name: 'cover_url', label: 'Book cover', type: 'image', shape: '2:3' },
      { name: 'description_md', label: 'Description', type: 'markdown', rows: 8 },
      { name: 'keywords', label: 'Keywords', type: 'tags' },
      { name: 'remarks', label: 'Remarks (optional)', type: 'textarea', rows: 3 },
      { name: 'is_free', label: 'This book is free', type: 'boolean' },
      { name: 'file_url', label: 'Book file for free download (PDF or EPUB)', type: 'file', accept: '.pdf,.epub,application/pdf,application/epub+zip' },
      { name: 'price_label', label: 'Price (if paid)', type: 'text', half: true, placeholder: '₦2,000' },
      { name: 'buy_url', label: 'Buy link (e.g. your Selar page)', type: 'url', half: true },
      { name: 'pages', label: 'Pages', type: 'number', half: true },
      { name: 'format', label: 'Format', type: 'text', half: true, placeholder: 'PDF' },
      ...SEO_FIELDS,
      ...STATUS_FIELDS,
    ],
  },
  dioceses: {
    key: 'dioceses', table: 'dioceses', singular: 'diocese', plural: 'Dioceses', titleField: 'name',
    listColumns: [{ field: 'name', label: 'Name' }, { field: 'kind', label: 'Type' }, { field: 'province', label: 'Province' }, { field: 'country', label: 'Country' }],
    orderBy: 'created_at', tags: ['churches', 'content'], status: false,
    fields: [
      { name: 'continent', label: 'Continent, country and ecclesiastical province', type: 'place', countryName: 'country', provinceName: 'province', help: 'The province is the group of dioceses under a metropolitan archdiocese, usually named after it.' },
      { name: 'kind', label: 'Type', type: 'select', options: ['Archdiocese', 'Diocese', 'Eparchy', 'Apostolic Vicariate', 'Prefecture', 'Military Ordinariate', 'Personal Ordinariate'], half: true },
      { name: 'name', label: 'Name (without the word Diocese)', type: 'text', required: true, half: true, placeholder: 'e.g. Lagos' },
      { name: 'deaneries', label: 'Deaneries / Zones in this diocese (optional)', type: 'tags', placeholder: 'e.g. Ikeja Deanery, Lekki Deanery, Badagry Deanery', help: 'Listed here, they become a dropdown when adding parishes.' },
      { name: 'deanery_regions', label: 'Regions (optional, for large dioceses)', type: 'textarea', rows: 4, placeholder: 'Ikeja Region: Agege, Ikeja, Ijede, Ikorodu, Ipaja, Maryland\nLekki Region: Ajah, Epe, Lekki', help: 'One line per region: the region’s name, a colon, then its deaneries. The parish finder then groups parishes as Region › Deanery › Parish.' },
      { name: 'cathedral', label: 'Cathedral (optional)', type: 'text', placeholder: 'e.g. Holy Cross Cathedral, Lagos' },
      { name: 'featured_image', label: 'Cathedral photo (optional)', type: 'image', shape: '16:9', altField: 'image_alt' },
      { name: 'address', label: 'Address (optional)', type: 'textarea', rows: 2, help: 'e.g. the cathedral or diocesan secretariat. Shown with a map on the directory.' },
      { name: 'map_url', label: 'Google Maps link (optional)', type: 'url', help: 'Paste a link from Google Maps for exact directions. If empty, directions use the address.' },
      { name: 'stats', label: 'Official totals (optional — shown only when filled)', type: 'heading' },
      { name: 'total_parishes', label: 'Total parishes', type: 'number', half: true },
      { name: 'total_priests', label: 'Total priests', type: 'number', half: true },
      { name: 'catholic_population', label: 'Catholic population', type: 'number', half: true, placeholder: 'e.g. 3500000' },
      { name: 'status', label: 'Status', type: 'select', options: ['published', 'draft'] },
    ],
  },
  regions: {
    key: 'regions', table: 'directory_regions', singular: 'country or province', plural: 'Countries & Provinces', titleField: 'country',
    listColumns: [{ field: 'country', label: 'Country' }, { field: 'province', label: 'Province (empty = country entry)' }, { field: 'province_list', label: 'Provinces listed' }, { field: 'total_dioceses', label: 'Dioceses' }],
    orderBy: 'country', tags: ['churches', 'content'], status: false,
    fields: [
      { name: 'continent', label: 'Continent and country', type: 'place', countryName: 'country', help: 'Choose the continent first, then the country.' },
      { name: 'province', label: 'Ecclesiastical province (leave empty for a country entry)', type: 'text', placeholder: 'e.g. Lagos', help: 'Only to add official totals for one province. To list provinces, use the box below on the country entry.' },
      { name: 'province_list', label: 'Provinces in this country (country entry only)', type: 'tags', placeholder: 'e.g. Abuja, Benin City, Calabar, Ibadan, Jos, Kaduna, Lagos, Onitsha, Owerri', help: 'These become the dropdown when adding a diocese.' },
      { name: 'stats', label: 'Official totals (optional) — fill only what you know', type: 'heading' },
      { name: 'total_provinces', label: 'Ecclesiastical provinces (country only)', type: 'number', half: true },
      { name: 'total_dioceses', label: 'Archdioceses and dioceses', type: 'number', half: true },
      { name: 'total_parishes', label: 'Parishes', type: 'number', half: true },
      { name: 'total_priests', label: 'Priests', type: 'number', half: true },
      { name: 'catholic_population', label: 'Catholic population', type: 'number', half: true, placeholder: 'e.g. 30000000' },
      { name: 'status', label: 'Status', type: 'select', options: ['published', 'draft'], half: true },
    ],
  },
  churches: {
    key: 'churches', table: 'churches', singular: 'parish', plural: 'Parishes', titleField: 'name',
    listColumns: [{ field: 'name', label: 'Parish' }, { field: 'diocese', label: 'Archdiocese / Diocese' }, { field: 'deanery', label: 'Deanery / Zone' }, { field: 'address', label: 'Address' }],
    orderBy: 'created_at', tags: ['churches', 'content'], status: false,
    fields: [
      { name: 'diocese_id', label: 'Where is it?', type: 'diocese', deaneryName: 'deanery', help: 'Choose continent, country, then the archdiocese or diocese. Missing? Add it under Dioceses first.' },
      { name: 'name', label: 'Parish name', type: 'text', required: true, placeholder: 'e.g. St Leo Catholic Church' },
      { name: 'kind', label: 'Type', type: 'select', options: ['parish', 'pastoral', 'special', 'chaplaincy'], half: true, help: 'parish = a full parish (counted as a parish). pastoral = a pastoral area. special = a special jurisdiction. chaplaincy = a school, hospital, police or military chaplaincy. The last two are listed apart and not counted as parishes.' },
      { name: 'featured_image', label: 'Photo of the parish church (optional)', type: 'image', shape: '16:9', altField: 'image_alt' },
      { name: 'address', label: 'Address (optional)', type: 'textarea', rows: 2, help: 'Shown with a map on the directory.' },
      { name: 'map_url', label: 'Google Maps link (optional)', type: 'url', help: 'Paste a link from Google Maps for exact directions. A full link (with @ and numbers) also gives the parish its position for “Parishes near me”.' },
      { name: 'mass_times', label: 'Mass times (optional)', type: 'textarea', rows: 5, placeholder: 'Sunday: 6:30am, 8:30am, 10:30am\nWeekdays: 6:30am\nSaturday: 7:00am', help: 'One line per day: the day, a colon, then the times.' },
      { name: 'phone', label: 'Parish phone (optional)', type: 'text', half: true },
      { name: 'email', label: 'Parish email (optional)', type: 'text', half: true },
      { name: 'website', label: 'Parish website (optional)', type: 'url' },
      { name: 'status', label: 'Status', type: 'select', options: ['published', 'draft'], half: true },
    ],
  },
}

/** Public address of a saved item, or null if the type has no public page. */
export function publicUrl(t: Pick<ContentType, 'publicBase' | 'publicField'>, row: Record<string, unknown>) {
  if (!t.publicBase || !t.publicField) return null
  const v = row[t.publicField]
  return v ? `${t.publicBase}${v}` : null
}
