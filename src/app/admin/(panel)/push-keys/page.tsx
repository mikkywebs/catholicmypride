import { requireAdmin } from '@/lib/admin'
import { KeyMaker } from './key-maker'

// Makes the two keys that prayer-time reminders need, inside your own browser. Nothing is sent or saved.
export default async function Page() {
  await requireAdmin()
  const ready = Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
  return (
    <div className="flex max-w-[860px] flex-col gap-5">
      <h1 className="m-0 font-serif text-[38px] font-semibold">Prayer reminder keys</h1>
      {ready ? (
        <p className="m-0 rounded-lg bg-sky px-4 py-3">✓ Both keys are set in Vercel. Prayer-time reminders are switched on. Don&apos;t make new keys: that would switch off every phone that has already signed up.</p>
      ) : (
        <>
          <p className="m-0 text-muted">Phone reminders need a pair of keys. Press the button: the keys are made here in your browser and are never sent anywhere or saved. Then copy each one into Vercel.</p>
          <KeyMaker />
          <ol className="m-0 flex flex-col gap-2 pl-5">
            <li>In Vercel, open your project → <strong>Settings</strong> → <strong>Environment Variables</strong>.</li>
            <li>Add <code>NEXT_PUBLIC_VAPID_PUBLIC_KEY</code> with the <strong>public key</strong>.</li>
            <li>Add <code>VAPID_PRIVATE_KEY</code> with the <strong>private key</strong>.</li>
            <li>Go to <strong>Deployments</strong>, open the top one, press <strong>⋯ → Redeploy</strong>.</li>
            <li>Come back to this page: it will say the keys are set.</li>
          </ol>
        </>
      )}
    </div>
  )
}
