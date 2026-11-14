import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal'

export const metadata: Metadata = { title: 'Cookie Policy', description: 'How catholicmypride.org uses cookies and browser storage.', alternates: { canonical: '/cookies' } }

const SECTIONS = [
  { title: "What we use", body: "We do not use advertising or tracking cookies. We use your browser's storage only to remember your choices." },
  { title: "What is remembered", body: "Your day or dark mode choice.\nYour music bar volume and whether it is muted or paused.\nWhich reactions you chose and which prayer requests you prayed for, so the buttons show correctly.\nFor our team only: a sign-in cookie for the admin area." },
  { title: "Visit statistics", body: "We count page visits on our own servers, with country only. No third-party analytics cookies are set." },
  { title: "Your choices", body: "You can clear this storage at any time in your browser settings. The site will still work; it will just forget your choices." },
]

export default function Page() {
  return <LegalPage title="Cookie Policy" current="/cookies" updated="14 November 2026" sections={SECTIONS} />
}
