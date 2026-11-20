import { useMemo } from 'react'
import { findNotes, flavorsFromNotes } from '../parse'
import { useT } from '../i18n'
import { FLAVORS, type Flavor } from '../types'

/**
 * Flavor groups you noticed, as chips. Groups your note mentions are offered dotted, for a tap to
 * confirm: a note saying "no berries" shouldn't count as berries.
 */
export function TastedPicker({ value, note, onChange }: { value: Flavor[] | undefined; note: string; onChange: (v: Flavor[]) => void }) {
  const t = useT()
  const picked = value ?? []
  const suggested = useMemo(() => {
    const found = findNotes(note)
    if (!found.length) return new Set<Flavor>()
    const f = flavorsFromNotes(found)
    return new Set(FLAVORS.filter((k) => f[k] > 0))
  }, [note])
  return (
    <div className="tasted">
      <div style={{ fontWeight: 600, marginTop: 14 }}>{t.coffee.tastedTitle}</div>
      <div className="chips" style={{ marginTop: 8 }}>
        {FLAVORS.map((f) => {
          const on = picked.includes(f)
          return (
            <button key={f} type="button" className={`chip pickable${on ? ' on' : suggested.has(f) ? ' suggested' : ''}`} aria-pressed={on}
              onClick={() => onChange(on ? picked.filter((x) => x !== f) : [...picked, f])}>
              {t.flavor[f]}
            </button>
          )
        })}
      </div>
      <p className="muted small" style={{ margin: '8px 4px 0' }}>{t.coffee.tastedHint}</p>
    </div>
  )
}
