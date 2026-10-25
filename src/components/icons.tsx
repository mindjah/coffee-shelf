const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const BeanIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <g transform="rotate(-32 12 12)">
      <ellipse cx="12" cy="12" rx="6.2" ry="9" />
      <path d="M12.2 3.6c-3 5.4 2.8 11.2-.4 16.8" fill="none" stroke="var(--bg)" strokeWidth="1.3" strokeLinecap="round" />
    </g>
  </svg>
)
export const CameraIcon = () => (
  <svg {...base}><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.3l1.4-2h5.6l1.4 2h1.3A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z" /><circle cx="12" cy="13" r="3.6" /></svg>
)
/** A shelving cabinet: a tall frame on short legs, divided by two shelves. */
export const ShelfIcon = () => (
  <svg {...base}>
    <rect x="4.5" y="2.5" width="15" height="18" rx="1.5" />
    <path d="M4.5 8.5h15M4.5 14.5h15M7 20.5v1.5M17 20.5v1.5" />
  </svg>
)
export const TasteIcon = () => (
  <svg {...base}><path d="M12 3a9 9 0 1 0 9 9" /><path d="M12 12V3M12 12l7.5-5" /></svg>
)
export const GearIcon = () => (
  <svg {...base}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
)
export const PlusIcon = () => <svg {...base}><path d="M12 5v14M5 12h14" /></svg>
/** List view: rows with a picture block. */
export const ListViewIcon = () => <svg {...base}><rect x="3.5" y="4.5" width="5" height="6" rx="1" /><rect x="3.5" y="13.5" width="5" height="6" rx="1" /><path d="M11.5 6.5h9M11.5 9h5.5M11.5 15.5h9M11.5 18h5.5" /></svg>
/** Compact shelf view: three bags standing on a plank. */
export const ShelfViewIcon = () => <svg {...base}><rect x="3" y="7" width="5" height="10" rx="1" /><rect x="9.5" y="7" width="5" height="10" rx="1" /><rect x="16" y="7" width="5" height="10" rx="1" /><path d="M2 20h20" /></svg>
/** Sort: lines shortening downward with an arrow. */
export const SortIcon = () => <svg {...base}><path d="M4 6h9M4 12h6M4 18h3" /><path d="M17.5 5v14M14.5 16l3 3 3-3" /></svg>
/** ⓧ: filled circle with a cut-out cross. */
export const ClearIcon = () => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="var(--surface)" strokeWidth="2" strokeLinecap="round" /></svg>
)
export const ChevronIcon = () => <svg {...base}><path d="m6 9 6 6 6-6" /></svg>
/** Share-style arrow out of a tray: save or send. */
export const SaveIcon = () => <svg {...base}><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" /><path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12" /></svg>
/** Two bags side by side. */
export const CompareIcon = () => <svg {...base}><rect x="3.5" y="5" width="7" height="14" rx="1.5" /><rect x="13.5" y="5" width="7" height="14" rx="1.5" /><path d="M5.8 9h2.4M15.8 9h2.4" /></svg>
export const FilterIcon = () => <svg {...base}><path d="M4 6h16M7 12h10M10 18h4" /></svg>
const StarPath = () => <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
export const StarIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><StarPath /></svg>
/** A leather-bound encyclopedia volume seen from above-left: page edges on top, a gilt spine, a gold bean on the cover. */
export const BookIcon = () => (
  <svg viewBox="0 0 52 60">
    <defs>
      <linearGradient id="book-cover" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#86562f" />
        <stop offset="1" stopColor="#5c3a21" />
      </linearGradient>
      <linearGradient id="book-spine" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#3e2413" />
        <stop offset="0.45" stopColor="#5e3a21" />
        <stop offset="1" stopColor="#3a2212" />
      </linearGradient>
    </defs>
    <path d="M13 11.5 6 6h33l7 5.5z" fill="#f4ecdf" stroke="#5c3a21" strokeWidth="0.7" strokeLinejoin="round" />
    <path d="M11.4 9.7h31.6M9.1 7.9h31.6" stroke="#d9c9b1" strokeWidth="0.5" />
    <path d="M13 11.5 6 6v43l7 5.5z" fill="url(#book-spine)" />
    <g stroke="#d6ad5c" strokeWidth="1.1" strokeLinecap="round">
      <path d="M12.3 17.8 6.7 13.4M12.3 20.6 6.7 16.2M12.3 46.6 6.7 42.2M12.3 49.4 6.7 45" />
    </g>
    <path d="M12.2 27.5 7 23.4v9.4l5.2 4.1z" fill="#d6ad5c" opacity="0.85" />
    <path d="M13 11.5h33v41a2 2 0 0 1-2 2H13z" fill="url(#book-cover)" />
    <path d="M13 11.5v43" stroke="#2f1b0e" strokeWidth="0.7" />
    <rect x="17.5" y="15.5" width="24.5" height="35" rx="1.2" fill="none" stroke="#d6ad5c" strokeWidth="1" />
    <g transform="rotate(-30 29.75 28.5)">
      <ellipse cx="29.75" cy="28.5" rx="5.2" ry="7.5" fill="#d6ad5c" />
      <path d="M29.95 21.4c-2.5 4.4 2.3 9.2-.4 14.2" fill="none" stroke="#5f3b22" strokeWidth="1.2" strokeLinecap="round" />
    </g>
    <path d="M24 42h11.5M26.5 45.3h6.5" stroke="#d6ad5c" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)
