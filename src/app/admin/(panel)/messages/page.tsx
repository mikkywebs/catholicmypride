import { requireAdmin } from '@/lib/admin'
import { deleteMessage, deleteReadMessages, markMessage } from '../../actions'
import { ConfirmButton } from '@/components/admin/confirm-button'

export default async function Page() {
  const { db } = await requireAdmin()
  const { data: rows } = await db.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(200)
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 font-serif text-[38px] font-semibold">Messages</h1>
        {(rows ?? []).some((m) => m.is_read) && (
          <form action={deleteReadMessages}>
            <ConfirmButton message="Delete all messages already marked as read? This cannot be undone." className="rounded-md border border-field bg-surface px-4 py-2 text-sm font-semibold text-[#b42318]">Delete all read messages</ConfirmButton>
          </form>
        )}
      </div>
      {(rows ?? []).length === 0 && <p className="rounded-2xl border border-line bg-surface p-8 text-center text-muted">No messages yet.</p>}
      {(rows ?? []).map((m) => (
        <article key={m.id} className={`flex flex-col gap-2 rounded-2xl border bg-surface px-6 py-5 ${m.is_read ? 'border-line' : 'border-accent'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><strong>{m.name}</strong> <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject ?? 'your message'))}`}>{m.email}</a>{m.subject && <span className="text-muted"> · {m.subject}</span>}</div>
            <span className="text-sm text-muted">{new Date(m.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
          <p className="m-0 whitespace-pre-line">{m.message}</p>
          <div className="flex gap-3 pt-1 text-sm">
            <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject ?? 'your message'))}`} className="font-semibold">Reply by email</a>
            <form action={markMessage.bind(null, m.id, !m.is_read)}><button className="text-muted">{m.is_read ? 'Mark unread' : 'Mark read'}</button></form>
            <form action={deleteMessage.bind(null, m.id)}><ConfirmButton message={`Delete the message from ${m.name}? This cannot be undone.`} className="font-semibold text-[#b42318]">Delete</ConfirmButton></form>
          </div>
        </article>
      ))}
    </div>
  )
}
