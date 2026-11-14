import { ButtonLink, H1 } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center gap-4 px-6 py-24 text-center">
      <p className="eyebrow m-0">Page not found</p>
      <H1>We couldn&apos;t find that page</H1>
      <p className="m-0 text-muted">It may have moved, or it hasn&apos;t been published yet.</p>
      <ButtonLink href="/">Go to the home page</ButtonLink>
    </div>
  )
}
