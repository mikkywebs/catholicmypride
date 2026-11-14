import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal'

export const metadata: Metadata = { title: 'Terms of Use', description: 'The terms for using catholicmypride.org.', alternates: { canonical: '/terms' } }

const SECTIONS = [
  { title: "Accepting these terms", body: "By using catholicmypride.org you agree to these terms. If you do not agree, please do not use the site." },
  { title: "Our content", body: "Prayers, reflections, songs, ebooks, images and other content on this site belong to Catholic My Pride or are used with permission. You may share links and short quotes with credit. Please do not republish whole works without written permission." },
  { title: "Downloads", body: "Songs and free ebooks offered for download are for personal, non-commercial use unless we say otherwise." },
  { title: "Scripture and liturgical texts", body: "Scripture readings and liturgical texts remain the property of their copyright holders and are shown for personal prayer." },
  { title: "Prayer requests and messages", body: "Please share only what you are comfortable making public on the Prayer Wall. Do not post links, advertising, offensive content or other people's private information. We may edit, decline or remove any request." },
  { title: "Purchases", body: "Paid ebooks are sold through our payment partner, whose terms also apply. Contact us if there is a problem with a purchase." },
  { title: "Links to other sites", body: "We are not responsible for the content of websites we link to." },
  { title: "Changes and availability", body: "We may change or pause any part of the site at any time." },
  { title: "Contact", body: "Questions about these terms: contact@catholicmypride.org." },
]

export default function Page() {
  return <LegalPage title="Terms of Use" current="/terms" updated="14 November 2026" sections={SECTIONS} />
}
