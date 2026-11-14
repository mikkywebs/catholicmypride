'use client'

import { useActionState } from 'react'
import { signIn, type FormState } from '../actions'

const input = 'min-h-11 rounded-lg border border-field bg-surface px-3 text-ink'

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, null)
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Email<input name="email" type="email" autoComplete="username" required className={input} /></label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Password<input name="password" type="password" autoComplete="current-password" required className={input} /></label>
      {state && !state.ok && <p role="alert" className="m-0 text-sm font-semibold text-[#b42318]">{state.message}</p>}
      <button type="submit" disabled={pending} className="min-h-12 rounded-md bg-accent font-semibold text-accent-ink disabled:opacity-50">{pending ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}
