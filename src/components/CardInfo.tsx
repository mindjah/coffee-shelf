import { useState, type ReactNode } from 'react'
import { useT } from '../i18n'

/**
 * ⓘ button in a card's top-right corner that shows extra explanation at the top of the card.
 * The card needs the `has-info` class, and its first row `info-clear` so it doesn't run under the button.
 */
export function CardInfo({ children }: { children: ReactNode }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={`info-btn${open ? ' open' : ''}`} onClick={() => setOpen((v) => !v)} aria-label={t.common.info} aria-expanded={open}>
        i
      </button>
      {open && <div className="info-panel small">{children}</div>}
    </>
  )
}
