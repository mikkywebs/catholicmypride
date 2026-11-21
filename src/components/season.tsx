import Link from 'next/link'
import type { Art, SeasonTheme } from '@/lib/season-theme'

/** Sets the season colours for the whole page (used by the ribbon, banner and hero accent). */
export function SeasonVars({ theme }: { theme: SeasonTheme }) {
  return <style>{`:root{--season:${theme.color};--season-tint:${theme.tint};--season-on-dark:${theme.onDark}}`}</style>
}

/** Slim ribbon under the menu on every page. */
export function SeasonRibbon({ theme }: { theme: SeasonTheme }) {
  return (
    <div className="season-ribbon border-b px-6 py-2 text-[15px]">
      <SeasonVars theme={theme} />
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-3 gap-y-1">
        <SeasonArt art={theme.art} candles={theme.candles} className="h-7 w-10 shrink-0" />
        <span className="season-text text-xs font-bold uppercase tracking-[0.14em]">{theme.eyebrow}</span>
        <span className="min-w-0 flex-1 basis-56 font-serif text-[18px] font-semibold text-ink">{theme.title}</span>
        <Link href={theme.href} className="season-text hidden whitespace-nowrap text-sm font-semibold sm:inline">{theme.cta} →</Link>
      </div>
    </div>
  )
}

/** Larger decoration on the home page. */
export function SeasonBanner({ theme }: { theme: SeasonTheme }) {
  return (
    <section className="reveal px-6 pt-14">
      <div className="season-banner mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-10 gap-y-4 rounded-[18px] border px-6 py-7 sm:px-10">
        <SeasonArt art={theme.art} candles={theme.candles} className="mx-auto h-36 w-52 shrink-0 sm:mx-0" />
        <div className="flex min-w-0 flex-1 basis-80 flex-col gap-2 text-center sm:text-left">
          <p className="season-text m-0 text-xs font-bold uppercase tracking-[0.18em]">{theme.eyebrow}</p>
          <h2 className="m-0 font-serif text-[34px] font-semibold leading-tight sm:text-[40px]">{theme.title}</h2>
          <p className="m-0 font-serif text-[19px] italic text-body">“{theme.line}”{theme.cite && <span className="not-italic text-muted"> · {theme.cite}</span>}</p>
          <Link href={theme.href} className="season-text pt-1 font-semibold">{theme.cta} →</Link>
        </div>
      </div>
    </section>
  )
}

const VIOLET = '#6b4a9b'
const ROSE = '#c66a92'
const GOLD = '#e0a93b'
const GREEN = '#3f6b45'
const WOOD = '#8a5a35'
const BLUE = '#3c6ea8'
const starPath = (cx: number, cy: number, r: number) => Array.from({ length: 10 }, (_, k) => { const a = -Math.PI / 2 + (k * Math.PI) / 5; const rr = k % 2 ? r * 0.45 : r; return `${k ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}` }).join(' ') + 'Z'

