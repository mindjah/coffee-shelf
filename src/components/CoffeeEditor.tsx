import { useState } from 'react'
import { PROCESSES, REGIONS, ROASTS, ROAST_FOR, type CoffeeDraft } from '../types'
import { countryName, localized, useLang, useT } from '../i18n'
import { Sheet } from './Sheet'

const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)

export function CoffeeEditor({ coffee, onSave, onClose }: { coffee: CoffeeDraft; onSave: (c: CoffeeDraft) => void; onClose: () => void }) {
  const t = useT()
  const lang = useLang()
  const shown = localized(coffee, lang)
  const [c, setC] = useState(coffee)
  const [country, setCountry] = useState(countryName(coffee, lang))
  const [notes, setNotes] = useState(shown.notes.join(', '))
  const [processDetail, setProcessDetail] = useState(shown.processDetail)
  const [varieties, setVarieties] = useState(coffee.varieties.join(', '))
  const set = <K extends keyof CoffeeDraft>(k: K, v: CoffeeDraft[K]) => setC((p) => ({ ...p, [k]: v }))
  const text = (k: 'roaster' | 'name' | 'area' | 'producer', label: string) => (
    <label className="field">
      <span>{label}</span>
      <input className="input" value={c[k]} onChange={(e) => set(k, e.target.value)} />
    </label>
  )

  function save() {
    const next: CoffeeDraft = { ...c, varieties: list(varieties) }
    // A hand-typed country replaces the ISO codes that drive translated names.
    if (country !== countryName(coffee, lang)) Object.assign(next, { country: country.trim(), countryCodes: [] })
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
        {text('roaster', t.editor.roaster)}
        {text('name', t.editor.name)}
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
        <label className="field">
          <span>{t.editor.altitude}</span>
          <input className="input" inputMode="numeric" value={c.altitude ?? ''} onChange={(e) => set('altitude', e.target.value ? Number(e.target.value.replace(/\D/g, '')) : null)} />
        </label>
        <label className="field">
          <span>{t.editor.notes}</span>
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <p className="muted small" style={{ margin: '10px 4px 0' }}>{t.editor.notesHint}</p>
      </div>
    </Sheet>
  )
}