/**
 * A stand-up coffee pouch in a 56×92 box: crimped top seal with a tear notch, zip line,
 * degassing valve, label, a body that widens toward the gusseted bottom.
 * `ghost` draws it dashed — a place where a bag will go.
 */
function Bag({ x, y, mark, ghost = false }: { x: number; y: number; mark: string; ghost?: boolean }) {
  const line = { stroke: 'var(--maybe)', strokeWidth: 1.8, strokeLinejoin: 'round', strokeLinecap: 'round' } as const
  const dash = ghost ? '4 3' : undefined
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M7 4h42v10c0 20 5 44 5 66a10 10 0 0 1-10 10H12A10 10 0 0 1 2 80c0-22 5-46 5-66z" fill="var(--surface-2)" {...line} strokeDasharray={dash} />
      {!ghost && (
        <>
          <path d="M11 5v8M15 5v8M19 5v8M23 5v8M27 5v8M31 5v8M35 5v8M39 5v8M43 5v8M47 5v8" stroke="var(--maybe)" strokeWidth="0.9" opacity="0.7" />
          <path d="M7 14h42" {...line} strokeWidth={1.4} />
          <path d="M7 18l3 2-3 2" fill="none" {...line} strokeWidth={1.2} />
          <path d="M8 24h40" stroke="var(--maybe)" strokeWidth="1.2" strokeDasharray="2.5 2" />
          <circle cx="28" cy="32" r="3.8" fill="none" {...line} strokeWidth={1.4} />
          <circle cx="28" cy="32" r="1.2" fill="var(--maybe)" />
          <path d="M4 82c8-5 40-5 48 0" fill="none" {...line} strokeWidth={1.2} opacity="0.7" />
        </>
      )}
      <rect x="14" y="41" width="28" height="31" rx="3" fill={ghost ? 'none' : 'var(--surface)'} {...line} strokeWidth={1.4} strokeDasharray={dash} />
      <text x="28" y="64.5" textAnchor="middle" fontSize="21" fontWeight="700" fill="var(--maybe)" fontFamily="-apple-system, system-ui, sans-serif">{mark}</text>
    </g>
  )
}

/** Empty comparison: two unknown bags with compare arrows between. */
export const EmptyCompareArt = () => (
  <svg viewBox="0 0 160 112" className="empty-art" aria-hidden="true">
    <Bag x={6} y={10} mark="?" />
    <Bag x={98} y={10} mark="?" />
    <path d="M69 50h22M85 44l6 6-6 6M91 70H69M75 64l-6 6 6 6" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/** Empty shelf: a shelving cabinet with nothing on it but the outline of the first bag to come. */
export const EmptyShelfArt = () => (
  <svg viewBox="0 0 160 150" className="empty-art" aria-hidden="true">
    <rect x="16" y="4" width="128" height="136" rx="6" fill="var(--surface-2)" stroke="var(--maybe)" strokeWidth="2" />
    <path d="M16 48h128M16 94h128" stroke="var(--maybe)" strokeWidth="2" />
    <path d="M18 48h124v4H18zM18 94h124v4H18z" fill="color-mix(in srgb, var(--maybe) 35%, transparent)" />
    <path d="M32 140v7M128 140v7" stroke="var(--maybe)" strokeWidth="3" strokeLinecap="round" />
    <g transform="translate(68 54) scale(0.42)">
      <Bag x={0} y={0} mark="+" ghost />
    </g>
  </svg>
)
