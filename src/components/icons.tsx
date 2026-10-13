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
export const ShelfIcon = () => (
  <svg {...base}><path d="M7.5 3h9l1.5 4.5v12A1.5 1.5 0 0 1 16.5 21h-9A1.5 1.5 0 0 1 6 19.5v-12z" /><path d="M6 7.5h12" /><circle cx="12" cy="13" r="1.8" /></svg>
)
export const TasteIcon = () => (
  <svg {...base}><path d="M12 3a9 9 0 1 0 9 9" /><path d="M12 12V3M12 12l7.5-5" /></svg>
)
export const GearIcon = () => (
  <svg {...base}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>
)
export const PlusIcon = () => <svg {...base}><path d="M12 5v14M5 12h14" /></svg>
/** Share-style arrow out of a tray: save or send. */
export const SaveIcon = () => <svg {...base}><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" /><path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12" /></svg>
/** Two bags side by side. */
export const CompareIcon = () => <svg {...base}><rect x="3.5" y="5" width="7" height="14" rx="1.5" /><rect x="13.5" y="5" width="7" height="14" rx="1.5" /><path d="M5.8 9h2.4M15.8 9h2.4" /></svg>
export const FilterIcon = () => <svg {...base}><path d="M4 6h16M7 12h10M10 18h4" /></svg>
const StarPath = () => <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
export const StarIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><StarPath /></svg>
