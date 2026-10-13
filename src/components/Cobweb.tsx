// Decorations for the archive bookcase: corner cobwebs and small hanging spiders.

const SPOKES = [0, 15, 32, 50, 68, 84, 90].map((d) => (d * Math.PI) / 180)
const RINGS = [16, 31, 47, 64, 82]
const at = (r: number, a: number) => [r * Math.cos(a), r * Math.sin(a)] as const

/** Web strands as one path: spokes from the corner, rings sagging between them. */
const WEB_PATH = (() => {
  const parts = SPOKES.map((a) => `M0 0L${at(130, a).join(' ')}`)
  for (const r of RINGS) {
    for (let i = 0; i < SPOKES.length - 1; i++) {
      const [x1, y1] = at(r, SPOKES[i])
      const [x2, y2] = at(r * 1.03, SPOKES[i + 1])
      const [cx, cy] = at(r * 0.8, (SPOKES[i] + SPOKES[i + 1]) / 2) // sag toward the corner
      parts.push(`M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`)
    }
  }
  return parts.join('')
})()

/** Corner cobweb; `corner` picks which corner of its box it spreads from. */
export function Cobweb({ corner = 'tl', className = '' }: { corner?: 'tl' | 'tr' | 'bl' | 'br'; className?: string }) {
  const flip = { tl: '', tr: 'scale(-1 1) translate(-100 0)', bl: 'scale(1 -1) translate(0 -100)', br: 'scale(-1 -1) translate(-100 -100)' }[corner]
  return (
    <svg className={`cobweb ${corner} ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <path d={WEB_PATH} transform={flip} fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** A small spider dangling on a thread of the given length (px). */
export function Spider({ left, thread, size = 12 }: { left: string; thread: number; size?: number }) {
  return (
    <span className="spider" style={{ left }} aria-hidden="true">
      <span className="spider-thread" style={{ height: thread }} />
      <svg viewBox="0 0 20 20" width={size} height={size}>
        <g stroke="#120c09" strokeWidth="1.1" strokeLinecap="round" fill="none">
          <path d="M8 9 4 6 2 8M8 10.5 3.5 10 1.5 12.5M8 12 4 14 3 17M8.6 13 6 16.5 6 19" />
          <path d="M12 9 16 6 18 8M12 10.5 16.5 10 18.5 12.5M12 12 16 14 17 17M11.4 13 14 16.5 14 19" />
        </g>
        <ellipse cx="10" cy="12" rx="3" ry="3.6" fill="#120c09" />
        <circle cx="10" cy="7.6" r="2" fill="#120c09" />
      </svg>
    </span>
  )
}
