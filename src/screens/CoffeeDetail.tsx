import { useMemo, useState } from 'react'
import { addShelfToCompare, db, MAX_COMPARE } from '../db'
import { predict, type Model } from '../recommend'
import type { Coffee } from '../types'
import { useMethodRating } from '../useMethodRating'
import { CoffeeSummary } from '../components/CoffeeSummary'
import { CoffeeEditor } from '../components/CoffeeEditor'
import { PredictionCard } from '../components/PredictionCard'
import { Sheet } from '../components/Sheet'
import { Stars } from '../components/Stars'
import { useLang, useT } from '../i18n'
import { useSettings } from '../settings'
import { BrewPicker } from '../components/BrewPicker'
import { NoteField } from '../components/NoteField'

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

  // Ratings per brew method: pick V60 or AeroPress, the stars are that method's rating.
  const { selected, shown, byMethod, unassigned, pick: pickMethod, rate, clear: clearRating } = useMethodRating(coffee, update)

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
            <BrewPicker value={selected} ratings={coffee} onChange={pickMethod} />
          </div>
          {unassigned != null && <p className="muted small" style={{ margin: '-4px 0 8px' }}>{t.coffee.pickBrewHint}</p>}
          <div style={{ margin: '0 0 12px' }}>
            <Stars value={shown} onChange={rate} />
          </div>
          <NoteField value={comment} placeholder={t.common.commentPlaceholder} onChange={setComment} onDone={() => comment !== coffee.comment && update({ comment })} />
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
