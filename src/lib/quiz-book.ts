// Builds the personalised quiz ebook (PDF) in the winner's browser.
type Q = { question: string; topic: string; a: string; b: string; c: string; d: string; correct: string; explanation: string | null; source: string | null }
type Links = { whatsapp: string | null; youtube: string | null; facebook: string | null; x: string | null; email: string | null }
type Book = { questions: Q[]; links: Links; mission: string | null }

const SITE = 'https://www.catholicmypride.org'
const NAVY: [number, number, number] = [31, 36, 48]
const GOLD: [number, number, number] = [242, 166, 90]
const BROWN: [number, number, number] = [166, 79, 12]
const CREAM: [number, number, number] = [247, 243, 232]
const INK: [number, number, number] = [40, 40, 40]
const MUTED: [number, number, number] = [105, 105, 105]

/** The PDF's standard fonts only know Western European letters: keep accents where possible, drop the rest. */
const clean = (s: string) => s.replace(/[‘’]/g, '’').normalize('NFC').replace(/[^\x20-\x7E -ÿ‘’“”–—…•€]/g, (ch) => ch.normalize('NFKD').replace(/[^\x20-\x7E]/g, ''))

// Book sections, from A to Z. Narrow topics (e.g. “Moses”, “Parables”) are grouped into clear sections.
const SECTION: Record<string, string> = {
  Abraham: 'Bible: Old Testament', 'Cain and Abel': 'Bible: Old Testament', Creation: 'Bible: Old Testament', David: 'Bible: Old Testament',
  Elijah: 'Bible: Old Testament', Esther: 'Bible: Old Testament', Jacob: 'Bible: Old Testament', Job: 'Bible: Old Testament', Joseph: 'Bible: Old Testament',
  Joshua: 'Bible: Old Testament', Judges: 'Bible: Old Testament', Kings: 'Bible: Old Testament', Maccabees: 'Bible: Old Testament', Moses: 'Bible: Old Testament',
  Noah: 'Bible: Old Testament', Prophets: 'Bible: Old Testament', Ruth: 'Bible: Old Testament', Samuel: 'Bible: Old Testament', Solomon: 'Bible: Old Testament', Tobit: 'Bible: Old Testament',
  Ascension: 'Bible: New Testament', 'Baptism of Jesus': 'Bible: New Testament', 'Childhood of Jesus': 'Bible: New Testament', Gospels: 'Bible: New Testament',
  'John the Baptist': 'Bible: New Testament', 'Ministry of Jesus': 'Bible: New Testament', Miracles: 'Bible: New Testament', Nativity: 'Bible: New Testament',
  Parables: 'Bible: New Testament', Passion: 'Bible: New Testament', Resurrection: 'Bible: New Testament', Revelation: 'Bible: New Testament', 'Saint Paul': 'Bible: New Testament',
  'Sermon on the Mount': 'Bible: New Testament', Transfiguration: 'Bible: New Testament', Pentecost: 'Bible: New Testament', 'Early Church': 'Bible: New Testament',
  Anointing: 'Sacraments', Baptism: 'Sacraments', Confirmation: 'Sacraments', Eucharist: 'Sacraments', 'Holy Orders': 'Sacraments', Marriage: 'Sacraments', Penance: 'Sacraments', Sacramentals: 'Sacraments',
  Mass: 'Mass and Liturgy', Liturgy: 'Mass and Liturgy',
  Feasts: 'Feasts and Seasons', 'Liturgical year': 'Feasts and Seasons', 'Holy Week': 'Feasts and Seasons',
  'Mary in Scripture': 'Mary', Annunciation: 'Mary',
  Creed: 'Faith and Teaching', Trinity: 'Faith and Teaching', 'Holy Spirit': 'Faith and Teaching', 'Last Things': 'Faith and Teaching',
  Morality: 'Faith and Teaching', Virtues: 'Faith and Teaching', Teaching: 'Faith and Teaching',
  Customs: 'Catholic Customs',
}
const OT = /^(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Josh|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|Chronicles|Ezra|Nehemiah|Tobit|Judith|Esther|Macc|Job|Psalm|Proverbs|Ecclesiastes|Song|Wisdom|Sirach|Isa|Jer|Lament|Baruch|Ezek|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi)/i
const NT = /^(Matthew|Mark|Luke|John|Acts|Rom|1 Cor|2 Cor|Gal|Eph|Phil|Col|1 Thess|2 Thess|1 Tim|2 Tim|Titus|Philemon|Heb|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Rev|Apoc)/i
function sectionOf(q: Q) {
  if (SECTION[q.topic]) return SECTION[q.topic]
  if (q.topic === 'Bible' || q.topic === 'Bible verses') {
    const src = (q.source ?? '').trim()
    if (!src) return 'Bible: General'
    if (OT.test(src)) return 'Bible: Old Testament'
    if (NT.test(src)) return 'Bible: New Testament'
    return 'Bible: General'
  }
  return q.topic
}

