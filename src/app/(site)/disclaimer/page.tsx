import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal'

export const metadata: Metadata = { title: 'Disclaimer', description: 'Important information about the content on catholicmypride.org.', alternates: { canonical: '/disclaimer' } }

const SECTIONS = [
  { title: "Faith content", body: "Our reflections and articles are offered to help you pray and grow in faith. They are not official teaching documents of the Church. For official teaching, consult the Catechism of the Catholic Church and your local bishops." },
  { title: "Not professional advice", body: "Nothing on this site is medical, legal, financial or psychological advice. If you are in crisis, please contact local emergency services or a trusted priest or counsellor." },
  { title: "Church directory", body: "We do our best to keep church names and addresses accurate, but please confirm Mass times and details with the parish directly." },
  { title: "Prayer Wall", body: "Prayer intentions are shared by visitors. We moderate them, but the views expressed are those of the people who wrote them." },
]

export default function Page() {
  return <LegalPage title="Disclaimer" current="/disclaimer" updated="14 November 2026" sections={SECTIONS} />
}
