/** Hand-drawn style divider: rule · cross · rule. Decorative only. */
export function Ornament({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-4 ${className}`}>
      <span className="h-px w-16 bg-current opacity-50 sm:w-28" />
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="17" cy="17" r="15" opacity="0.5" />
        <path d="M17 6v22M10 13h14" strokeWidth="2.2" />
        <path d="M13 6.5h8M13 27.5h8M8.5 10v6M25.5 10v6" opacity="0.6" />
      </svg>
      <span className="h-px w-16 bg-current opacity-50 sm:w-28" />
    </div>
  )
}

export function Fleuron({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c1.2 3 3.6 4.8 7 5-3 1.4-4.6 3.6-5 7 2-1.6 4.4-2 7-1-3 1.2-5.4 3.4-7 7h-4c-1.6-3.6-4-5.8-7-7 2.6-1 5-.6 7 1-.4-3.4-2-5.6-5-7 3.4-.2 5.8-2 7-5z" />
    </svg>
  )
}
