import type { MysterySet } from '@/lib/rosary'

/** The five mysteries of a set, each with its Scripture verse and passage. */
export function Mysteries({ set, compact = false }: { set: MysterySet; compact?: boolean }) {
  return (
    <ol className={`m-0 flex list-none flex-col p-0 ${compact ? 'mt-3 gap-3' : 'gap-4'}`}>
      {set.mysteries.map((m, n) => (
        <li key={m.title} className={compact ? 'text-[15px]' : 'flex gap-4 rounded-2xl border border-line bg-surface px-5 py-5 sm:px-7'}>
          {!compact && <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-serif text-xl font-bold text-eyebrow">{n + 1}</span>}
          <div className="flex flex-col gap-1.5">
            <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-eyebrow">{['First', 'Second', 'Third', 'Fourth', 'Fifth'][n]} {set.name.replace('Mysteries', 'Mystery')}</p>
            <h3 className={`m-0 font-serif font-semibold leading-tight ${compact ? 'text-[19px]' : 'text-[26px]'}`}>{m.title}</h3>
            <p className={`m-0 font-serif italic text-body ${compact ? 'text-[16px]' : 'text-[19px]'}`}>“{m.verse}” <span className="not-italic text-muted">({m.verseRef})</span></p>
            <p className="m-0 text-sm text-muted">Read: <strong className="text-ink">{m.passage}</strong> · Fruit of the mystery: {m.fruit}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
