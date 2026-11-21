// Seasonal decoration, worked out from the Church calendar for any year.
import { adventStart, easter, liturgicalInfo, parseISODate } from './liturgical'

export type SeasonKey = 'advent' | 'christmas' | 'lent' | 'holyweek' | 'easter' | 'pentecost' | 'christking'
export type SeasonMode = 'auto' | 'off' | SeasonKey
export const SEASON_MODES: SeasonMode[] = ['auto', 'off', 'advent', 'christmas', 'lent', 'holyweek', 'easter', 'pentecost', 'christking']

/** Picture drawn in the banner. */
export type Art = 'wreath' | 'star' | 'newyear' | 'cross' | 'palm' | 'chalice' | 'baretree' | 'tomb' | 'risen' | 'flame' | 'crown'

export type SeasonTheme = {
  key: SeasonKey
  art: Art
  /** Advent: how many candles are lit (1–4). */
  candles?: number
  eyebrow: string
  title: string
  line: string
  cite?: string
  href: string
  cta: string
  /** Main colour (liturgical) and a soft tint for backgrounds. */
  color: string
  tint: string
  /** Colour readable as text on the dark (navy) ribbon. */
  onDark: string
}

const DAY = 86_400_000
const iso = (t: number) => new Date(t).toISOString().slice(0, 10)
const ORD = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh']

const VIOLET = { color: '#6b4a9b', tint: '#efe8f7', onDark: '#c9b3ec' }
const ROSE = { color: '#b8557f', tint: '#f9e9f0', onDark: '#f0b3cd' }
const GOLD = { color: '#b9892a', tint: '#fbf3df', onDark: '#f2c66b' }
const RED = { color: '#a8322b', tint: '#f9e6e4', onDark: '#f0a19a' }
const PLAIN = { color: '#5c5f66', tint: '#efefef', onDark: '#c4c7cc' }

