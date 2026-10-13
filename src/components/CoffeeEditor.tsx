import { useState } from 'react'
import { FLAVORS, PROCESSES, REGIONS, ROASTS, ROAST_FOR, type CoffeeDraft, type Flavor, type Structure } from '../types'
import { estimateFlavors, findNotes, flavorsFromNotes, lookupCountry } from '../parse'
import { countryName, localized, useLang, useT } from '../i18n'
import { Sheet } from './Sheet'

const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
const blankProfile = (f: Record<Flavor, number>) => FLAVORS.every((k) => !f[k])

/** Tap a dot to set the level; tapping the current level clears it. */
function Dots({ count, value, onChange, label }: { count: number; value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="dots" role="radiogroup" aria-label={label}>
      {Array.from({ length: count }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" className={`dot${n <= value ? ' on' : ''}`} aria-label={`${label}: ${n}`} aria-checked={n === value} role="radio"
          onClick={() => onChange(n === value ? 0 : n)}>
          <i />
        </button>
      ))}
    </div>
  )
}

export function CoffeeEditor({ coffee, onSave, onClose }: { coffee: CoffeeDraft; onSave: (c: CoffeeDraft) => void; onClose: () => void }) {
  const t = useT()
  const lang = useLang()
  const shown = localized(coffee, lang)
  const [c, setC] = useState(coffee)
  const [country, setCountry] = useState(countryName(coffee, lang))
  const [notes, setNotes] = useState(shown.notes.join(', '))
  const [processDetail, setProcessDetail] = useState(shown.processDetail)
  const [varieties, setVarieties] = useState(coffee.varieties.join(', '))
  const [sca, setSca] = useState(coffee.scaScore?.toString() ?? '')
  const [fillNote, setFillNote] = useState<string>()
  const set = <K extends keyof CoffeeDraft>(k: K, v: CoffeeDraft[K]) => setC((p) => ({ ...p, [k]: v }))
  const text = (k: 'roaster' | 'name' | 'area' | 'producer', label: string, placeholder?: string) => (
    <label className="field">
      <span>{label}</span>
      <input className="input" value={c[k]} placeholder={placeholder} onChange={(e) => set(k, e.target.value)} />
    </label>
  )

  const setFlavor = (f: Flavor, level: number) =>
    setC((p) => ({ ...p, flavors: { ...p.flavors, [f]: level / 3 }, flavorsEstimated: false }))
  const setStructure = (k: keyof Structure, v: number) => setC((p) => ({ ...p, structure: { ...p.structure, [k]: v || null } }))

  function fillFromNotes() {
    const found = findNotes(notes)
    if (!found.length) return setFillNote(t.editor.noKnownNotes)
    setC((p) => ({ ...p, flavors: flavorsFromNotes(found), flavorsEstimated: false }))
    setFillNote(t.editor.filledFrom(found.length))
  }

  function save() {
    // SCA scores live between 0 and 100 (specialty is 80+); anything else is treated as not entered.
    const score = Number(sca.replace(',', '.'))
    const next: CoffeeDraft = { ...c, varieties: list(varieties), scaScore: sca.trim() && score > 0 && score <= 100 ? score : null }
    // A typed country is matched to ISO codes (for translated names) and an origin group.
    if (country !== countryName(coffee, lang)) {
      const match = lookupCountry(country)
      Object.assign(next, { country: country.trim(), countryCodes: match?.codes ?? [] })
      if (match && next.region === coffee.region) next.region = match.region
    }
    // Predictions need a profile: take it from known notes, else estimate from origin/process/roast.
    if (blankProfile(next.flavors)) {
      const found = findNotes(notes)
      next.flavors = found.length ? flavorsFromNotes(found) : estimateFlavors(next.region, next.process, next.roast)
      next.flavorsEstimated = !found.length
    }
    // Notes and process wording are edited in the language they're shown in.
    const tr = coffee.translations?.[lang]
    if (tr) {
      next.translations = { ...coffee.translations, [lang]: { notes: list(notes), processDetail: processDetail.trim() } }
    } else {
      Object.assign(next, { notes: list(notes), processDetail: processDetail.trim() })
    }
    onSave(next)
  }

  return (
    <Sheet title={t.editor.title} closeLabel={t.common.cancel} onClose={onClose} action={{ label: t.common.done, onClick: save }}>
      <div className="card">
        {text('roaster', t.editor.roaster, t.editor.roasterPlaceholder)}
        {text('name', t.editor.name, t.editor.namePlaceholder)}
        <div className="grid-2" style={{ marginTop: 12 }}>
          <label className="field">
            <span>{t.editor.country}</span>
            <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} />
          </label>
          {text('area', t.editor.area)}
        </div>
        <div style={{ marginTop: 12 }}>{text('producer', t.editor.producer)}</div>
      </div>
      <div className="card">
        <div className="grid-2">
          <label className="field">
            <span>{t.editor.process}</span>
            <select className="input" value={c.process} onChange={(e) => set('process', e.target.value as CoffeeDraft['process'])}>
              {PROCESSES.map((p) => <option key={p} value={p}>{t.process[p]}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t.editor.roast}</span>
            <select className="input" value={c.roast} onChange={(e) => set('roast', e.target.value as CoffeeDraft['roast'])}>
              {ROASTS.map((p) => <option key={p} value={p}>{t.roast[p]}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t.editor.roastFor}</span>
            <select className="input" value={c.roastFor} onChange={(e) => set('roastFor', e.target.value as CoffeeDraft['roastFor'])}>
              {ROAST_FOR.map((p) => <option key={p} value={p}>{t.roastFor[p]}</option>)}
            </select>
          </label>
          <label className="field">
            <span>{t.editor.region}</span>
            <select className="input" value={c.region} onChange={(e) => set('region', e.target.value as CoffeeDraft['region'])}>
              {REGIONS.map((p) => <option key={p} value={p}>{t.region[p]}</option>)}
            </select>
          </label>
        </div>
        <label className="field" style={{ marginTop: 12 }}>
          <span>{t.editor.processDetail}</span>
          <input className="input" value={processDetail} onChange={(e) => setProcessDetail(e.target.value)} />
        </label>
        <label className="field">
          <span>{t.editor.varieties}</span>
          <input className="input" value={varieties} onChange={(e) => setVarieties(e.target.value)} />
        </label>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <label className="field">
            <span>{t.editor.altitude}</span>
            <input className="input" inputMode="numeric" value={c.altitude ?? ''} onChange={(e) => set('altitude', e.target.value ? Number(e.target.value.replace(/\D/g, '')) : null)} />
          </label>
          <label className="field">
            <span>{t.editor.sca}</span>
            <input className="input" inputMode="decimal" placeholder={t.editor.scaPlaceholder} value={sca} onChange={(e) => setSca(e.target.value.replace(/[^\d.,]/g, ''))} />
          </label>
        </div>
        <p className="muted small" style={{ margin: '6px 4px 14px' }}>{t.editor.scaHint}</p>
        <label className="field">
          <span>{t.editor.notes}</span>
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <p className="muted small" style={{ margin: '10px 4px 0' }}>{t.editor.notesHint}</p>
      </div>
      <h2 className="section">{t.editor.tasteProfile}</h2>
      <div className="card">
        <button type="button" className="btn ghost block" onClick={fillFromNotes} disabled={!notes.trim()}>{t.editor.fillFromNotes}</button>
        {fillNote && <p className="muted small" style={{ margin: '8px 4px 4px' }}>{fillNote}</p>}
        <div style={{ marginTop: 8 }}>
          {FLAVORS.map((f) => (
            <div className="dots-row" key={f}>
              <span>{t.flavor[f]}</span>
              <Dots count={3} value={Math.round(c.flavors[f] * 3)} onChange={(v) => setFlavor(f, v)} label={t.flavor[f]} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          {(['acidity', 'body', 'sweetness'] as const).map((k) => (
            <div className="dots-row" key={k}>
              <span>{t.editor[k]}</span>
              <Dots count={5} value={c.structure[k] ?? 0} onChange={(v) => setStructure(k, v)} label={t.editor[k]} />
            </div>
          ))}
        </div>
        <p className="muted small" style={{ margin: '10px 4px 0' }}>{t.editor.tasteHint}</p>
      </div>
    </Sheet>
  )
}
