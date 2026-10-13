import { useMemo, useState, type ReactNode } from 'react'
import { db, type CompareItem } from '../db'
import { MIN_RATINGS, predict, type Model, type Prediction } from '../recommend'
import { localized, reasonText, useLang, useT } from '../i18n'
import type { Coffee, CoffeeDraft } from '../types'
import { originLine, usePhotoUrl } from '../components/CoffeeSummary'
import { Sheet } from '../components/Sheet'
import { Stars } from '../components/Stars'

interface Props {
  items: CompareItem[]
  model: Model
  coffees: Coffee[]
  onClose: () => void
}

const sameCoffee = (a: CoffeeDraft, b: CoffeeDraft) =>
  !!a.name && `${a.roaster}|${a.name}`.toLowerCase().trim() === `${b.roaster}|${b.name}`.toLowerCase().trim()

function Thumb({ photo }: { photo?: ArrayBuffer }) {
  const url = usePhotoUrl(photo)
  return url ? <img className="cmp-thumb" src={url} alt="" /> : <div className="cmp-thumb" />
}

/** Bags side by side, one column each; rows line up so values can be read across. */
export function CompareSheet({ items, model, coffees, onClose }: Props) {
  const t = useT()
  const lang = useLang()
  const [message, setMessage] = useState<string>()

  const cols = useMemo(() => {
    const withPrediction = items.map((item) => ({
      item,
      prediction: predict(model, item.draft) as Prediction | null,
      seen: coffees.find((c) => sameCoffee(c, item.draft)),
    }))
    // Best predicted first; without predictions keep the order the bags were scanned.
    return withPrediction.sort((a, b) => (b.prediction?.score ?? 0) - (a.prediction?.score ?? 0) || a.item.addedAt - b.item.addedAt)
  }, [items, model, coffees])
  const best = cols.length > 1 && cols[0].prediction ? cols[0].item.id : undefined

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
      <div key={`${label}-${c.item.id}`} className={`cmp-cell${c.item.id === best ? ' best' : ''}${last ? ' cmp-foot' : ''}`}>
        {label && <div className="cmp-k">{label}</div>}
        {cell(c)}
      </div>
    ))
  const dash = <span className="muted">—</span>

  return (
    <Sheet title={t.compare.title} onClose={onClose} closeLabel={t.common.done}>
      {cols.length === 0 ? (
        <div className="empty">{t.compare.empty}</div>
      ) : (
        <>
          {model.count < MIN_RATINGS && <p className="muted small" style={{ margin: '0 4px 12px' }}>{t.compare.noPredictions(MIN_RATINGS)}</p>}
          {cols.length > 2 && <p className="muted small" style={{ margin: '0 4px 12px' }}>{t.compare.swipe}</p>}
          {message && <p className="small" style={{ margin: '0 4px 12px', color: 'var(--accent)', fontWeight: 600 }}>✓ {message}</p>}
          <div className="cmp-scroll">
            <div className="cmp-grid" style={{ gridTemplateColumns: cols.length === 1 ? '1fr' : `repeat(${cols.length}, var(--cmp-col))` }}>
              {cols.map((c) => (
                <div key={c.item.id} className={`cmp-cell cmp-head${c.item.id === best ? ' best' : ''}`}>
                  {c.item.id === best && <div className="cmp-best">{t.compare.best}</div>}
                  <Thumb photo={c.item.draft.photo} />
                  <div className="roaster">{c.item.draft.roaster || t.common.unknownRoaster}</div>
                  <div className="cmp-name">{c.item.draft.name || t.common.untitled}</div>
                </div>
              ))}

              {row(t.compare.prediction, ({ prediction: p }) =>
                p ? (
                  <div className={`tone-${p.tone}`}>
                    <div className="dial small" style={{ ['--p' as string]: (p.score - 1) / 4 }}><span>{p.score.toFixed(1)}</span></div>
                    <div className="cmp-verdict">{t.prediction.verdict[p.tone]}</div>
                  </div>
                ) : dash,
              )}
              {row(t.compare.sca, ({ item }) => (item.draft.scaScore != null ? <b>{item.draft.scaScore}</b> : dash))}
              {row(t.compare.origin, ({ item }) => originLine(item.draft, t, lang))}
              {row(t.compare.process, ({ item }) =>
                item.draft.process === 'unknown' ? dash : localized(item.draft, lang).processDetail || t.process[item.draft.process],
              )}
              {row(t.compare.roast, ({ item }) => (item.draft.roast === 'unknown' ? dash : t.roast[item.draft.roast]))}
              {row(t.compare.notes, ({ item }) => {
                const notes = localized(item.draft, lang).notes.slice(0, 5)
                return notes.length ? <div className="chips" style={{ marginTop: 0 }}>{notes.map((n) => <span key={n} className="chip note">{n}</span>)}</div> : dash
              })}
              {row(t.compare.why, ({ prediction: p }) =>
                p?.reasons.length ? (
                  <ul className="reasons" style={{ margin: 0 }}>
                    {p.reasons.slice(0, 3).map((r) => (
                      <li key={r.id}><span className={`sign ${r.impact > 0 ? 'up' : 'down'}`}>{r.impact > 0 ? '+' : '−'}</span>{reasonText(t, r)}</li>
                    ))}
                  </ul>
                ) : dash,
              )}
              {cols.some((c) => c.seen?.rating != null) && row(t.compare.yourRating, ({ seen }) => (seen?.rating != null ? <Stars value={seen.rating} small /> : dash))}
              {row('', ({ item }) => (
                <div className="stack">
                  <button className="btn ghost block cmp-btn" onClick={() => saveToShelf(item)}>{t.compare.save}</button>
                  <button className="btn plain block cmp-btn" onClick={() => db.compare.delete(item.id!)}>{t.compare.remove}</button>
                </div>
              ), true)}
            </div>
          </div>
          <button className="btn danger block" style={{ marginTop: 16 }} onClick={clearAll}>{t.compare.clear}</button>
        </>
      )}
    </Sheet>
  )
}
