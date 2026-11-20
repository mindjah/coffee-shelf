import { useEffect, useRef, useState } from 'react'
import { BREWS, type Brew, type Coffee } from '../types'
import { useT } from '../i18n'
import { ratingFor } from '../ratings'
import { ChevronIcon } from './icons'

/**
 * Brew method for a rating, as a dropdown of the encyclopedia's methods. With `ratings`, each method
 * shows the rating it already has ("V60 4.0"), and rated ones come first.
 */
export function BrewPicker({ value, ratings, onChange }: {
  value: Brew | null | undefined
  ratings?: Pick<Coffee, 'rating' | 'ratings' | 'brewedWith'>
  onChange: (b: Brew | null) => void
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const rated = (b: Brew) => (ratings ? ratingFor(ratings, b) : null)
  const order = [...BREWS].sort((a, b) => Number(rated(b) != null) - Number(rated(a) != null))

  // Closes on a tap outside or Escape.
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', away, true)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', away, true)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  const choose = (b: Brew | null) => {
    setOpen(false)
    if (b !== (value ?? null)) onChange(b)
  }
  const current = value ? rated(value) : null

  return (
    <div className="brew-picker">
      <span className="muted small">{t.coffee.brewedWith}</span>
      <div className="brew-select" ref={box}>
        <button type="button" className={`brew-select-btn${value ? '' : ' empty'}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span className="brew-select-name">{value ? t.brew[value] : t.coffee.noBrew}</span>
          {current != null && <span className="seg-rating">{current.toFixed(1)}</span>}
          <span className="spacer" />
          <ChevronIcon />
        </button>
        {open && (
          <ul className="brew-menu" role="listbox" aria-label={t.coffee.brewedWith}>
            {[null, ...order].map((b) => {
              const on = (value ?? null) === b
              const r = b && rated(b)
              return (
                <li key={b ?? 'none'}>
                  <button type="button" role="option" aria-selected={on} className={on ? 'on' : ''} onClick={() => choose(b)}>
                    <span className={b ? '' : 'muted'}>{b ? t.brew[b] : t.coffee.noBrew}</span>
                    <span className="spacer" />
                    {r != null && <span className="seg-rating">{r.toFixed(1)}</span>}
                    <span className="brew-check" aria-hidden="true">{on ? '✓' : ''}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
