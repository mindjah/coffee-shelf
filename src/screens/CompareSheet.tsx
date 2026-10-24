import { useMemo, useState, type ReactNode } from 'react'
import { addShelfToCompare, db, MAX_COMPARE, type CompareItem } from '../db'
import { MIN_RATINGS, predict, toneFor, type Model, type Prediction } from '../recommend'
import { formatPrice, localized, pricePer100g, reasonText, useLang, useT } from '../i18n'
import type { Coffee, CoffeeDraft } from '../types'
import { originLine } from '../components/CoffeeSummary'
import { CoffeeThumb } from '../components/CoffeeThumb'
import { Sheet } from '../components/Sheet'
import { Stars } from '../components/Stars'
import { useShelfFilters } from '../components/ShelfFilters'
import { Bookcase } from '../components/Bookcase'
import { useSettings } from '../settings'

interface Props {
  items: CompareItem[]
  model: Model
  coffees: Coffee[]
  onClose: () => void
  /**
   * A quick comparison opened from a scan (the bag vs. coffees picked from "Closest to"): not the
   * saved comparison list, so Remove calls this instead and the list's own buttons are hidden.
   */
  onQuickRemove?: (item: CompareItem) => void
}

const sameCoffee = (a: CoffeeDraft, b: CoffeeDraft) =>
  !!a.name && `${a.roaster}|${a.name}`.toLowerCase().trim() === `${b.roaster}|${b.name}`.toLowerCase().trim()


/** Pick shelf coffees to compare against; tapping toggles a coffee in or out of the comparison. */
function ShelfPicker({ coffees, items, onClose }: { coffees: Coffee[]; items: CompareItem[]; onClose: () => void }) {
  const t = useT()
  const lang = useLang()
  const [message, setMessage] = useState<string>()
  // Same search, filters and order as the Shelf.
  const { controls, shown, view, filtering, clearFilters } = useShelfFilters(coffees, { withView: true })

  async function toggle(c: Coffee) {
    const existing = items.find((i) => i.coffeeId === c.id)
    if (existing) return void db.compare.delete(existing.id!)
    const result = await addShelfToCompare(c)
    setMessage(result === 'full' ? t.compare.full(MAX_COMPARE) : undefined)
  }

  return (
    <Sheet title={t.compare.fromShelf} onClose={onClose} closeLabel={t.common.done}>
      {coffees.length === 0 ? (
        <div className="empty">{t.compare.shelfEmpty}</div>
      ) : (
        <>
          {controls}
          {message && <div className="notice" style={{ margin: '0 0 12px' }}>{message}</div>}
          {shown.length === 0 && (
            <div className="empty">
              <div>{t.shelf.noMatch}</div>
              {filtering && <button className="btn plain" onClick={clearFilters}>{t.shelf.clearFilters}</button>}
            </div>
          )}
          {view === 'compact' && shown.length > 0 && (
            <Bookcase coffees={shown} onPick={toggle} selected={(c) => items.some((i) => i.coffeeId === c.id)} />
          )}
          {view === 'list' && shown.map((c) => {
            const on = items.some((i) => i.coffeeId === c.id)
            return (
              <button key={c.id} className={`card list-item pick${on ? ' on' : ''}`} onClick={() => toggle(c)} aria-pressed={on}>
                <CoffeeThumb photo={c.photo} name={[c.roaster, c.name].filter(Boolean).join(' – ')} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="roaster">{c.roaster || t.common.unknownRoaster}</div>
                  <div className="coffee-name">{c.name || t.common.untitled}</div>
                  <div className="muted small">{originLine(c, t, lang)}</div>
                  {c.rating != null && <div style={{ marginTop: 4 }}><Stars value={c.rating} small /></div>}
                </div>
                <span className="pick-mark" aria-hidden="true">{on ? '✓' : '+'}</span>
              </button>
            )
          })}
        </>
      )}
    </Sheet>
  )
}

