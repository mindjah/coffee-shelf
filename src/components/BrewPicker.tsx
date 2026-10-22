import { BREWS, type Brew } from '../types'
import { useT } from '../i18n'

/** V60 or AeroPress for a rating; tapping the chosen one again clears it (null). */
export function BrewPicker({ value, onChange }: { value: Brew | null | undefined; onChange: (b: Brew | null) => void }) {
  const t = useT()
  return (
    <div className="brew-picker">
      <span className="muted small">{t.coffee.brewedWith}</span>
      <div className="segmented" style={{ marginBottom: 0 }}>
        {BREWS.map((b) => (
          <button key={b} type="button" className={value === b ? 'on' : ''} onClick={() => onChange(value === b ? null : b)} aria-pressed={value === b}>
            {t.brew[b]}
          </button>
        ))}
      </div>
    </div>
  )
}
