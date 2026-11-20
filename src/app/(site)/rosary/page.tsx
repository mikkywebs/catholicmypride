import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { ShareBar } from '@/components/engage'
import { StayConnected } from '@/components/whatsapp-join'
import { getSettings } from '@/lib/data'
import { todayISO } from '@/lib/liturgical'
import { MYSTERIES } from '@/lib/rosary'
import { Mysteries } from '@/components/rosary-mysteries'
import { RosaryToday } from '@/components/rosary-today'

export const metadata: Metadata = {
  title: 'Holy Rosary: Today’s Mysteries with Scripture',
  description: 'Pray the Holy Rosary with Catholic My Pride: today’s mysteries with a Scripture passage for each, how to pray the Rosary, and which mysteries to pray each day.',
  alternates: { canonical: '/rosary' },
}

export default function Page() {
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-10 px-6 pb-[72px] pt-10">
      <Suspense fallback={<div className="h-[600px]" />}><Today /></Suspense>
      <HowTo />
      <section className="flex flex-col gap-4">
        <h2 className="m-0 border-b border-line pb-2.5 font-serif text-[32px] font-semibold">The mysteries for each day</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.values(MYSTERIES).map((set) => (
            <details key={set.key} className="rounded-2xl border border-line bg-surface px-5 py-4">
              <summary className="cursor-pointer"><strong className="font-serif text-[22px]">{set.name}</strong><span className="block text-sm text-muted">{set.days}</span></summary>
              <Mysteries set={set} compact />
            </details>
          ))}
        </div>
        <p className="m-0 text-sm text-muted">Weekly pattern of Saint John Paul II (Rosarium Virginis Mariae, 2002). Many Catholics pray the Joyful Mysteries on the Sundays of Advent and Christmas, and the Sorrowful Mysteries on the Sundays of Lent, as we do here.</p>
      </section>
    </div>
  )
}

async function Today() {
  await connection()
  const s = await getSettings()
  return (
    <>
      <RosaryToday serverDate={todayISO()} />
      <ShareBar title="Holy Rosary: today’s mysteries with Scripture" />
      <StayConnected s={{ whatsapp_channel_url: s.whatsapp_channel_url, youtube_url: s.youtube_url, facebook_url: s.facebook_url, x_url: s.x_url }} />
    </>
  )
}

function HowTo() {
  const steps: [string, string][] = [
    ['Sign of the Cross and the Apostles’ Creed', 'I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.'],
    ['One Our Father', 'Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.'],
    ['Three Hail Marys, for faith, hope and charity', 'Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.'],
    ['Glory Be', 'Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.'],
    ['Five decades', 'For each mystery: announce it and read its Scripture passage, then pray one Our Father, ten Hail Marys and one Glory Be. Many add the Fatima Prayer: “O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to heaven, especially those in most need of thy mercy.”'],
    ['Hail, Holy Queen', 'Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us; and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.'],
  ]
  return (
    <section className="flex flex-col gap-4">
      <h2 className="m-0 border-b border-line pb-2.5 font-serif text-[32px] font-semibold">How to pray the Rosary</h2>
      <ol className="m-0 flex flex-col gap-2.5 p-0">
        {steps.map(([t, p], n) => (
          <li key={t} className="list-none">
            <details className="rounded-2xl border border-line bg-surface px-5 py-3.5">
              <summary className="cursor-pointer font-semibold">{n + 1}. {t}</summary>
              <p className="mb-1 mt-2.5 font-serif text-[18px] leading-relaxed text-body">{p}</p>
            </details>
          </li>
        ))}
      </ol>
      <p className="m-0 text-muted">Find more prayers and chaplets on our <Link href="/chaplets">Chaplets</Link> page.</p>
    </section>
  )
}
