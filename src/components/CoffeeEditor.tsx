import { useRef, useState } from 'react'
import { PHOTO_SIDE, resizeImage } from '../image'
import { CoffeeThumb, photosOf } from './CoffeeThumb'
import { CameraIcon, PlusIcon } from './icons'
import { FLAVORS, PROCESSES, REGIONS, ROASTS, ROAST_FOR, type CoffeeDraft, type Flavor, type Structure } from '../types'
import { estimateFlavors, findNotes, flavorsFromNotes, lookupCountry } from '../parse'
import { countryName, localized, useLang, useT } from '../i18n'
import { CURRENCIES, getSettings, saveSettings } from '../settings'
import { Sheet } from './Sheet'
import { RescanSheet } from './RescanSheet'

type PhotoSlot = 'photo' | 'cover'
/** The label photo (read for the details) and a cover photo, just for looks. */
const SLOTS: PhotoSlot[] = ['photo', 'cover']

const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)

/**
 * Applies a fresh scan to a coffee: whatever the scan read replaces the old value, but anything it
 * missed (empty text, no notes, "unknown") keeps what was there. Rating, comment and dates aren't
 * part of a draft, so they're untouched.
 */
function mergeScan<T extends CoffeeDraft>(old: T, scan: CoffeeDraft): T {
  const pick = <V,>(next: V, prev: V, missing: (v: V) => boolean) => (missing(next) ? prev : next)
  const noText = (v: string) => !v.trim()
  const unknown = (v: string) => v === 'unknown'
  const hasNotes = scan.notes.length > 0
  const keepProfile = scan.flavorsEstimated && !old.flavorsEstimated && !blankProfile(old.flavors)
  return {
    ...old,
    roaster: pick(scan.roaster, old.roaster, noText),
    name: pick(scan.name, old.name, noText),
    country: pick(scan.country, old.country, noText),
    countryCodes: scan.countryCodes?.length ? scan.countryCodes : old.countryCodes,
    area: pick(scan.area, old.area, noText),
    producer: pick(scan.producer, old.producer, noText),
    varieties: scan.varieties.length ? scan.varieties : old.varieties,
    process: pick(scan.process, old.process, unknown),
    processDetail: pick(scan.processDetail, old.processDetail, noText),
    altitude: scan.altitude ?? old.altitude,
    roast: pick(scan.roast, old.roast, unknown),
    roastFor: pick(scan.roastFor, old.roastFor, unknown),
    region: pick(scan.region, old.region, unknown),
    notes: hasNotes ? scan.notes : old.notes,
    translations: hasNotes ? scan.translations : old.translations,
    flavors: keepProfile ? old.flavors : scan.flavors,
    flavorsEstimated: keepProfile ? old.flavorsEstimated : scan.flavorsEstimated,
    structure: {
      acidity: scan.structure.acidity ?? old.structure.acidity,
      body: scan.structure.body ?? old.structure.body,
      sweetness: scan.structure.sweetness ?? old.structure.sweetness,
    },
    scaScore: scan.scaScore ?? old.scaScore,
    weight: scan.weight ?? old.weight,
  }
}
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
  // What the text fields were filled from: the coffee, or a re-scan of it. Edits are compared to this.
  const [base, setBase] = useState(coffee)
  const [c, setC] = useState(coffee)
  const [country, setCountry] = useState(countryName(coffee, lang))
  const [notes, setNotes] = useState(shown.notes.join(', '))
  const [processDetail, setProcessDetail] = useState(shown.processDetail)
  const [varieties, setVarieties] = useState(coffee.varieties.join(', '))
  const [sca, setSca] = useState(coffee.scaScore?.toString() ?? '')
  const [price, setPrice] = useState(coffee.price?.toString() ?? '')
  // New prices start in the currency you used last.
  const [currency, setCurrency] = useState(coffee.currency ?? getSettings().currency)
  const [fillNote, setFillNote] = useState<string>()
  const photoRef = useRef<HTMLInputElement>(null)
  const [picking, setPicking] = useState<PhotoSlot>('photo')
  const [rescanning, setRescanning] = useState(false)
  const [rescanned, setRescanned] = useState(false)

  /** Fills the editor from a new scan; the current photo stays unless the coffee had none. */
  async function applyRescan(scan: CoffeeDraft, firstShot: Blob) {
    const photo = c.photo ?? (await (await resizeImage(firstShot, PHOTO_SIDE, 0.82)).arrayBuffer())
    const next = { ...mergeScan(c, scan), photo }
    const text = localized(next, lang)
    setBase(next)
    setC(next)
    setCountry(countryName(next, lang))
    setNotes(text.notes.join(', '))
    setProcessDetail(text.processDetail)
    setVarieties(next.varieties.join(', '))
    setSca(next.scaScore?.toString() ?? '')
    setFillNote(undefined)
    setRescanning(false)
    setRescanned(true)
  }

  /** Bag picture from Photos or Files, e.g. one saved from the roaster's website. */
  async function pickPhoto(slot: PhotoSlot, file?: File) {
    if (!file) return
    try {
      const jpeg = await (await resizeImage(file, PHOTO_SIDE, 0.82)).arrayBuffer()
      // A newly added cover is what the bag shows; replacing one keeps your choice.
      setC((p) => ({ ...p, [slot]: jpeg, ...(slot === 'cover' && !p.cover && { coverFrom: 'cover' }) }))
    } catch {
      // Unreadable image: keep the current photo.
    }
  }
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
    const paid = Number(price.replace(',', '.'))
    Object.assign(next, price.trim() && paid > 0 ? { price: paid, currency } : { price: null })
    if (price.trim() && paid > 0) saveSettings({ currency })
    // A typed country is matched to ISO codes (for translated names) and an origin group.
    if (country !== countryName(base, lang)) {
      const match = lookupCountry(country)
      Object.assign(next, { country: country.trim(), countryCodes: match?.codes ?? [] })
      if (match && next.region === base.region) next.region = match.region
    }
    // Predictions need a profile: take it from known notes, else estimate from origin/process/roast.
    if (blankProfile(next.flavors)) {
      const found = findNotes(notes)
      next.flavors = found.length ? flavorsFromNotes(found) : estimateFlavors(next.region, next.process, next.roast)
      next.flavorsEstimated = !found.length
    }
    // Notes and process wording are edited in the language they're shown in.
    // A dictionary translation shown in place of the printed notes is saved as a translation too,
    // so the bag's own wording isn't overwritten.
    const tr = base.translations?.[lang] || localized(base, lang).notes.join() !== base.notes.join()
    if (tr) {
      next.translations = { ...base.translations, [lang]: { notes: list(notes), processDetail: processDetail.trim() } }
    } else {
      Object.assign(next, { notes: list(notes), processDetail: processDetail.trim() })
    }
    onSave(next)
  }

  return (
    <Sheet title={t.editor.title} closeLabel={t.common.cancel} onClose={onClose} action={{ label: t.common.done, onClick: save }}>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="grid-2">
          {SLOTS.map((slot) => (
            <div key={slot} className="photo-slot">
              <span className="photo-slot-label">{slot === 'photo' ? t.editor.labelPhoto : t.editor.coverPhoto}</span>
              <div className="photo-slot-frame">
                {c[slot] ? (
                  <>
                    <CoffeeThumb photo={c[slot]} gallery={photosOf(c)} className="photo-slot-img" name={[c.roaster, c.name].filter(Boolean).join(' – ')} />
                    <button type="button" className="photo-slot-remove" onClick={() => set(slot, undefined)} aria-label={t.editor.removePhoto}>✕</button>
                  </>
                ) : (
                  <button type="button" className="photo-slot-img photo-slot-add" onClick={() => (setPicking(slot), photoRef.current?.click())} aria-label={t.editor.addPhoto}>
                    <PlusIcon />
                  </button>
                )}
              </div>
              <button type="button" className="btn ghost block photo-slot-btn" onClick={() => (setPicking(slot), photoRef.current?.click())}>
                {c[slot] ? t.editor.changePhoto : t.editor.addPhoto}
              </button>
            </div>
          ))}
        </div>
        {c.photo && c.cover && (
          <div className="field" style={{ marginTop: 14 }}>
            <span>{t.editor.shownAsCover}</span>
            <div className="segmented" role="radiogroup" aria-label={t.editor.shownAsCover} style={{ marginBottom: 0 }}>
              {(['label', 'cover'] as const).map((k) => {
                const on = (c.coverFrom ?? 'cover') === k
                return (
                  <button key={k} type="button" role="radio" aria-checked={on} className={on ? 'on' : ''} onClick={() => set('coverFrom', k)}>
                    {k === 'label' ? t.editor.labelPhoto : t.editor.coverPhoto}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        <p className="muted small" style={{ margin: '10px 4px 0' }}>{t.editor.photosHint}</p>
        <input ref={photoRef} className="file-input" type="file" accept="image/*" onChange={(e) => (pickPhoto(picking, e.target.files?.[0]), (e.target.value = ''))} />
      </div>
      <button type="button" className="btn ghost block" style={{ marginBottom: 12 }} onClick={() => setRescanning(true)}>
        <CameraIcon /> {t.editor.rescan}
      </button>
      {rescanned && <div className="notice" style={{ margin: '0 0 12px' }}>{t.editor.rescanned}</div>}
      {rescanning && <RescanSheet photo={c.photo} onResult={applyRescan} onClose={() => setRescanning(false)} />}
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
        <div className="grid-2" style={{ marginBottom: 14 }}>
          <label className="field">
            <span>{t.editor.price}</span>
            <div className="price-input">
              <input className="input" inputMode="decimal" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ''))} />
              <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label={t.editor.currency}>
                {[...new Set([...CURRENCIES, currency])].map((code) => <option key={code} value={code}>{code}</option>)}
              </select>
            </div>
          </label>
          <label className="field">
            <span>{t.editor.weight}</span>
            <input className="input" inputMode="numeric" placeholder="250" value={c.weight ?? ''} onChange={(e) => set('weight', e.target.value ? Number(e.target.value.replace(/\D/g, '')) || null : null)} />
          </label>
        </div>
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
