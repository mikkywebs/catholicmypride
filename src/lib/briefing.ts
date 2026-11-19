import 'server-only'
import { getDailyPrayer, getReading, getSaintsForDate } from './data'
import { formatLong } from './liturgical'

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.catholicmypride.org').replace(/\/$/, '').replace('://catholicmypride.org', '://www.catholicmypride.org')

/** Today's message for the WhatsApp Channel, in WhatsApp formatting (*bold*, _italic_). */
export async function whatsappBriefing(date: string): Promise<string> {
  const [r, saints, prayer] = await Promise.all([getReading(date), getSaintsForDate(date), getDailyPrayer(date)])
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
  lines.push('', 'Please share with family and friends. God bless you! 🕊️')
  return lines.join('\n')
}