/** Today's decoration, or null in Ordinary Time (or when switched off). */
export function seasonTheme(today: string, mode: SeasonMode = 'auto'): SeasonTheme | null {
  if (mode === 'off') return null
  if (mode !== 'auto') return forced(mode, today)

  const t = parseISODate(today)
  const year = Number(today.slice(0, 4))
  const { season } = liturgicalInfo(today)
  const e = easter(year)
  const md = today.slice(5)

  if (season === 'Advent') {
    const adv = adventStart(year)
    const week = Math.min(4, Math.floor((t - adv) / (7 * DAY)) + 1)
    if (t === adv + 14 * DAY) {
      return { key: 'advent', art: 'wreath', candles: 3, eyebrow: 'Gaudete Sunday', title: 'Rejoice in the Lord always', line: 'Rejoice in the Lord always; again, I say, rejoice. The Lord is near!', cite: 'Philippians 4:4', href: '/novenas', cta: 'Pray our Advent novenas', ...ROSE }
    }
    return { key: 'advent', art: 'wreath', candles: week, eyebrow: `${ORD[week - 1]} Week of Advent`, title: 'Prepare the way of the Lord', line: 'The voice of one crying in the desert: Prepare ye the way of the Lord.', cite: 'Isaias 40:3', href: '/novenas', cta: 'Pray our Advent novenas', ...VIOLET }
  }
  if (season === 'Christmas') {
    if (md === '12-31' || md === '01-01' || md === '01-02') {
      return { key: 'christmas', art: 'newyear', eyebrow: md === '01-01' ? 'Mary, the Holy Mother of God' : 'Christmas season', title: 'A blessed New Year!', line: 'The Lord bless thee, and keep thee. The Lord shew his face to thee, and have mercy on thee.', cite: 'Numbers 6:24–25', href: '/mass-readings', cta: 'Today’s readings', ...GOLD }
    }
    if (md === '12-25') {
      return { key: 'christmas', art: 'star', eyebrow: 'The Nativity of the Lord', title: 'Merry Christmas! Christ is born!', line: 'This day is born to you a Saviour, who is Christ the Lord, in the city of David.', cite: 'Luke 2:11', href: '/mass-readings', cta: 'Christmas readings', ...GOLD }
    }
    return { key: 'christmas', art: 'star', eyebrow: 'Christmas season', title: 'Christ is born! Glory to God in the highest', line: 'The people that walked in darkness have seen a great light.', cite: 'Isaias 9:2', href: '/mass-readings', cta: 'Today’s readings', ...GOLD }
  }
  if (season === 'Lent') {
    const ash = e - 46 * DAY
    if (t === ash) return { key: 'lent', art: 'cross', eyebrow: 'Ash Wednesday', title: 'Lent begins today', line: 'Be converted to me with all your heart, in fasting, and in weeping, and in mourning.', cite: 'Joel 2:12', href: '/mass-readings', cta: 'Today’s readings', ...VIOLET }
    if (t === e - 21 * DAY) return { key: 'lent', art: 'cross', eyebrow: 'Laetare Sunday', title: 'Rejoice! Easter is drawing near', line: 'Halfway through Lent, the Church rejoices at the joy that is coming.', href: '/mass-readings', cta: 'Today’s readings', ...ROSE }
    const week = Math.floor((t - (ash + 4 * DAY)) / (7 * DAY)) + 1
    return { key: 'lent', art: 'cross', eyebrow: week >= 1 ? `${ORD[Math.min(week, 5) - 1]} Week of Lent` : 'Lent', title: 'Return to the Lord with all your heart', line: 'Be converted to me with all your heart, in fasting, and in weeping, and in mourning.', cite: 'Joel 2:12', href: '/chaplets', cta: 'Pray with us this Lent', ...VIOLET }
  }
  if (season === 'Holy Week') {
    const back = Math.round((e - t) / DAY)
    if (back === 7) return { key: 'holyweek', art: 'palm', eyebrow: 'Palm Sunday', title: 'Hosanna to the son of David!', line: 'Blessed is he that cometh in the name of the Lord: Hosanna in the highest.', cite: 'Matthew 21:9', href: '/mass-readings', cta: 'Today’s readings', ...RED }
    if (back === 3) return { key: 'holyweek', art: 'chalice', eyebrow: 'Holy Thursday', title: 'The Lord’s Supper', line: 'Tonight we remember the gift of the Eucharist and the priesthood, and keep watch with Jesus.', href: '/mass-readings', cta: 'Today’s readings', ...GOLD }
    if (back === 2) return { key: 'holyweek', art: 'baretree', eyebrow: 'Good Friday', title: 'Behold the wood of the Cross', line: 'Christ died for our sins. Today we fast, pray and adore the Cross.', href: '/mass-readings', cta: 'Today’s readings', ...RED }
    if (back === 1) return { key: 'holyweek', art: 'baretree', eyebrow: 'Holy Saturday', title: 'We wait at the tomb in hope', line: 'The Church waits in silence by the Lord’s tomb, until the joy of the Easter Vigil.', href: '/mass-readings', cta: 'Today’s readings', ...PLAIN }
    return { key: 'holyweek', art: 'cross', eyebrow: 'Holy Week', title: 'Walk with Jesus to the Cross', line: 'This is the holiest week of the year. Stay close to Jesus in prayer.', href: '/mass-readings', cta: 'Today’s readings', ...VIOLET }
  }
  if (season === 'Easter') {
    const pentecost = e + 49 * DAY
    if (t === pentecost) return { key: 'pentecost', art: 'flame', eyebrow: 'Pentecost Sunday', title: 'Come, Holy Spirit!', line: 'Thou shalt send forth thy spirit, and they shall be created: and thou shalt renew the face of the earth.', cite: 'Psalm 103 (104):30', href: '/mass-readings', cta: 'Today’s readings', ...RED }
    const week = Math.floor((t - e) / (7 * DAY)) + 1
    const octave = t - e < 8 * DAY
    return { key: 'easter', art: octave ? 'tomb' : 'risen', eyebrow: t === e ? 'Easter Sunday' : octave ? 'Easter Octave' : `${ORD[Math.min(week, 7) - 1]} Week of Easter`, title: 'Alleluia! He is risen!', line: 'The Lord is risen indeed. Alleluia!', cite: 'Luke 24:34', href: '/mass-readings', cta: 'Today’s readings', ...GOLD }
  }
  // Christ the King: the last Sunday of the Church's year, the Sunday before Advent.
  if (t === adventStart(year) - 7 * DAY) {
    return { key: 'christking', art: 'crown', eyebrow: 'Solemnity of Christ the King', title: 'Our Lord Jesus Christ, King of the Universe', line: 'King of kings, and Lord of lords.', cite: 'Apocalypse 19:16', href: '/mass-readings', cta: 'Today’s readings', ...GOLD }
  }
  return null
}

/** The admin picked one season by hand: show it with its everyday wording. */
function forced(key: SeasonKey, today: string): SeasonTheme {
  const sample: Record<SeasonKey, string> = {
    advent: iso(adventStart(Number(today.slice(0, 4))) + 7 * DAY),
    christmas: `${today.slice(0, 4)}-12-27`,
    lent: iso(easter(Number(today.slice(0, 4))) - 30 * DAY),
    holyweek: iso(easter(Number(today.slice(0, 4))) - 5 * DAY),
    easter: iso(easter(Number(today.slice(0, 4))) + 14 * DAY),
    pentecost: iso(easter(Number(today.slice(0, 4))) + 49 * DAY),
    christking: iso(adventStart(Number(today.slice(0, 4))) - 7 * DAY),
  }
  // Inside the real season, use today's own wording (e.g. the right Advent week).
  const real = seasonTheme(today, 'auto')
  if (real && real.key === key) return real
  return seasonTheme(sample[key], 'auto')!
}

