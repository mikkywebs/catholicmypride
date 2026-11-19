import { getQuizBank } from '@/lib/faith'

// Ten random questions for one round of Quiz Time.
export async function GET() {
  const bank = await getQuizBank()
  const pool = [...bank]
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]] }
  return Response.json(pool.slice(0, 10), { headers: { 'cache-control': 'no-store' } })
}
