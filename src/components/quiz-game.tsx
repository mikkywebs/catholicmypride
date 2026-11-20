'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useClientValue } from './use-client'
import { BOOK_WINS, QuizBookButton } from './quiz-book-card'
import { countries, countryName, flag } from '@/lib/country-codes'
import type { QuizQuestion } from '@/lib/types'

// Quiz Time: 10 questions, 30 seconds each, 8 correct to win.
// Name, country and wins are kept on this device only (nothing is sent to us).
const QUESTIONS = 10
const SECONDS = 30
const PASS = 8
const KEY = 'cmp-quiz-v1'

type Profile = { first: string; last: string; country: string }
type Certificate = { code: string; date: string; name: string; country: string }
type Saved = { profile: Profile | null; streak: number; wins: number; played: number; certificate: Certificate | null }
const EMPTY: Saved = { profile: null, streak: 0, wins: 0, played: 0, certificate: null }

function save(s: Saved) { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {} }

export function QuizGame({ logoUrl }: { logoUrl: string }) {
  const raw = useClientValue<string | null>(() => localStorage.getItem(KEY), null)
  const stored = useMemo<Saved>(() => { try { return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY } catch { return EMPTY } }, [raw])
  const [override, setSaved] = useState<Saved | null>(null)
  const saved = override ?? stored
  const update = (s: Saved) => { setSaved(s); save(s) }

  const [stage, setStage] = useState<'setup' | 'loading' | 'play' | 'result'>('setup')
  const [qs, setQs] = useState<QuizQuestion[]>([])
  const [idx, setIdx] = useState(0)
  const [picks, setPicks] = useState<(string | null)[]>([])
  const [locked, setLocked] = useState<string | null | undefined>(undefined)
  const [left, setLeft] = useState(SECONDS)
  const [error, setError] = useState('')
  const [newCert, setNewCert] = useState(false)
  const deadline = useRef(0)

  const start = async () => {
    setStage('loading'); setError(''); setNewCert(false)
    try {
      const r = await fetch('/api/quiz/round', { cache: 'no-store' })
      const data = (await r.json()) as QuizQuestion[]
      if (!Array.isArray(data) || data.length < QUESTIONS) throw new Error('not enough')
      setQs(data); setIdx(0); setPicks([]); setLocked(undefined); setLeft(SECONDS)
      deadline.current = Date.now() + SECONDS * 1000
      setStage('play')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Sorry, the quiz could not load. Please try again.'); setStage('setup')
    }
  }

  const finish = (all: (string | null)[]) => {
    const score = all.filter((p, i) => p === qs[i].correct).length
    const won = score >= PASS
    const streak = won ? saved.streak + 1 : 0
    let certificate = saved.certificate
    let issued = false
    if (won && streak >= 3 && !certificate && saved.profile) {
      const d = new Date()
      certificate = {
        code: `CMP-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        name: `${saved.profile.first} ${saved.profile.last}`.trim(),
        country: countryName(saved.profile.country),
      }
      issued = true
    }
    update({ ...saved, streak, wins: saved.wins + (won ? 1 : 0), played: saved.played + 1, certificate })
    setNewCert(issued)
    setStage('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (won) import('canvas-confetti').then(({ default: confetti }) => {
      const end = Date.now() + 2500
      const colors = ['#f2a65a', '#a64f0c', '#1f2430', '#ffffff']
      const frame = () => {
        confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0 }, colors })
        confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1 }, colors })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      confetti({ particleCount: 160, spread: 100, origin: { y: 0.6 }, colors })
      frame()
    }).catch(() => {})
  }

  const choose = (letter: string | null) => {
    if (locked !== undefined || stage !== 'play') return
    setLocked(letter)
    const all = [...picks, letter]
    setPicks(all)
    setTimeout(() => {
      if (all.length >= QUESTIONS) { finish(all); return }
      setIdx(all.length); setLocked(undefined); setLeft(SECONDS)
      deadline.current = Date.now() + SECONDS * 1000
    }, 1100)
  }

  // Countdown for the current question; running out of time counts as a wrong answer.
  useEffect(() => {
    if (stage !== 'play' || locked !== undefined) return
    const t = setInterval(() => {
      const s = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000))
      setLeft(s)
      if (s <= 0) choose(null)
    }, 250)
    return () => clearInterval(t)
  }) // re-armed every render on purpose: it always sees the latest state

  if (stage === 'setup' || stage === 'loading') return <Setup saved={saved} onSave={(p) => update({ ...saved, profile: p })} onStart={start} loading={stage === 'loading'} error={error} logoUrl={logoUrl} />

  if (stage === 'play') {
    const q = qs[idx]
    const opts = [['A', q.option_a], ['B', q.option_b], ['C', q.option_c], ['D', q.option_d]] as const
    return (
      <section className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-8">
        <div className="flex items-center justify-between gap-3 text-sm font-semibold">
          <span>Question {idx + 1} of {QUESTIONS}</span>
          <span className={left <= 5 ? 'text-[#b42318]' : 'text-muted'} aria-live="polite">⏱ {left}s</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-sky" aria-hidden="true">
          <div className={`h-full rounded-full transition-[width] duration-200 ${left <= 5 ? 'bg-[#d93025]' : 'bg-accent'}`} style={{ width: `${(left / SECONDS) * 100}%` }} />
        </div>
        <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-eyebrow">{q.topic}</p>
        <h2 className="m-0 font-serif text-[28px] font-semibold leading-snug sm:text-[32px]">{q.question}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {opts.map(([k, v]) => {
            const done = locked !== undefined
            const right = done && k === q.correct
            const wrong = done && locked === k && k !== q.correct
            return (
              <button key={k} type="button" disabled={done} onClick={() => choose(k)}
                className={`flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[17px] font-semibold transition ${right ? 'border-[#2e7d4f] bg-[#e3f1e8] text-[#1f5c38]' : wrong ? 'border-[#d93025] bg-[#fdecea] text-[#8c1d18]' : 'border-line bg-bg text-ink hover:border-accent'}`}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-sm">{k}</span>{v}
              </button>
            )
          })}
        </div>
        {locked === null && <p className="m-0 font-semibold text-[#b42318]">Time&apos;s up!</p>}
        <p className="m-0 text-sm text-muted">Score so far: {picks.filter((p, i) => p === qs[i].correct).length} · You need {PASS} of {QUESTIONS} to win.</p>
      </section>
    )
  }

  // Result
  const score = picks.filter((p, i) => p === qs[i].correct).length
  const won = score >= PASS
  const p = saved.profile
  const who = p ? `${p.first} ${p.last}`.trim() : 'friend'
  return (
    <section className="flex flex-col gap-5">
      <div className={`flex flex-col items-center gap-3 rounded-2xl px-6 py-9 text-center ${won ? 'bg-navy text-navy-ink' : 'border border-line bg-surface'}`}>
        <p className={`m-0 text-sm font-bold uppercase tracking-[0.2em] ${won ? 'text-gold' : 'text-eyebrow'}`}>{won ? 'Congratulations!' : 'Nice try!'}</p>
        <h2 className="m-0 font-serif text-[34px] font-semibold leading-tight sm:text-[44px]">
          {won ? <>Well done, {who}{p ? <> from {flag(p.country)} {countryName(p.country)}</> : ''}!</> : <>You scored {score} out of {QUESTIONS}</>}
        </h2>
        <p className={`m-0 text-lg ${won ? 'text-navy-muted' : 'text-muted'}`}>
          {won ? `You scored ${score} out of ${QUESTIONS}.` : `You need ${PASS} to win. Look at the answers below, then try again.`}
        </p>
        {won && (
          <div className="flex flex-wrap justify-center gap-2 pt-1 text-sm font-semibold">
            <span className="rounded-full bg-gold px-3 py-1 text-[#1f2430]">🏆 Winner × {saved.wins}</span>
            {!saved.certificate && <span className="rounded-full border border-gold px-3 py-1">{saved.streak} of 3 wins in a row for a certificate</span>}
          </div>
        )}
        {saved.certificate && (newCert || won) && (
          <div className="flex flex-col items-center gap-2 pt-2">
            {newCert && <p className="m-0 font-semibold">🎓 Three wins in a row! Your certificate is ready.</p>}
            <button type="button" onClick={() => downloadCertificate(saved.certificate!, logoUrl)} className="rounded-md bg-gold px-6 py-3 font-bold text-[#1f2430]">Download my certificate (PDF)</button>
          </div>
        )}
        {won && p && (saved.wins >= BOOK_WINS ? (
          <div className="flex flex-col items-center gap-2 pt-2">
            {saved.wins === BOOK_WINS && <p className="m-0 font-semibold">📘 Three wins! Your free ebook, written specially for you, is ready.</p>}
            <QuizBookButton name={who} country={countryName(p.country)} logoUrl={logoUrl} />
          </div>
        ) : (
          <p className="m-0 text-sm text-navy-muted">📘 Win {BOOK_WINS - saved.wins} more {BOOK_WINS - saved.wins === 1 ? 'time' : 'times'} (not necessarily in a row) to unlock your free personalised ebook.</p>
        ))}
        <button type="button" onClick={start} className={`mt-2 rounded-md px-6 py-3 font-semibold ${won ? 'border border-navy-muted text-navy-ink' : 'bg-accent text-accent-ink'}`}>{won ? 'Play again' : 'Try again'}</button>
      </div>

      {!won && (
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {qs.map((q, i) => {
            const pick = picks[i]
            const ok = pick === q.correct
            const text = (k: string | null) => (k ? `${k}. ${q[`option_${k.toLowerCase()}` as 'option_a']}` : 'No answer (time ran out)')
            return (
              <li key={q.id} className={`flex flex-col gap-1.5 rounded-2xl border px-5 py-4 ${ok ? 'border-[#2e7d4f]/50 bg-[#e3f1e8]/50' : 'border-[#d93025]/40 bg-surface'}`}>
                <strong>{i + 1}. {q.question}</strong>
                {!ok && <span className="text-[15px] text-[#8c1d18]">Your answer: {text(pick ?? null)}</span>}
                <span className="text-[15px] font-semibold text-[#1f5c38]">Correct answer: {text(q.correct)}</span>
                {q.explanation && <span className="text-[15px] text-body">{q.explanation}</span>}
                {q.source && <span className="text-sm text-muted">Source: {q.source}</span>}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

function Setup({ saved, onSave, onStart, loading, error, logoUrl }: { saved: Saved; onSave: (p: Profile) => void; onStart: () => void; loading: boolean; error: string; logoUrl: string }) {
  // Built in the browser only: server and browser can spell some country names differently.
  const inBrowser = useClientValue<boolean>(() => true, false)
  const list = useMemo(() => (inBrowser && 'DisplayNames' in Intl ? countries() : []), [inBrowser])
  const [editing, setEditing] = useState(false)
  const p = saved.profile
  const field = 'min-h-12 w-full rounded-lg border border-field bg-surface px-3 text-ink'
  if (p && !editing) {
    return (
      <section className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-9 text-center">
        <p className="m-0 text-4xl" aria-hidden="true">{flag(p.country)}</p>
        <h2 className="m-0 font-serif text-[34px] font-semibold">Welcome back, {p.first}!</h2>
        <div className="flex flex-wrap justify-center gap-2 text-sm font-semibold">
          <span className="rounded-full bg-sky px-3 py-1">Played {saved.played}</span>
          <span className="rounded-full bg-sky px-3 py-1">🏆 Won {saved.wins}</span>
          <span className="rounded-full bg-sky px-3 py-1">🔥 {saved.streak} in a row</span>
        </div>
        {saved.certificate && (
          <button type="button" onClick={() => downloadCertificate(saved.certificate!, logoUrl)} className="text-sm font-semibold text-accent">🎓 Download my certificate again</button>
        )}
        <p className="m-0 max-w-md text-muted">10 questions · 30 seconds each · get {PASS} right to win. Win 3 times in a row for a certificate.</p>
        {error && <p role="alert" className="m-0 font-semibold text-[#b42318]">{error}</p>}
        <button type="button" onClick={onStart} disabled={loading} className="rounded-md bg-accent px-8 py-3.5 text-lg font-bold text-accent-ink disabled:opacity-50">{loading ? 'Loading…' : 'Start the quiz'}</button>
        <button type="button" onClick={() => setEditing(true)} className="text-sm text-muted">Not {p.first}? Change name</button>
      </section>
    )
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const f = new FormData(e.currentTarget)
        const prof = { first: String(f.get('first') ?? '').trim().slice(0, 40), last: String(f.get('last') ?? '').trim().slice(0, 40), country: String(f.get('country') ?? '') }
        if (!prof.first || !prof.country) return
        onSave(prof); setEditing(false); onStart()
      }}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 sm:p-8"
    >
      <h2 className="m-0 font-serif text-[30px] font-semibold">Who is playing?</h2>
      <p className="m-0 text-muted">Your name and country appear when you win and on your certificate. They stay on this device and are not sent to us.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">First name<input name="first" required maxLength={40} defaultValue={p?.first} autoComplete="given-name" className={field} /></label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Last name<input name="last" maxLength={40} defaultValue={p?.last} autoComplete="family-name" className={field} /></label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">Country
        <select key={list.length} name="country" required defaultValue={p?.country ?? ''} className={field}>
          <option value="">Choose your country…</option>
          {list.map((c) => <option key={c.code} value={c.code}>{flag(c.code)} {c.name}</option>)}
        </select>
      </label>
      <p className="m-0 text-sm text-muted">10 questions · 30 seconds each · get {PASS} right to win. Win 3 times in a row for a certificate.</p>
      {error && <p role="alert" className="m-0 font-semibold text-[#b42318]">{error}</p>}
      <button disabled={loading} className="self-start rounded-md bg-accent px-8 py-3.5 text-lg font-bold text-accent-ink disabled:opacity-50">{loading ? 'Loading…' : 'Start the quiz'}</button>
    </form>
  )
}

/** A4 landscape certificate in the apostolate's colours, made in the browser. */
async function downloadCertificate(c: Certificate, logoUrl: string) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = 297, H = 210
  const navy: [number, number, number] = [31, 36, 48]
  const gold: [number, number, number] = [242, 166, 90]
  const brown: [number, number, number] = [166, 79, 12]
  doc.setFillColor(247, 243, 232); doc.rect(0, 0, W, H, 'F')
  doc.setFillColor(...navy); doc.rect(0, 0, W, 14, 'F'); doc.rect(0, H - 14, W, 14, 'F')
  doc.setDrawColor(...gold); doc.setLineWidth(1.2); doc.rect(10, 20, W - 20, H - 40)
  doc.setLineWidth(0.4); doc.rect(13, 23, W - 26, H - 46)
  try {
    const blob = await (await fetch(logoUrl)).blob()
    const data = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(blob) })
    doc.addImage(data, data.includes('image/png') ? 'PNG' : 'JPEG', W / 2 - 13, 27, 26, 26)
  } catch {}
  const center = (text: string, y: number, size: number, style: 'normal' | 'bold' | 'italic' | 'bolditalic', color: [number, number, number], font = 'times') => {
    doc.setFont(font, style); doc.setFontSize(size); doc.setTextColor(...color); doc.text(text, W / 2, y, { align: 'center' })
  }
  center('CATHOLIC MY PRIDE APOSTOLATE', 62, 11, 'bold', brown, 'helvetica')
  center('Certificate of Achievement', 78, 34, 'bold', navy)
  center('This certificate is proudly presented to', 92, 13, 'italic', [90, 90, 90])
  const name = c.name.normalize('NFKD').replace(/[^\x20-\xFF]/g, '') || c.name
  center(name, 110, 34, 'bolditalic', brown)
  doc.setDrawColor(...gold); doc.setLineWidth(0.6); doc.line(W / 2 - 70, 114, W / 2 + 70, 114)
  center(`of ${c.country}`, 123, 14, 'normal', navy)
  center('for answering the Catholic Quiz correctly in three rounds in a row,', 136, 13, 'normal', [60, 60, 60])
  center('a joyful sign of love for learning the Catholic faith.', 143, 13, 'normal', [60, 60, 60])
  doc.setFont('times', 'normal'); doc.setFontSize(11); doc.setTextColor(...navy)
  doc.text(`Date: ${c.date}`, 40, 168)
  doc.text(`Certificate no. ${c.code}`, 40, 175)
  doc.setDrawColor(...navy); doc.setLineWidth(0.3); doc.line(W - 110, 166, W - 40, 166)
  doc.setFont('times', 'bolditalic'); doc.setFontSize(13); doc.text('Catholic My Pride', W - 75, 172, { align: 'center' })
  doc.setFont('times', 'normal'); doc.setFontSize(10); doc.text('Apostolate', W - 75, 177, { align: 'center' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(247, 243, 232)
  doc.text('www.catholicmypride.org  ·  Quiz Time', W / 2, H - 5.5, { align: 'center' })
  doc.save(`Catholic-My-Pride-Certificate-${name.replace(/\s+/g, '-')}.pdf`)
}
