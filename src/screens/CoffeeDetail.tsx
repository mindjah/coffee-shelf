import { useMemo, useState } from 'react'
import { addShelfToCompare, db, MAX_COMPARE } from '../db'
import { predict, type Model } from '../recommend'
import type { Coffee } from '../types'
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
            {coffee.rating != null && <span className="muted">{coffee.rating.toFixed(1)}</span>}
          </div>
          <div style={{ margin: '12px 0' }}>
            <Stars value={coffee.rating} onChange={(rating) => update({ rating, ratedAt: Date.now(), brewedWith: coffee.brewedWith ?? brew })} />
          </div>
          {/* Rated before brew methods were asked: no method until you pick one. */}
          <BrewPicker
            value={coffee.rating == null ? brew : coffee.brewedWith}
            onChange={(b) => (saveSettings({ brew: b }), coffee.rating != null && update({ brewedWith: b }))}
          />
          <textarea className="input" placeholder={t.common.commentPlaceholder} value={comment} onChange={(e) => setComment(e.target.value)} onBlur={() => comment !== coffee.comment && update({ comment })} />
          {coffee.rating != null && (
            <button className="btn plain" style={{ marginTop: 6, paddingLeft: 0 }} onClick={() => update({ rating: null, ratedAt: null })}>{t.coffee.clearRating}</button>
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
