// The Holy Rosary: mysteries of the day, with a Scripture passage (Douay-Rheims) for each.
import { liturgicalInfo, parseISODate } from './liturgical'

export type MysterySetKey = 'joyful' | 'sorrowful' | 'glorious' | 'luminous'
export type Mystery = { title: string; passage: string; verse: string; verseRef: string; fruit: string }
export type MysterySet = { key: MysterySetKey; name: string; days: string; mysteries: Mystery[] }

export const MYSTERIES: Record<MysterySetKey, MysterySet> = {
  joyful: {
    key: 'joyful', name: 'Joyful Mysteries', days: 'Mondays and Saturdays (and Sundays of Advent and Christmas)',
    mysteries: [
      { title: 'The Annunciation', passage: 'Luke 1:26–38', verse: 'Hail, full of grace, the Lord is with thee: blessed art thou among women.', verseRef: 'Luke 1:28', fruit: 'Humility' },
      { title: 'The Visitation', passage: 'Luke 1:39–56', verse: 'Blessed art thou among women, and blessed is the fruit of thy womb.', verseRef: 'Luke 1:42', fruit: 'Love of neighbour' },
      { title: 'The Nativity of Our Lord', passage: 'Luke 2:1–20', verse: 'She brought forth her firstborn son, and wrapped him up in swaddling clothes, and laid him in a manger; because there was no room for them in the inn.', verseRef: 'Luke 2:7', fruit: 'Poverty of spirit' },
      { title: 'The Presentation in the Temple', passage: 'Luke 2:22–38', verse: 'Because my eyes have seen thy salvation, which thou hast prepared before the face of all peoples: a light to the revelation of the Gentiles, and the glory of thy people Israel.', verseRef: 'Luke 2:30–32', fruit: 'Obedience' },
      { title: 'The Finding of Jesus in the Temple', passage: 'Luke 2:41–52', verse: 'How is it that you sought me? did you not know, that I must be about my father’s business?', verseRef: 'Luke 2:49', fruit: 'Joy in finding Jesus' },
    ],
  },
  sorrowful: {
    key: 'sorrowful', name: 'Sorrowful Mysteries', days: 'Tuesdays and Fridays (and Sundays of Lent)',
    mysteries: [
      { title: 'The Agony in the Garden', passage: 'Matthew 26:36–46', verse: 'My Father, if it be possible, let this chalice pass from me. Nevertheless not as I will, but as thou wilt.', verseRef: 'Matthew 26:39', fruit: 'Sorrow for sin' },
      { title: 'The Scourging at the Pillar', passage: 'John 19:1; Mark 15:15', verse: 'Then therefore, Pilate took Jesus, and scourged him.', verseRef: 'John 19:1', fruit: 'Purity' },
      { title: 'The Crowning with Thorns', passage: 'Matthew 27:27–31', verse: 'Platting a crown of thorns, they put it upon his head, and a reed in his right hand. And bowing the knee before him, they mocked him, saying: Hail, king of the Jews.', verseRef: 'Matthew 27:29', fruit: 'Courage' },
      { title: 'The Carrying of the Cross', passage: 'John 19:16–17; Luke 23:26–32', verse: 'And bearing his own cross, he went forth to that place which is called Calvary.', verseRef: 'John 19:17', fruit: 'Patience' },
      { title: 'The Crucifixion and Death of Our Lord', passage: 'Luke 23:33–46', verse: 'Father, into thy hands I commend my spirit.', verseRef: 'Luke 23:46', fruit: 'Perseverance' },
    ],
  },
  glorious: {
    key: 'glorious', name: 'Glorious Mysteries', days: 'Wednesdays and Sundays',
    mysteries: [
      { title: 'The Resurrection', passage: 'Mark 16:1–8', verse: 'You seek Jesus of Nazareth, who was crucified: he is risen, he is not here.', verseRef: 'Mark 16:6', fruit: 'Faith' },
      { title: 'The Ascension', passage: 'Acts 1:6–11', verse: 'While they looked on, he was raised up: and a cloud received him out of their sight.', verseRef: 'Acts 1:9', fruit: 'Hope' },
      { title: 'The Descent of the Holy Spirit', passage: 'Acts 2:1–4', verse: 'And they were all filled with the Holy Ghost, and they began to speak with divers tongues.', verseRef: 'Acts 2:4', fruit: 'Love of God' },
      { title: 'The Assumption of Mary', passage: 'Canticle of Canticles 2:10–13', verse: 'Arise, make haste, my love, my dove, my beautiful one, and come.', verseRef: 'Canticle of Canticles 2:10', fruit: 'Grace of a happy death' },
      { title: 'The Coronation of Mary', passage: 'Apocalypse 12:1', verse: 'A woman clothed with the sun, and the moon under her feet, and on her head a crown of twelve stars.', verseRef: 'Apocalypse 12:1', fruit: 'Trust in Mary’s intercession' },
    ],
  },
  luminous: {
    key: 'luminous', name: 'Luminous Mysteries', days: 'Thursdays',
    mysteries: [
      { title: 'The Baptism of Jesus in the Jordan', passage: 'Matthew 3:13–17', verse: 'This is my beloved Son, in whom I am well pleased.', verseRef: 'Matthew 3:17', fruit: 'Openness to the Holy Spirit' },
      { title: 'The Wedding at Cana', passage: 'John 2:1–11', verse: 'Whatsoever he shall say to you, do ye.', verseRef: 'John 2:5', fruit: 'To Jesus through Mary' },
      { title: 'The Proclamation of the Kingdom', passage: 'Mark 1:14–15', verse: 'The time is accomplished, and the kingdom of God is at hand: repent, and believe the gospel.', verseRef: 'Mark 1:15', fruit: 'Repentance and trust in God' },
      { title: 'The Transfiguration', passage: 'Matthew 17:1–8', verse: 'His face did shine as the sun: and his garments became white as snow.', verseRef: 'Matthew 17:2', fruit: 'Desire for holiness' },
      { title: 'The Institution of the Eucharist', passage: 'Matthew 26:26–29', verse: 'Take ye, and eat. This is my body.', verseRef: 'Matthew 26:26', fruit: 'Adoration' },
    ],
  },
}

const WEEKDAY: MysterySetKey[] = ['glorious', 'joyful', 'sorrowful', 'glorious', 'luminous', 'sorrowful', 'joyful'] // Sunday…Saturday
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** Mysteries for a date, following the weekly pattern of Saint John Paul II (2002).
 *  Many Catholics pray the Joyful Mysteries on the Sundays of Advent and Christmas, and the
 *  Sorrowful Mysteries on the Sundays of Lent; we follow that custom. */
export function mysteriesFor(iso: string): MysterySet & { weekday: string; seasonal: boolean } {
  const dow = new Date(parseISODate(iso)).getUTCDay()
  let key = WEEKDAY[dow]
  let seasonal = false
  if (dow === 0) {
    const { season } = liturgicalInfo(iso)
    if (season === 'Advent' || season === 'Christmas') { key = 'joyful'; seasonal = true }
    if (season === 'Lent' || season === 'Holy Week') { key = 'sorrowful'; seasonal = true }
  }
  return { ...MYSTERIES[key], weekday: DAY_NAMES[dow], seasonal }
}