/** Hand-drawn seasonal pictures. Light enough to sit in a ribbon or a banner. */
export function SeasonArt({ art, candles = 0, className = '' }: { art: Art; candles?: number; className?: string }) {
  const label: Record<Art, string> = {
    wreath: `Advent wreath with ${candles} of 4 candles lit`, star: 'Star of Bethlehem', newyear: 'Star with sparkles for the New Year',
    cross: 'A simple cross with a violet cloth', palm: 'Palm branches', chalice: 'Chalice and host', baretree: 'The wooden cross',
    tomb: 'The empty tomb at sunrise', risen: 'The cross at sunrise with lilies', flame: 'Flames of the Holy Spirit', crown: 'A royal crown with a cross, for Christ the King', lily: 'A white lily under twelve stars, for the Immaculate Conception', stars: 'The sun, the moon and a crown of twelve stars, for the Assumption', monstrance: 'A golden monstrance with the Sacred Host', heart: 'The Sacred Heart of Jesus with flames and a cross',
  }
  return (
    <svg viewBox="0 0 200 140" role="img" aria-label={label[art]} className={className}>
      {art === 'wreath' && (
        <g>
          <ellipse cx="100" cy="114" rx="84" ry="20" fill="none" stroke={GREEN} strokeWidth="12" />
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2
            return <ellipse key={i} cx={100 + Math.cos(a) * 84} cy={114 + Math.sin(a) * 20} rx="9" ry="5" fill="#2f5536" transform={`rotate(${(a * 180) / Math.PI + 30} ${100 + Math.cos(a) * 84} ${114 + Math.sin(a) * 20})`} />
          })}
          {[[40, 98, VIOLET], [78, 92, VIOLET], [122, 92, ROSE], [160, 98, VIOLET]].map(([x, y, c], i) => (
            <g key={i}>
              <rect x={Number(x) - 7} y={Number(y) - 48} width="14" height="48" rx="2" fill={String(c)} />
              {/* Week 1 lights the first violet candle, week 2 the second, week 3 the rose one, week 4 the last. */}
              {[0, 1, 2, 3].indexOf(i) < candles
                ? <path className="cmp-flame" d={`M${x} ${Number(y) - 64} C ${Number(x) + 7} ${Number(y) - 55}, ${Number(x) + 5} ${Number(y) - 49}, ${x} ${Number(y) - 49} C ${Number(x) - 5} ${Number(y) - 49}, ${Number(x) - 7} ${Number(y) - 55}, ${x} ${Number(y) - 64} Z`} fill={GOLD} />
                : <line x1={x} y1={Number(y) - 48} x2={x} y2={Number(y) - 53} stroke="#333" strokeWidth="1.5" />}
            </g>
          ))}
          {[30, 70, 130, 170].map((x, i) => <circle key={i} cx={x} cy={i % 2 ? 126 : 104} r="3.5" fill="#b3261e" />)}
        </g>
      )}
      {(art === 'star' || art === 'newyear') && (
        <g>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2
            const r = i % 2 ? 34 : 56
            return <line key={i} x1={100 + Math.cos(a) * 18} y1={58 + Math.sin(a) * 18} x2={100 + Math.cos(a) * r} y2={58 + Math.sin(a) * r} stroke={GOLD} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          })}
          <path d="M100 22 L108 50 L136 58 L108 66 L100 94 L92 66 L64 58 L92 50 Z" fill={GOLD} />
          {art === 'star'
            ? <path d="M60 136 L60 112 L100 90 L140 112 L140 136 Z M88 136 L88 118 L112 118 L112 136" fill="none" stroke={WOOD} strokeWidth="4" strokeLinejoin="round" />
            : [[34, 30], [166, 34], [40, 110], [160, 108], [70, 124], [132, 126]].map(([x, y], i) => (
              <path key={i} className="cmp-flame" d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`} fill={i % 2 ? GOLD : '#c9a227'} />
            ))}
        </g>
      )}
      {art === 'cross' && (
        <g>
          <rect x="94" y="14" width="12" height="116" rx="2" fill={WOOD} />
          <rect x="64" y="38" width="72" height="12" rx="2" fill={WOOD} />
          <path d="M70 50 C 82 60, 118 60, 130 50 L 124 90 C 112 82, 88 82, 76 90 Z" fill={VIOLET} opacity="0.9" />
        </g>
      )}
      {art === 'palm' && (
        <g fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round">
          {[[-1, 70], [1, 130]].map(([dir, x], k) => (
            <g key={k}>
              <path d={`M${x} 132 C ${Number(x) + Number(dir) * 6} 90, ${Number(x) - Number(dir) * 10} 50, ${Number(x) + Number(dir) * 16} 14`} />
              {Array.from({ length: 9 }, (_, i) => {
                const y = 120 - i * 12
                const cx = Number(x) + Number(dir) * (i * 1.8)
                return <g key={i}><path d={`M${cx} ${y} q -14 -4 -22 -14`} /><path d={`M${cx} ${y} q 14 -4 22 -14`} /></g>
              })}
            </g>
          ))}
        </g>
      )}
      {art === 'chalice' && (
        <g>
          <circle cx="100" cy="34" r="20" fill="#fffaf0" stroke={GOLD} strokeWidth="3" />
          <path d="M100 22 V46 M88 34 H112" stroke={GOLD} strokeWidth="3" />
          <path d="M66 58 H134 C 134 86, 116 98, 100 98 C 84 98, 66 86, 66 58 Z" fill={GOLD} />
          <rect x="96" y="98" width="8" height="18" fill={GOLD} />
          <path d="M76 128 C 80 116, 120 116, 124 128 Z" fill={GOLD} />
        </g>
      )}
      {art === 'baretree' && (
        <g>
          <rect x="94" y="10" width="12" height="122" rx="1" fill="#5b3b22" />
          <rect x="62" y="36" width="76" height="12" rx="1" fill="#5b3b22" />
          <ellipse cx="100" cy="42" rx="13" ry="7" fill="none" stroke="#3f5a35" strokeWidth="3" strokeDasharray="4 3" />
          <path d="M40 134 H160" stroke="#5c5f66" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {(art === 'tomb' || art === 'risen') && (
        <g>
          {Array.from({ length: 11 }, (_, i) => {
            const a = Math.PI + (i / 10) * Math.PI
            return <line key={i} x1={100 + Math.cos(a) * 34} y1={96 + Math.sin(a) * 34} x2={100 + Math.cos(a) * 66} y2={96 + Math.sin(a) * 66} stroke={GOLD} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          })}
          <path d="M70 96 A 30 30 0 0 1 130 96 Z" fill={GOLD} opacity="0.85" />
          {art === 'tomb' ? (
            <g>
              <path d="M44 132 C 44 92, 92 84, 104 96 C 116 108, 124 132, 124 132 Z" fill="#9b958a" />
              <path d="M66 132 C 66 112, 92 108, 96 132 Z" fill="#2c2a27" />
              <circle cx="146" cy="118" r="16" fill="#b8b2a6" />
            </g>
          ) : (
            <g>
              <rect x="96" y="40" width="8" height="92" fill={WOOD} />
              <rect x="80" y="58" width="40" height="8" fill={WOOD} />
              {[[52, 1], [148, -1]].map(([x, d], i) => (
                <g key={i}>
                  <path d={`M${x} 134 C ${x} 118, ${Number(x) + Number(d) * 4} 108, ${Number(x) + Number(d) * 2} 100`} stroke={GREEN} strokeWidth="3" fill="none" />
                  <path d={`M${Number(x) + Number(d) * 2} 100 l -9 -16 l 9 6 l 9 -6 Z`} fill="#fffaf0" stroke="#d9cfa8" strokeWidth="1.5" />
                </g>
              ))}
            </g>
          )}
          <path d="M30 134 H170" stroke="#9b958a" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {art === 'crown' && (
        <g>
          {Array.from({ length: 13 }, (_, i) => {
            const a = Math.PI + (i / 12) * Math.PI
            return <line key={i} x1={100 + Math.cos(a) * 40} y1={92 + Math.sin(a) * 40} x2={100 + Math.cos(a) * 70} y2={92 + Math.sin(a) * 70} stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
          })}
          {/* Crown: band, five points with pearls, jewels, and a cross on top */}
          <path d="M52 112 L46 64 L70 86 L84 52 L100 80 L116 52 L130 86 L154 64 L148 112 Z" fill={GOLD} stroke="#b9892a" strokeWidth="2" strokeLinejoin="round" />
          <rect x="50" y="108" width="100" height="16" rx="3" fill="#c9962e" />
          {[[46, 62], [84, 50], [116, 50], [154, 62]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill="#fffaf0" stroke="#b9892a" strokeWidth="1.5" />)}
          {[70, 100, 130].map((x, i) => <circle key={i} cx={x} cy="116" r="4.5" fill={i === 1 ? '#a8322b' : '#2f5f9e'} />)}
          <rect x="96" y="30" width="8" height="34" rx="1.5" fill="#c9962e" />
          <rect x="88" y="38" width="24" height="7" rx="1.5" fill="#c9962e" />
        </g>
      )}
      {art === 'lily' && (
        <g>
          {Array.from({ length: 12 }, (_, i) => { const a = Math.PI + 0.25 + (i / 11) * (Math.PI - 0.5); return <path key={i} d={starPath(100 + Math.cos(a) * 78, 112 + Math.sin(a) * 92, 5)} fill={GOLD} /> })}
          <path d="M100 132 C100 110 99 92 100 70" stroke={GREEN} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M100 112 C86 104 80 96 78 86 C90 92 96 100 100 108" fill={GREEN} />
          <path d="M100 100 C114 92 120 84 122 74 C110 80 104 88 100 96" fill={GREEN} />
          <path d="M100 72 C84 64 74 48 76 34 C88 42 96 54 100 66 Z" fill="#fffdf6" stroke="#c9bfa8" strokeWidth="1.5" />
          <path d="M100 72 C116 64 126 48 124 34 C112 42 104 54 100 66 Z" fill="#fffdf6" stroke="#c9bfa8" strokeWidth="1.5" />
          <path d="M100 72 C92 56 94 40 100 26 C106 40 108 56 100 72 Z" fill="#ffffff" stroke="#c9bfa8" strokeWidth="1.5" />
          {[94, 100, 106].map((x) => <circle key={x} cx={x} cy={54} r="2.2" fill={GOLD} />)}
        </g>
      )}
      {art === 'stars' && (
        <g>
          {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <line key={i} x1={100 + Math.cos(a) * 30} y1={68 + Math.sin(a) * 30} x2={100 + Math.cos(a) * 46} y2={68 + Math.sin(a) * 40} stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" /> })}
          <circle cx="100" cy="68" r="24" fill={GOLD} />
          {Array.from({ length: 12 }, (_, i) => { const a = -Math.PI / 2 + (i / 12) * Math.PI * 2; return <path key={i} d={starPath(100 + Math.cos(a) * 50, 64 + Math.sin(a) * 50, 5.5)} fill={BLUE} /> })}
          <path d="M72 124 C86 140 114 140 128 124 C114 132 86 132 72 124 Z" fill="#c9cfd8" stroke="#9aa3b0" strokeWidth="1.5" />
        </g>
      )}
      {art === 'monstrance' && (
        <g>
          {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; const long = i % 2 === 0; return <line key={i} x1={100 + Math.cos(a) * 22} y1={56 + Math.sin(a) * 22} x2={100 + Math.cos(a) * (long ? 50 : 40)} y2={56 + Math.sin(a) * (long ? 50 : 40)} stroke={GOLD} strokeWidth={long ? 3 : 2} strokeLinecap="round" /> })}
          <circle cx="100" cy="56" r="21" fill={GOLD} />
          <circle cx="100" cy="56" r="15" fill="#fffdf6" stroke="#d8c9a0" strokeWidth="1" />
          <path d="M100 49 V63 M93 56 H107" stroke="#d8c9a0" strokeWidth="1.5" />
          <rect x="97" y="6" width="6" height="14" rx="1" fill="#c9962e" /><rect x="93" y="9" width="14" height="5" rx="1" fill="#c9962e" />
          <path d="M96 78 H104 L106 112 H94 Z" fill="#c9962e" />
          <circle cx="100" cy="94" r="5" fill={GOLD} />
          <path d="M78 128 C80 118 90 112 100 112 C110 112 120 118 122 128 Z" fill={GOLD} stroke="#b9892a" strokeWidth="1.5" />
        </g>
      )}
      {art === 'heart' && (
        <g>
          {Array.from({ length: 13 }, (_, i) => { const a = Math.PI + (i / 12) * Math.PI; return <line key={i} x1={100 + Math.cos(a) * 52} y1={84 + Math.sin(a) * 52} x2={100 + Math.cos(a) * 74} y2={84 + Math.sin(a) * 74} stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" opacity="0.55" /> })}
          <path d="M100 48 C94 38 98 30 104 24 C104 32 112 34 108 44 C106 48 102 50 100 48 Z" fill="#f2a33a" />
          <path d="M100 46 C98 40 100 36 102 32 C103 38 106 40 103 46 Z" fill="#ffd36b" />
          <rect x="97.5" y="14" width="5" height="22" rx="1" fill={GOLD} /><rect x="91" y="19" width="18" height="4.5" rx="1" fill={GOLD} />
          <path d="M100 128 C72 108 58 92 60 74 C62 60 74 52 86 54 C93 55 98 60 100 66 C102 60 107 55 114 54 C126 52 138 60 140 74 C142 92 128 108 100 128 Z" fill="#b3261e" stroke="#7d1a14" strokeWidth="2" />
          <path d="M64 84 C80 76 120 76 136 84 M66 90 C82 82 118 82 134 90" stroke={WOOD} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M108 96 L114 104" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        </g>
      )}
      {art === 'flame' && (
        <g>
          {[[70, 0.8], [100, 1.1], [130, 0.8]].map(([x, s], i) => (
            <path key={i} className="cmp-flame" transform={`translate(${x} 120) scale(${s})`} d="M0 -80 C 22 -52, 26 -26, 0 0 C -26 -26, -22 -52, 0 -80 Z M0 -40 C 8 -28, 8 -14, 0 -6 C -8 -14, -8 -28, 0 -40 Z" fill="#d6452b" fillRule="evenodd" />
          ))}
          <path d="M100 14 c -8 0 -14 4 -16 10 c -10 -4 -20 -2 -26 4 c 10 0 18 4 22 10 c 4 2 14 2 20 -2 c 8 4 18 2 24 -4 c -8 0 -14 -4 -16 -10 c -2 -6 -4 -8 -8 -8 Z" fill="#fffaf0" stroke="#c9c2b0" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  )
}
