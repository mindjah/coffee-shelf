import { BREWS, type Brew, type Coffee } from '../types'
import { useT } from '../i18n'
import { ratingFor } from '../ratings'

/**
 * Brew method for a rating, as a dropdown: nothing chosen, V60 or AeroPress. With `ratings`, each
 * method shows the rating it already has ("V60 · 4.0").
 */
export function BrewPicker({ value, ratings, onChange }: {
  value: Brew | null | undefined
  ratings?: Pick<Coffee, 'rating' | 'ratings' | 'brewedWith'>
  onChange: (b: Brew | null) => void
}) {
  const t = useT()
  return (
    <label className="brew-picker">
      <span className="muted small">{t.coffee.brewedWith}</span>
      <select className="input" value={value ?? ''} onChange={(e) => onChange((e.target.value || null) as Brew | null)}>
        <option value="">{t.coffee.noBrew}</option>
        {BREWS.map((b) => {
          const r = ratings && ratingFor(ratings, b)
          return <option key={b} value={b}>{t.brew[b]}{r != null ? ` · ${r.toFixed(1)}` : ''}</option>
        })}
      </select>
    </label>
  )
}
