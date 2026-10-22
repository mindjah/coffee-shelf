import { useMemo, useState } from 'react'
import { addShelfToCompare, db, MAX_COMPARE } from '../db'
import { predict, type Model } from '../recommend'
import type { Brew, Coffee } from '../types'
import { methodRatings, ratingFor, unassignedRating, withMethodRating } from '../ratings'
import { CoffeeSummary } from '../components/CoffeeSummary'
import { CoffeeEditor } from '../components/CoffeeEditor'
import { PredictionCard } from '../components/PredictionCard'
import { Sheet } from '../components/Sheet'
import { Stars } from '../components/Stars'
import { useLang, useT } from '../i18n'
import { saveSettings, useSettings } from '../settings'
import { BrewPicker } from '../components/BrewPicker'

export function CoffeeDetail({ coffee, model, onClose }: { coffee: Coffee; model: Model; onClose: () => void }) {
  const t = useT()
  const lang = useLang()
  const [editing, setEditing] = useState(false)
  const [compareNote, setCompareNote] = useState<string>()

  async function addToCompare() {
    const result = await addShelfToCompare(coffee)
    setCompareNote(result === 'added' ? t.compare.addedFromShelf : result === 'duplicate' ? t.compare.alreadyAdded : t.compare.full(MAX_COMPARE))
  }
  const [comment, setComment] = useState(coffee.comment)
  const { brew } = useSettings()
  const prediction = useMemo(() => (coffee.rating == null ? predict(model, coffee, brew) : null), [model, coffee, brew])

  const update = (patch: Partial<Coffee>) => db.coffees.update(coffee.id!, patch)

  // Ratings per brew method. The picker starts on the method of the latest rating, or on nothing
  // for an unrated coffee or an old rating that was never given a method.
  const byMethod = methodRatings(coffee).filter((m) => m.brew)
  const unassigned = unassignedRating(coffee)
  const [selected, setSelected] = useState<Brew | null>(() => (byMethod.length ? (coffee.brewedWith ?? byMethod[0].brew) : null))
  const shown = selected ? (ratingFor(coffee, selected) ?? unassigned) : coffee.rating

  function pickMethod(b: Brew | null) {
    if (!b) {
      // Tapped the chosen method again: none chosen. A rating given only with that method stays,
      // just without a method (as if it had never been picked).
      const only = byMethod.length === 1 ? byMethod[0].brew : null
      setSelected(null)
      if (only && only === selected) update({ ratings: undefined, brewedWith: null })
      return
    }
    setSelected(b)
    saveSettings({ brew: b })
    // An old rating without a method was given with the method picked now.
    if (unassigned != null) update(withMethodRating(coffee, b, unassigned))
  }

  function rate(value: number) {
    if (selected) return update(withMethodRating(coffee, selected, value))
    // No method picked on a coffee rated with both: the stars show the best rating, so change that one.
    const best = [...byMethod].sort((a, b) => b.rating - a.rating)[0]?.brew
    if (best) return update(withMethodRating(coffee, best, value))
    // No method picked yet: kept as a rating without one until a method is chosen.
    update({ rating: value, ratedAt: Date.now(), ratings: undefined, brewedWith: null })
  }

  function clearRating() {
    if (selected && ratingFor(coffee, selected) != null) return update(withMethodRating(coffee, selected, null))
    update({ rating: null, ratedAt: null, ratings: undefined, brewedWith: null })
  }

  const archived = !!coffee.archivedAt
  async function toggleArchive() {
    await update({ archivedAt: archived ? null : Date.now() })
    if (!archived) onClose() // it just left the shelf
  }

  async function remove() {
    if (!confirm(t.coffee.confirmDelete)) return
    await db.coffees.delete(coffee.id!)
    onClose()
  }

  return (
    <Sheet title={coffee.roaster || t.coffee.fallbackTitle} onClose={() => (comment !== coffee.comment && update({ comment }), onClose())} closeLabel={t.common.done} action={{ label: t.common.edit, onClick: () => setEditing(true) }}>
      <div className="stack">
        {archived && (
          <div className="notice archived-note">
            <p style={{ margin: '0 0 10px' }}>{t.archive.note}</p>
            <button className="btn block" onClick={toggleArchive}>{t.archive.restore}</button>
          </div>
        )}
        <div className="card">
          <div className="row">
            <div style={{ fontWeight: 600 }}>{coffee.rating == null ? t.coffee.rateAfter : t.coffee.yourRating}</div>
            <span className="spacer" />
            {byMethod.length > 1
              ? <span className="muted small">{byMethod.map((m) => `${t.brew[m.brew!]} ${m.rating.toFixed(1)}`).join(' · ')}</span>
              : coffee.rating != null && <span className="muted">{coffee.rating.toFixed(1)}</span>}
          </div>
          {/* Pick the method first: the stars are that method's rating. Nothing is picked on an unrated coffee. */}
          <div style={{ marginTop: 12 }}>
            <BrewPicker value={selected} onChange={pickMethod} />
          </div>
          {unassigned != null && <p className="muted small" style={{ margin: '-4px 0 8px' }}>{t.coffee.pickBrewHint}</p>}
          <div style={{ margin: '0 0 12px' }}>
            <Stars value={shown} onChange={rate} />
          </div>
          <textarea className="input" placeholder={t.common.commentPlaceholder} value={comment} onChange={(e) => setComment(e.target.value)} onBlur={() => comment !== coffee.comment && update({ comment })} />
          {shown != null && (
            <button className="btn plain" style={{ marginTop: 6, paddingLeft: 0 }} onClick={clearRating}>{t.coffee.clearRating}</button>
          )}
        </div>
        {coffee.rating == null && !archived && <PredictionCard prediction={prediction} ratedCount={model.count} />}
        <CoffeeSummary coffee={coffee} />
        <p className="muted small" style={{ textAlign: 'center' }}>{t.coffee.scanned} {new Date(coffee.createdAt).toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        {!archived && <button className="btn ghost block" onClick={addToCompare}>{t.compare.add}</button>}
        {compareNote && <div className="notice" style={{ marginTop: 0 }}>{compareNote}</div>}
        {!archived && <button className="btn ghost block" onClick={toggleArchive}>{t.archive.move}</button>}
        <button className="btn danger block" onClick={remove}>{t.coffee.delete}</button>
      </div>
      {editing && (
        <CoffeeEditor coffee={coffee} onClose={() => setEditing(false)} onSave={async (c) => (await update(c), setEditing(false))} />
      )}
    </Sheet>
  )
}