/** Bags side by side, one column each; rows line up so values can be read across. */
export function CompareSheet({ items, model, coffees, onClose, onQuickRemove }: Props) {
  const t = useT()
  const lang = useLang()
  const { brew } = useSettings()
  const [message, setMessage] = useState<string>()
  const [picking, setPicking] = useState(false)

  const cols = useMemo(() => {
    const all = items.map((item) => {
      const shelf = item.coffeeId != null ? coffees.find((c) => c.id === item.coffeeId) : undefined
      const d: CoffeeDraft = shelf ?? item.draft
      // A coffee you've rated is shown with your real rating, not a guess.
      const rated = shelf?.rating ?? null
      const prediction: Prediction | null = rated != null ? null : predict(model, d, brew)
      return {
        item, d, rated,
        onShelf: item.coffeeId != null,
        prediction,
        value: rated ?? prediction?.score ?? 0,
        seen: item.coffeeId == null ? coffees.find((c) => sameCoffee(c, d)) : undefined,
      }
    })
    // New bags first, best predicted first; shelf coffees follow as a reference.
    return all.sort((a, b) => Number(a.onShelf) - Number(b.onShelf) || b.value - a.value || a.item.addedAt - b.item.addedAt)
  }, [items, model, coffees, brew])
  const scanned = cols.filter((c) => !c.onShelf)
  // "Best match" ranks the new bags against each other, so it needs at least two of them.
  const best = scanned.length > 1 && scanned[0].prediction ? scanned[0].item.id : undefined

  async function saveToShelf(item: CompareItem) {
    await db.coffees.add({ ...item.draft, createdAt: Date.now(), rating: null, ratedAt: null, comment: '' })
    await db.compare.delete(item.id!)
    setMessage(t.compare.saved)
  }

  async function clearAll() {
    if (!confirm(t.compare.confirmClear)) return
    await db.compare.clear()
    onClose()
  }

  // One grid row per attribute, so values line up across bags; each cell repeats its label.
  const row = (label: string, cell: (c: (typeof cols)[number]) => ReactNode, last = false) =>
    cols.map((c) => (
      <div key={`${label}-${c.item.id}`} className={`cmp-cell${c.item.id === best ? ' best' : ''}${c.onShelf ? ' shelf' : ''}${last ? ' cmp-foot' : ''}`}>
        {label && <div className="cmp-k">{label}</div>}
        {cell(c)}
      </div>
    ))
  const dash = <span className="muted">—</span>
  const dial = (score: number, caption: string) => (
    <div className={`tone-${toneFor(score)}`}>
      <div className="dial small" style={{ ['--p' as string]: (score - 1) / 4 }}><span>{score.toFixed(1)}</span></div>
      <div className="cmp-verdict">{caption}</div>
    </div>
  )

  return (
    <Sheet title={t.compare.title} onClose={onClose} closeLabel={t.common.done}>
      {cols.length === 0 ? (
        <>
          <div className="empty">{t.compare.empty}</div>
          {!onQuickRemove && <button className="btn ghost block" onClick={() => setPicking(true)}>{t.compare.fromShelf}</button>}
        </>
      ) : (
        <>
          {model.count < MIN_RATINGS && <p className="muted small" style={{ margin: '0 4px 12px' }}>{t.compare.noPredictions(MIN_RATINGS)}</p>}
          {cols.length > 2 && <p className="muted small" style={{ margin: '0 4px 12px' }}>{t.compare.swipe}</p>}
          {message && <p className="small" style={{ margin: '0 4px 12px', color: 'var(--accent)', fontWeight: 600 }}>✓ {message}</p>}
          <div className="cmp-scroll">
            <div className="cmp-grid" style={{ gridTemplateColumns: cols.length === 1 ? '1fr' : `repeat(${cols.length}, var(--cmp-col))` }}>
              {cols.map((c) => (
                <div key={c.item.id} className={`cmp-cell cmp-head${c.item.id === best ? ' best' : ''}${c.onShelf ? ' shelf' : ''}`}>
                  {c.item.id === best && <div className="cmp-best">{t.compare.best}</div>}
                  {c.onShelf && <div className="cmp-best cmp-shelf">{t.compare.onShelf}</div>}
                  <CoffeeThumb photo={c.d.photo} className="cmp-thumb" name={[c.d.roaster, c.d.name].filter(Boolean).join(' – ')} />
                  <div className="roaster">{c.d.roaster || t.common.unknownRoaster}</div>
                  <div className="cmp-name">{c.d.name || t.common.untitled}</div>
                </div>
              ))}

              {row(t.compare.prediction, (c) =>
                c.rated != null ? dial(c.rated, t.compare.yourRating)
                  : c.prediction ? dial(c.prediction.score, t.prediction.verdict[c.prediction.tone])
                  : dash,
              )}
              {row(t.compare.sca, ({ d }) => (d.scaScore != null ? <b>{d.scaScore}</b> : dash))}
              {cols.some(({ d }) => d.price != null) && row(t.compare.price, ({ d }) =>
                d.price != null ? (
                  <>
                    <b>{formatPrice(d, lang)}</b>
                    {pricePer100g(d, lang) && <div className="muted small">{t.coffee.per100g(pricePer100g(d, lang))}</div>}
                  </>
                ) : dash,
              )}
              {row(t.compare.origin, ({ d }) => originLine(d, t, lang))}
              {row(t.compare.process, ({ d }) => (d.process === 'unknown' ? dash : localized(d, lang).processDetail || t.process[d.process]))}
              {row(t.compare.roast, ({ d }) => (d.roast === 'unknown' ? dash : t.roast[d.roast]))}
              {row(t.compare.notes, ({ d }) => {
                const notes = localized(d, lang).notes.slice(0, 5)
                return notes.length ? <div className="chips" style={{ marginTop: 0 }}>{notes.map((n) => <span key={n} className="chip note">{n}</span>)}</div> : dash
              })}
              {row(t.compare.why, ({ prediction: p }) =>
                p?.reasons.length ? (
                  <ul className="reasons" style={{ margin: 0 }}>
                    {p.reasons.slice(0, 3).map((r) => (
                      <li key={r.id}><span className={`sign ${r.impact > 0 ? 'up' : 'down'}`}>{r.impact > 0 ? '+' : '−'}</span>{reasonText(t, r, lang)}</li>
                    ))}
                  </ul>
                ) : dash,
              )}
              {cols.some((c) => c.seen?.rating != null) && row(t.compare.yourRating, ({ seen }) => (seen?.rating != null ? <Stars value={seen.rating} small /> : dash))}
              {row('', ({ item, onShelf }) => (
                <div className="stack">
                  {!onShelf && !onQuickRemove && <button className="btn ghost block cmp-btn" onClick={() => saveToShelf(item)}>{t.compare.save}</button>}
                  <button className="btn plain block cmp-btn" onClick={() => (onQuickRemove ? onQuickRemove(item) : db.compare.delete(item.id!))}>{t.compare.remove}</button>
                </div>
              ), true)}
            </div>
          </div>
          {!onQuickRemove && (
            <>
              <button className="btn ghost block" style={{ marginTop: 16 }} disabled={items.length >= MAX_COMPARE} onClick={() => setPicking(true)}>
                {t.compare.fromShelf}
              </button>
              <button className="btn danger block" style={{ marginTop: 8 }} onClick={clearAll}>{t.compare.clear}</button>
            </>
          )}
        </>
      )}
      {picking && <ShelfPicker coffees={coffees} items={items} onClose={() => setPicking(false)} />}
    </Sheet>
  )
}
