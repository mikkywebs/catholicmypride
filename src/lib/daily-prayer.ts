import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { lectionaryFields } from './lectionary'
import { calendarSaintsFor } from './saints-data'
import { formatLong, liturgicalInfo } from './liturgical'
import type { Prayer } from './types'

// A prayer for each day, drawn from that day's Mass readings (Douay-Rheims), with the day's
// season, celebration and saint. Saved prayers in the admin always take the place of these.

export const dailyPrayerSlug = (date: string) => `prayer-${date}`
export const dateFromPrayerSlug = (slug: string) => /^prayer-(\d{4}-\d{2}-\d{2})$/.exec(slug)?.[1] ?? null

const KEY = /\b(Lord|God|Jesus|Christ|love|mercy|faith|heart|peace|life|kingdom|light|salvation|spirit|grace|hope|truth|joy|bless|save|pray|forgive|word)\b/gi

/** The most prayerful sentence of a reading (40–220 characters, rich in key words). */
function keySentence(text: string | null | undefined, preferJesus = false, avoid: (string | null | undefined)[] = []): string | null {
  if (!text) return null
  const body = text.includes('\n\n') ? text.slice(text.indexOf('\n\n') + 2) : text
  const sentences = body.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map((s) => s.trim())
  let best: { s: string; score: number } | null = null
  sentences.forEach((s, i) => {
    if (s.length < 40 || s.length > 220) return
    const norm = (x: string) => x.toLowerCase().replace(/[^a-z]/g, '')
    if (avoid.some((a) => a && (norm(a).includes(norm(s)) || norm(s).includes(norm(a).slice(0, 60))))) return
    let score = (s.match(KEY) ?? []).length * 2 - i * 0.05
    if (preferJesus && /\b(Jesus|said|saith|I am|Amen)\b/.test(s)) score += 2
    if (/^(And|But|For|Then)\b/.test(s)) score -= 0.5
    if (!best || score > best.score) best = { s, score }
  })
  const found = best as { s: string; score: number } | null
  return found ? found.s.replace(/[,;:]$/, '.') : null
}

/** Picks one of several wordings, the same for a given date. */
function pick<T>(list: T[], date: string, salt: number): T {
  let h = salt
  for (const c of date) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return list[h % list.length]
}

const OPENING: Record<string, string[]> = {
  Advent: [
    'Come, Lord Jesus. In this holy season of Advent we wait for you with longing hearts. Keep us watchful and awake, ready to welcome you when you come, and fill this day with the light of your promise.',
    'Lord God, as the Church prepares for the coming of your Son, prepare a way for him in our hearts. Make the rough places of our lives smooth, and let us greet this day with hope.',
  ],
  Christmas: [
    'Glory to you, Lord Jesus, Word made flesh. In this season of Christmas we rejoice that you have come to dwell among us. Let the joy of Bethlehem shine in our homes and in our work today.',
    'Loving Father, you sent your Son to be born of the Virgin Mary for our salvation. As we celebrate his coming, let his light shine through us in everything we do this day.',
  ],
  Lent: [
    'Merciful Father, in this season of Lent you call us back to you with all our hearts. Strengthen us in prayer, fasting and almsgiving, and give us a new heart this day.',
    'Lord Jesus, you went into the desert for forty days to pray and fast for us. Walk with us through this holy season, turn us away from sin, and draw us closer to you.',
  ],
  'Holy Week': [
    'Lord Jesus Christ, in this holiest of weeks we follow you to Jerusalem and to the Cross. Give us grace to watch and pray with you, and to love you as you have loved us.',
  ],
  Easter: [
    'Alleluia! Lord Jesus, you are risen from the dead and death has no more power over you. Fill this day with the joy of your Resurrection, and make us witnesses of your new life.',
    'Risen Lord, you broke the chains of death and opened for us the gates of heaven. In this Easter season let our hearts burn within us as we hear your word today.',
  ],
  'Ordinary Time': [
    'Heavenly Father, we thank you for the gift of this new day. In the ordinary moments of our lives you are present. Open our hearts to your word and guide every step we take today.',
    'Lord God, you are faithful in every season. As we pray with your word today, teach us to find you in our daily work, our families and the people we meet.',
    'Father of mercy, we come before you with grateful hearts. Bless this day and all that it holds, and let your word be a lamp for our feet and a light for our path.',
  ],
}

