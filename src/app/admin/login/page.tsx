import { Suspense } from 'react'
import { LoginForm } from './login-form'

export default function Page(props: PageProps<'/admin/login'>) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col gap-5 rounded-2xl border border-line bg-surface p-8">
        <div><p className="eyebrow m-0">Catholic My Pride</p><h1 className="m-0 font-serif text-[34px] font-semibold">Admin sign in</h1></div>
        <Suspense><Note searchParams={props.searchParams} /></Suspense>
        <LoginForm />
      </div>
    </div>
  )
}

async function Note({ searchParams }: { searchParams: PageProps<'/admin/login'>['searchParams'] }) {
  const sp = await searchParams
  if (sp.error !== 'not-admin') return null
  return <p role="alert" className="m-0 rounded-lg bg-[#fbe7dc] p-3 text-sm text-[#9a3412]">This account is not an admin. Ask the site owner to add you.</p>
}
