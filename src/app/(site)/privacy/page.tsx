import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal'

export const metadata: Metadata = { title: 'Privacy Policy', description: 'Our privacy policy: what we collect, why, and your choices.', alternates: { canonical: '/privacy' } }

const SECTIONS = [
  { title: "Who we are", body: "Catholic My Pride Apostolate (\"we\") runs catholicmypride.org. This policy explains what personal information we collect, why, and the choices you have. Contact us at cmpapostolate@gmail.com." },
  { title: "What we collect", body: "Information you give us: your name, email and country when you send a prayer request or a contact message, and anything you write in it.\nInformation collected automatically: the pages you visit and your approximate country, worked out from your connection. We do not store your IP address or exact location.\nReactions (such as Amen or Wow) and \"I prayed\" taps are counted anonymously." },
  { title: "How we use it", body: "To pray for your intentions, reply to your messages, keep the website secure and working, and understand which content helps people most. We never sell your information." },
  { title: "Prayer requests", body: "Requests marked private are seen only by our prayer team. Public requests appear on the Prayer Wall only after a moderator approves them, showing just your first name, country and intention. Your email is never shown. You can ask us to remove a request at any time." },
  { title: "Payments and donations", body: "Donations and book purchases are handled by our payment partner. We do not see or store your card details." },
  { title: "Where your data is stored", body: "Our database and files are hosted by Supabase and the website by Vercel. They process data on our behalf under their own security and privacy terms." },
  { title: "Cookies and local storage", body: "We use only what the site needs to work and to remember your choices, such as dark mode and music volume. See our Cookie Policy." },
  { title: "How long we keep it", body: "Prayer requests and contact messages are kept for up to 12 months, then deleted, unless you ask us to delete them sooner. Visit statistics are kept in summary form." },
  { title: "Your rights", body: "Under the Nigeria Data Protection Act 2023 and similar laws where you live, you can ask to see, correct or delete the information we hold about you, or object to how we use it. Write to cmpapostolate@gmail.com." },
  { title: "Children", body: "Our content is suitable for all ages, but we do not knowingly collect personal information from children under 13 without a parent's consent." },
  { title: "Changes to this policy", body: "We may update this policy. The date at the top shows when it last changed." },
]

export default function Page() {
  return <LegalPage title="Privacy Policy" current="/privacy" updated="14 November 2026" sections={SECTIONS} />
}