const AFTER_FIRST = [
  'Lord, let this word take root in us. Where we have closed our ears, open them; where we have hardened our hearts, soften them. Help us to listen to you as your people did of old, and to answer you with faith.',
  'Speak, Lord, your servants are listening. Write this word on our hearts, so that it may shape our thoughts, our choices and our words today.',
  'Lord God, your word is living and active. Let it correct us where we have strayed, comfort us where we are weary, and lead us into your truth.',
]
const AFTER_GOSPEL = [
  'Lord Jesus, like your first disciples we want to follow you. Give us ears to hear your voice and courage to do what you ask, even when it is hard. Let this Gospel become life in us today, in our homes, our workplaces and our communities.',
  'Jesus, Master and Friend, you speak to us today as truly as you spoke in Galilee. Heal what is wounded in us, forgive what is sinful, and send us out to share your love with everyone we meet.',
  'Lord Jesus, your words are spirit and life. Help us not only to hear them but to keep them, so that our lives may bear fruit that lasts.',
]
const INTERCESSIONS = [
  'For the Church throughout the world, for Pope Leo, our bishops, priests and religious: keep them faithful and joyful in your service.',
  'For our dear country Nigeria and for all nations: grant us peace, justice, honest leaders and an end to violence and insecurity.',
  'For our families: bless parents and children, heal divisions, and make every home a place of prayer and love.',
  'For the sick, the poor, the unemployed and all who suffer: be their strength, and move us to help them.',
  'For our beloved dead: grant them eternal rest, and let perpetual light shine upon them.',
]

const quote = (s: string) => `“${s}”`