export async function downloadQuizBook({ name, country, logoUrl }: { name: string; country: string; logoUrl: string }) {
  const [{ jsPDF }, res] = await Promise.all([import('jspdf'), fetch('/api/quiz/book')])
  const book = (await res.json()) as Book
  const who = clean(name).trim() || 'our quiz winner'
  const where = clean(country)

  // Questions grouped by topic, topics from A to Z.
  const byTopic = new Map<string, Q[]>()
  for (const q of book.questions) { const k = sectionOf(q); byTopic.set(k, [...(byTopic.get(k) ?? []), q]) }
  const topics = [...byTopic.keys()].sort((x, y) => x.localeCompare(y))
  const total = book.questions.length
  const title = `${total.toLocaleString('en')} Catholic Quiz Questions`

  const doc = new jsPDF({ unit: 'mm', format: 'a5' })
  const W = 148, H = 210, M = 15, TW = W - 2 * M
  let logo: string | null = null
  try {
    const blob = await (await fetch(logoUrl)).blob()
    logo = await new Promise<string>((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = no; r.readAsDataURL(blob) })
  } catch {}
  const img = (x: number, y: number, s: number) => { if (logo) try { doc.addImage(logo, logo.includes('image/png') ? 'PNG' : 'JPEG', x, y, s, s) } catch {} }
  const font = (f: 'times' | 'helvetica', st: 'normal' | 'bold' | 'italic' | 'bolditalic', size: number, color = INK) => { doc.setFont(f, st); doc.setFontSize(size); doc.setTextColor(...color) }
  const center = (t: string, y: number) => doc.text(clean(t), W / 2, y, { align: 'center' })
  const link = (t: string, x: number, y: number, url: string, align: 'left' | 'center' = 'left') => {
    const w = doc.getTextWidth(t)
    const x0 = align === 'center' ? x - w / 2 : x
    doc.text(t, x0, y)
    doc.link(x0, y - 4, w, 5, { url })
  }

  // 1. Cover
  doc.setFillColor(...NAVY); doc.rect(0, 0, W, H, 'F')
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.8); doc.rect(8, 8, W - 16, H - 16)
  img(W / 2 - 17, 26, 34)
  font('helvetica', 'bold', 9, GOLD); center('CATHOLIC MY PRIDE APOSTOLATE', 72)
  font('times', 'bold', 26, [255, 255, 255])
  doc.text(doc.splitTextToSize(title, TW - 6), W / 2, 90, { align: 'center' })
  font('times', 'italic', 12, [220, 220, 220]); center('Verified facts about the Catholic faith, from A to Z,', 118); center('with answers, explanations and sources', 124)
  doc.setFillColor(...GOLD); doc.rect(20, 140, W - 40, 26, 'F')
  font('helvetica', 'normal', 9, NAVY); center('Specially prepared for', 148)
  font('times', 'bolditalic', 17, NAVY); center(who, 158)
  font('helvetica', 'normal', 9, [210, 210, 210]); link('www.catholicmypride.org', W / 2, 190, SITE, 'center')

  // 2. Dedication
  doc.addPage(); doc.setFillColor(...CREAM); doc.rect(0, 0, W, H, 'F')
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.5); doc.rect(10, 10, W - 20, H - 20)
  img(W / 2 - 11, 24, 22)
  font('helvetica', 'bold', 9, BROWN); center('A GIFT FROM CATHOLIC MY PRIDE', 56)
  font('times', 'normal', 13, INK); center('This book is specially presented to', 72)
  font('times', 'bolditalic', 22, BROWN); center(who, 86)
  if (where) { font('times', 'normal', 13, INK); center(`of ${where}`, 95) }
  font('times', 'normal', 12, INK)
  doc.text(doc.splitTextToSize('for taking part in the Catholic My Pride Online Quiz and winning three times. May this book help you to know, love and share the Catholic faith ever more deeply.', TW - 12), W / 2, 110, { align: 'center' })
  font('times', 'italic', 11, MUTED)
  doc.text(doc.splitTextToSize('“But continue thou in those things which thou hast learned, and which have been committed to thee.”', TW - 16), W / 2, 142, { align: 'center' })
  center('2 Timothy 3:14', 153)
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const code = `CMP-BOOK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
  font('helvetica', 'normal', 8.5, INK); doc.text(`Date: ${today}`, 18, 178); doc.text(`Book no. ${code}`, 18, 183)
  doc.setDrawColor(...NAVY); doc.line(W - 70, 177, W - 18, 177)
  font('times', 'bolditalic', 10, NAVY); doc.text('Catholic My Pride', W - 44, 182, { align: 'center' })
  font('helvetica', 'normal', 7.5, MUTED); doc.text('Apostolate', W - 44, 186, { align: 'center' })

  // 3. About Catholic My Pride, with links back to the website
  doc.addPage()
  font('times', 'bold', 20, NAVY); doc.text('About Catholic My Pride', M, 24)
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.6); doc.line(M, 27, M + 40, 27)
  font('times', 'normal', 11, INK)
  const intro = clean(book.mission || 'Catholic My Pride Apostolate spreads the Gospel, strengthens the Catholic faith and shares Christ’s love with families everywhere.')
  let y = 36
  for (const l of doc.splitTextToSize(`${intro} On our website you will find, every day and for free:`, TW)) { doc.text(l, M, y); y += 5.2 }
  y += 2
  const offers: [string, string, string][] = [
    ['Mass Readings and reflections', 'The readings of the day, with a reflection', '/mass-readings'],
    ['Feast of the Day', 'The lives of the saints and the feasts of the Church', '/saint-of-the-day'],
    ['Daily Prayers', 'A prayer drawn from each day’s Scripture', '/daily-prayers'],
    ['Novenas', 'Pray along, day by day, for every feast', '/novenas'],
    ['The Holy Rosary', 'Today’s mysteries with Scripture', '/rosary'],
    ['Music and Audio', 'Hymns, prayers and messages', '/audio'],
    ['Blog', 'Articles to grow in faith, also by readers like you', '/blog'],
    ['Questions and Answers', 'Clear answers about the Catholic faith, A to Z', '/faith-questions'],
    ['Quiz Time', 'Test your faith and win again', '/quiz'],
    ['Prayer Requests', 'Send us your intentions: we pray for you', '/prayer-requests'],
  ]
  for (const [t, d, p] of offers) {
    font('helvetica', 'bold', 9.5, BROWN); link(t, M, y, SITE + p)
    font('helvetica', 'normal', 8.5, MUTED); doc.text(clean(d), M, y + 4.2)
    y += 10.2
  }
  y += 1
  font('helvetica', 'bold', 9.5, NAVY); doc.text('Stay connected', M, y); y += 5
  font('helvetica', 'normal', 9, BROWN)
  const socials = [['Website: www.catholicmypride.org', SITE], book.links.whatsapp && ['WhatsApp Channel', book.links.whatsapp], book.links.youtube && ['YouTube', book.links.youtube], book.links.facebook && ['Facebook', book.links.facebook], book.links.x && ['X', book.links.x]].filter(Boolean) as [string, string][]
  let x = M
  for (const [t, u] of socials) { const w = doc.getTextWidth(t); if (x + w > W - M) { x = M; y += 5 } link(t, x, y, u); x += w + 6 }

  // 4. Contents (filled in once the page numbers are known)
  doc.addPage()
  const contentsPage = doc.getNumberOfPages()
  const starts: { topic: string; page: number; first: number; count: number }[] = []

  // 5. Questions, then the answers, topic by topic
  let n = 0
  const newPage = () => { doc.addPage(); y = 20 }
  const ensure = (h: number) => { if (y + h > H - 18) newPage() }
  for (const topic of topics) {
    const qs = [...(byTopic.get(topic) ?? [])].sort((p, q) => p.question.localeCompare(q.question))
    newPage()
    starts.push({ topic, page: doc.getNumberOfPages(), first: n + 1, count: qs.length })
    font('times', 'bold', 34, GOLD); doc.text(topic[0].toUpperCase(), M, 30)
    font('times', 'bold', 20, NAVY); doc.text(clean(topic), M + 16, 30)
    font('helvetica', 'normal', 8.5, MUTED); doc.text(`Questions ${n + 1}–${n + qs.length} · answers at the end of this section`, M + 16, 36)
    y = 46
    const firstOfTopic = n
    for (const q of qs) {
      n++
      font('helvetica', 'bold', 9.5, INK)
      const ql = doc.splitTextToSize(`${n}. ${clean(q.question)}`, TW)
      const opts = (['A', 'B', 'C', 'D'] as const).map((k) => `${k}) ${clean(q[k.toLowerCase() as 'a'])}`)
      const ol = opts.flatMap((o) => doc.splitTextToSize(o, TW - 5))
      ensure(ql.length * 4.4 + ol.length * 4 + 3)
      for (const l of ql) { doc.text(l, M, y); y += 4.4 }
      font('helvetica', 'normal', 9, INK)
      for (const l of ol) { doc.text(l, M + 4, y); y += 4 }
      y += 3
    }
    // Answers for this topic
    ensure(16)
    y += 2
    doc.setDrawColor(...GOLD); doc.setLineWidth(0.4); doc.line(M, y, W - M, y); y += 6
    font('times', 'bold', 13, BROWN); doc.text(`Answers · ${clean(topic)}`, M, y); y += 6
    let m = firstOfTopic
    for (const q of qs) {
      m++
      const answer = clean(q[q.correct.toLowerCase() as 'a'])
      const extra = [q.explanation && clean(q.explanation), q.source && `Source: ${clean(q.source)}`].filter(Boolean).join(' ')
      font('helvetica', 'bold', 8.5, INK)
      const al = doc.splitTextToSize(`${m}. ${q.correct}) ${answer}`, TW)
      font('helvetica', 'normal', 8, MUTED)
      const el = extra ? doc.splitTextToSize(extra, TW - 4) : []
      ensure(al.length * 3.9 + el.length * 3.6 + 2)
      font('helvetica', 'bold', 8.5, INK); for (const l of al) { doc.text(l, M, y); y += 3.9 }
      font('helvetica', 'normal', 8, MUTED); for (const l of el) { doc.text(l, M + 4, y); y += 3.6 }
      y += 2
    }
  }

  // 6. Closing page
  newPage()
  img(W / 2 - 11, 40, 22)
  font('times', 'bold', 18, NAVY); center('Keep growing in faith', 76)
  font('times', 'normal', 11.5, INK)
  doc.text(doc.splitTextToSize(`Congratulations, ${who}, and thank you for learning with us. Visit us every day for the readings, the saint of the day, prayers and novenas, and play Quiz Time again to test what you have learned.`, TW - 8), W / 2, 88, { align: 'center' })
  font('helvetica', 'bold', 10, BROWN)
  link('www.catholicmypride.org', W / 2, 124, SITE, 'center')
  link('Send us a prayer request', W / 2, 132, `${SITE}/prayer-requests`, 'center')
  link('Play Quiz Time again', W / 2, 140, `${SITE}/quiz`, 'center')
  if (book.links.whatsapp) link('Join our WhatsApp Channel', W / 2, 148, book.links.whatsapp, 'center')
  if (book.links.youtube) link('Subscribe on YouTube', W / 2, 156, book.links.youtube, 'center')
  font('helvetica', 'normal', 7.5, MUTED)
  doc.text(doc.splitTextToSize('Scripture quotations are from the Douay-Rheims Bible. CCC = Catechism of the Catholic Church. This book was prepared by Catholic My Pride Apostolate for personal, non-commercial use.', TW - 10), W / 2, 178, { align: 'center' })

  // Contents page
  doc.setPage(contentsPage)
  font('times', 'bold', 20, NAVY); doc.text('Contents', M, 24)
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.6); doc.line(M, 27, M + 25, 27)
  y = 38
  for (const s of starts) {
    font('helvetica', 'normal', 10, INK)
    doc.text(clean(s.topic), M, y)
    font('helvetica', 'normal', 9, MUTED)
    doc.text(`${s.count} questions`, W - M - 22, y, { align: 'right' })
    font('helvetica', 'bold', 10, BROWN)
    doc.text(String(s.page), W - M, y, { align: 'right' })
    doc.link(M, y - 4, TW, 5, { pageNumber: s.page })
    y += 7
    if (y > H - 20) break
  }

  // Footer on every page except the cover: our website (a link) and the page number.
  const pages = doc.getNumberOfPages()
  for (let p = 2; p <= pages; p++) {
    doc.setPage(p)
    doc.setDrawColor(225, 215, 195); doc.setLineWidth(0.2); doc.line(M, H - 12, W - M, H - 12)
    font('helvetica', 'normal', 7, MUTED)
    link('Catholic My Pride · www.catholicmypride.org', M, H - 7.5, SITE)
    doc.text(`Prepared for ${who}`, W / 2 + 8, H - 7.5, { align: 'center' })
    doc.text(String(p), W - M, H - 7.5, { align: 'right' })
  }

  doc.save(`Catholic-My-Pride-Quiz-Book-${who.replace(/[^A-Za-z0-9]+/g, '-')}.pdf`)
}
