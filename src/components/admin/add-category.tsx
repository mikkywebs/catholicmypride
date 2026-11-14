'use client'

import { useActionState } from 'react'
import type { FormState } from '@/app/admin/actions'

export function AddCategory({ action, kindLabel }: { action: (s: FormState, f: FormData) => Promise<FormState>; kindLabel: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null)
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2.5">
        <label className="sr-only" htmlFor="new-cat">New category name</label>
        <input id="new-cat" name="name" placeholder={`New ${kindLabel.toLowerCase()} category`} className="min-h-11 flex-1 basis-56 rounded-lg border border-field bg-surface px-3" />
        <button disabled={pending} className="min-h-11 rounded-md bg-navy px-5 font-semibold text-navy-ink disabled:opacity-50">Add category</button>
      </div>
      {state && <p role="status" className={`m-0 text-sm ${state.ok ? 'text-[#1f5c38]' : 'text-[#b42318]'}`}>{state.message}</p>}
    </form>
  )
}