/** A full prayer for the day, as Markdown, with the facts used to build it. */
export async function dailyPrayerFor(date: string): Promise<Prayer | null> {
  'use cache'
  cacheLife('max')
  cacheTag('daily-prayer')
  const r = await lectionaryFields(date)
  if (!r) return null
  const info = liturgicalInfo(date)
  const season = r.season ?? info.season
  const saints = await calendarSaintsFor(date)
  const main = saints[0]
  const long = formatLong(date)
  const firstQ = keySentence(r.first_text, false, [r.psalm_response])
  const gospelQ = keySentence(r.gospel_text, true, [r.psalm_response, firstQ])
  const secondQ = keySentence(r.second_text, false, [r.psalm_response, firstQ, gospelQ])
  const gospelShort = r.gospel_ref?.replace(/^cf\. /, '') ?? ''

  const parts: string[] = []
  const celebrating = r.day_type && !['Weekday', 'Sunday'].includes(r.day_type)
  const seasonNote = (r.title ?? '').includes(season) ? '' : ` in the season of **${season}**`
  parts.push((celebrating
    ? `Today, ${long}, the Church celebrates **${r.title}** (${r.day_type})${seasonNote}. `
    : `Today, ${long}, is the **${r.title}**${seasonNote}. `) +
    `We are in Year ${info.cycle} of the Sunday readings and Weekday Cycle ${info.weekdayCycle}, and the liturgical colour is ${(r.vestment ?? info.vestment).toLowerCase()}. ` +
    `This prayer is drawn from the Scriptures proclaimed at Mass today, so that the Word of God may shape our prayer and our day.`)
  if (main) {
    const snippet = (main.life_md ?? "").split('\n\n')[0].split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')
    parts.push(`### ${main.kind === 'celebration' ? 'Today in the Church' : 'Saint of the day'}: ${main.name}\n\n${snippet} [Read more](/saint-of-the-day/${main.slug})` +
      (saints.length > 1 ? `\n\nAlso remembered today: ${saints.slice(1).map((s) => s.name).join('; ')}.` : ''))
  }
  parts.push(`### Today's readings\n\n` + [
    r.first_ref && `- **First Reading:** ${r.first_ref}`,
    r.psalm_ref && `- **Responsorial Psalm:** ${r.psalm_ref}${r.psalm_response ? ` — *R. ${r.psalm_response}*` : ''}`,
    r.second_ref && `- **Second Reading:** ${r.second_ref}`,
    r.gospel_ref && `- **Gospel:** ${r.gospel_ref}`,
  ].filter(Boolean).join('\n') + `\n\n[Read the full Mass readings](/mass-readings/${date})`)

  parts.push(`### Opening prayer\n\n✠ In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\n${pick(OPENING[season] ?? OPENING['Ordinary Time'], date, 1)}`)
  if (firstQ) {
    parts.push(`### Praying with the first reading\n\nIn today's first reading (${r.first_ref}) we hear: ${quote(firstQ)}\n\n${pick(AFTER_FIRST, date, 2)}`)
  }
  if (r.psalm_response) {
    parts.push(`### Praying with the psalm\n\nWith the psalmist we make our response, repeating it slowly and from the heart:\n\n> **${r.psalm_response}**\n\nLord, let these words of the psalm (${r.psalm_ref}) be our own prayer today, in joy and in trouble alike.`)
  }
  if (secondQ && r.second_ref) {
    parts.push(`### Praying with the second reading\n\nThe Apostle reminds us (${r.second_ref}): ${quote(secondQ)} Lord, make us living letters of your love.`)
  }
  if (gospelQ) {
    parts.push(`### Praying with the Gospel\n\nIn the Gospel today (${r.gospel_ref}) we hear: ${quote(gospelQ)}\n\n${pick(AFTER_GOSPEL, date, 3)}`)
  }
  const saintLine = main && main.kind !== 'celebration'
    ? `\n- ${main.name}, whom we remember today: may we follow ${/^(Saints|The)\b/.test(main.name) ? 'their' : 'this'} example of faith, and through ${/^(Saints|The)\b/.test(main.name) ? 'their' : 'these'} prayers grow in holiness.`
    : ''
  parts.push(`### Prayers of intercession\n\nTrusting in your word, Lord, we bring you our needs:\n\n${INTERCESSIONS.map((x) => `- ${x}`).join('\n')}${saintLine}\n\nLord, hear our prayer. Lord, graciously hear us.`)
  parts.push(`### Closing prayer\n\nGathering all our prayers into one, we pray as Jesus taught us: **Our Father**… We ask the Blessed Virgin Mary to pray for us: **Hail Mary**… **Glory be** to the Father, and to the Son, and to the Holy Spirit.\n\n` +
    `Lord God, we thank you for speaking to us through your word today${gospelShort ? ` in ${gospelShort}` : ''}. Keep us in your love until evening comes, and bring us at last to the joy of your kingdom. Through Christ our Lord. Amen.\n\n✠ May the Lord bless us, protect us from all evil and bring us to everlasting life. Amen.`)

  const body = parts.join('\n\n')
  const title = `Daily Prayer for ${long}`
  return {
    id: `daily-${date}`, slug: dailyPrayerSlug(date), title, category_id: null, category: null,
    time_of_day: null, show_on: date, body_md: body, audio_url: null, audio_seconds: null,
    featured_image: null, image_alt: null, status: 'published', published_at: `${date}T00:00:00Z`,
    seo_title: `${title}: Praying with ${gospelShort || r.title}`.slice(0, 70),
    seo_description: `A Catholic prayer for ${long} (${r.title}), drawn from today's Mass readings${gospelShort ? ` and the Gospel of ${gospelShort}` : ''}${main ? `, remembering ${main.name}` : ''}.`.slice(0, 160),
  } as unknown as Prayer
}
