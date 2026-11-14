import type { NextRequest } from 'next/server'
import { getReading } from '@/lib/data'
import { formatLong, liturgicalInfo, todayISO, VESTMENT_HEX } from '@/lib/liturgical'

// Data for the "Today in the Church" bar, for the visitor's own date.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('date') ?? ''
  const date = /^\d{4}-\d{2}-\d{2}$/.test(q) ? q : todayISO()
  const info = liturgicalInfo(date)
  const r = await getReading(date)
  const vest = r?.vestment ?? info.vestment
  return Response.json(
    {
      date,
      label: formatLong(date),
      season: r?.season || info.season,
      cycle: info.cycle,
      weekdayCycle: info.weekdayCycle,
      vestmentHex: VESTMENT_HEX[vest] ?? VESTMENT_HEX.Green,
      title: r?.title ?? null,
      first: r?.first_ref ?? null,
      psalm: r?.psalm_ref ? `${r.psalm_ref}${r.psalm_response ? ` · R. ${r.psalm_response}` : ''}` : null,
      second: r?.second_ref ?? null,
      gospel: r?.gospel_ref ?? null,
      hasReading: Boolean(r),
    },
    { headers: { 'cache-control': 'public, max-age=300' } },
  )
}
