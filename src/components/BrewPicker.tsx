import { BREWS, type Brew, type Coffee } from '../types'
import { useT } from '../i18n'
import { ratingFor } from '../ratings'

/**
 * Brew method for a rating, as a two-way switch: V60 or AeroPress; tapping the chosen one again
 * clears it. With `ratings`, each method shows the rating it already has ("V60 4.0").
 */
export function BrewPicker({ value, ratings, onChange }: {
  value: Brew | null | undefined
  ratings?: Pick<Coffee, 'rating' | 'ratings' | 'brewedWith'>
  onChange: (b: Brew | null) => void
}) {
  const t = useT()
  return (
    <div className="brew-picker">
      <span className="muted small">{t.coffee.brewedWith}</span>
      <div className="segmented brew-seg" role="radiogroup" aria-label={t.coffee.brewedWith}>
        {BREWS.map((b) => {
          const on = value === b
          const r = ratings && ratingFor(ratings, b)
          return (
            <button key={b} type="button" role="radio" aria-checked={on} className={on ? 'on' : ''} onClick={() => onChange(on ? null : b)}>
              {t.brew[b]}{r != null && <span className="seg-rating">{r.toFixed(1)}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
