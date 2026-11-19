import 'server-only'
import { getDailyPrayer, getNovenas, getPosts, getReading, getSaintsForDate } from './data'
import { activeNovenas, dayLabel } from './novena-days'
import { formatLong } from './liturgical'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.catholicmypride.org').replace(/\/$/, '').replace('://catholicmypride.org', '://www.catholicmypride.org')

/** Today's message for the WhatsApp Channel, in WhatsApp formatting (*bold*, _italic_). */
export async function whatsappBriefing(date: string): Promise<string> {
  const [r, saints, prayer, novenas, posts] = await Promise.all([getReading(date), getSaintsForDate(date), getDailyPrayer(date), getNovenas(), getPosts(1)])
  const lines: string[] = [`✝️ *Catholic My Pride · ${formatLong(date)}*`]
  if (r?.title) lines.push(`_${r.title}_${r.vestment ? ` · ${r.vestment}` : ''}`)
  if (r) {
    lines.push('', '📖 *Today’s Mass Readings*')
    if (r.first_ref) lines.push(`• First Reading: ${r.first_ref}`)
    if (r.psalm_ref) lines.push(`• Psalm: ${r.psalm_ref}${r.psalm_response ? `\n  _R. ${r.psalm_response.replace(/ \(or: Alleluia\.\)$/, '')}_` : ''}`)
    if (r.second_ref) lines.push(`• Second Reading: ${r.second_ref}`)
    if (r.gospel_ref) lines.push(`• Gospel: ${r.gospel_ref}`)
    if (r.reflection_title) lines.push(`💭 Reflection: ${r.reflection_title}`)
    lines.push(`👉 ${SITE}/mass-readings/${date}`)
  }
  const main = saints[0]
  if (main) {
    const snippet = (main.life_md ?? '').split('\n\n')[0].replace(/[*_]/g, '').split(/(?<=[.!?])\s+/)[0]
    lines.push('', `${main.kind === 'celebration' ? '⛪ *Today in the Church*' : '😇 *Saint of the Day*'}: ${main.name}${main.celebration ? ` (${main.celebration})` : ''}`)
    if (snippet) lines.push(snippet)
    if (saints.length > 1) lines.push(`Also remembered: ${saints.slice(1).map((s) => s.name).join('; ')}`)
    lines.push(`👉 ${SITE}/saint-of-the-day/${main.slug}`)
  }
  if (prayer) {
    lines.push('', '🙏 *Daily Prayer*', prayer.title, `👉 ${SITE}/daily-prayers/${prayer.slug}`)
  }
  const running = activeNovenas(novenas, date)
  if (running.length) {
    lines.push('', running.length > 1 ? '🕯️ *Novenas in progress*' : '🕯️ *Novena in progress*')
    for (const { novena, day } of running) lines.push(`• ${novena.title}: ${dayLabel(novena, day)}`, `  👉 ${SITE}/novenas/${novena.slug}?day=${day}`)
  }
  const post = posts[0]
  if (post) lines.push('', '📝 *From our blog*', post.title, `👉 ${SITE}/blog/${post.slug}`)
  lines.push('', `🧠 Test your faith in *Quiz Time*: ${SITE}/quiz`)
  lines.push('', 'Please share with family and friends. God bless you! 🕊️')
  return lines.join('\n')
}
