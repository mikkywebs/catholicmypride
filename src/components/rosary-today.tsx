'use client'

import { useClientValue } from './use-client'
import { mysteriesFor } from '@/lib/rosary'
import { Mysteries } from './rosary-mysteries'
import { formatLong } from '@/lib/liturgical'

function localISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Today's mysteries by the visitor's own date (the server's date is shown until the page loads). */
export function RosaryToday({ serverDate }: { serverDate: string }) {
  const date = useClientValue(localISO, serverDate)
  const set = mysteriesFor(date)
  return (
    <>
      <div className="text-center">
        <p className="eyebrow m-0">Holy Rosary · {formatLong(date)}</p>
        <h1 className="m-0 mt-2 font-serif text-[40px] font-semibold leading-[1.1] sm:text-[52px]">Today: the {set.name}</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">On {set.weekday}s{set.seasonal ? ' in this season' : ''} the Church invites us to pray the {set.name}. Read the Scripture passage before each decade, then pray one Our Father, ten Hail Marys and one Glory Be.</p>
      </div>
      <Mysteries set={set} />
    </>
  )
}
