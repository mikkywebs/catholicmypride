import { getQuizBank } from '@/lib/faith'
import { getSettings } from '@/lib/data'

// Everything the personalised quiz ebook needs: all published questions and our links.
export async function GET() {
  const [bank, s] = await Promise.all([getQuizBank(), getSettings()])
  return Response.json({
    questions: bank.map((q) => ({ question: q.question, topic: q.topic, a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d, correct: q.correct, explanation: q.explanation, source: q.source })),
    links: { whatsapp: s.whatsapp_channel_url ?? null, youtube: s.youtube_url ?? null, facebook: s.facebook_url ?? null, x: s.x_url ?? null, email: s.contact_email ?? null },
    mission: s.mission ?? null,
  }, { headers: { 'cache-control': 'public, s-maxage=600, stale-while-revalidate=3600' } })
}
