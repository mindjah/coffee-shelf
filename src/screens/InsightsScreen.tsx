import { useState } from 'react'
import { MIN_RATINGS, TUNE_FROM, tasteSummary, type Model } from '../recommend'
import type { Coffee } from '../types'
import { groupRoasters } from '../roaster'
import { methodRatings } from '../ratings'
import { countryName, reasonText, useLang, useT } from '../i18n'
import { BookIcon, TasteIcon } from '../components/icons'
import { Encyclopedia } from '../components/Encyclopedia'

function groupAverages(rated: Coffee[], key: (c: Coffee) => string | null) {
  const groups = new Map<string, number[]>()
  for (const c of rated) {
    const k = key(c)
    if (!k) continue
    groups.set(k, [...(groups.get(k) ?? []), c.rating!])
  }
  return [...groups.entries()]
    .map(([label, rs]) => ({ label, avg: rs.reduce((a, b) => a + b, 0) / rs.length, n: rs.length }))
    .sort((a, b) => b.avg - a.avg)
}

function Breakdown({ title, rows }: { title: string; rows: { label: string; avg: number; n: number }[] }) {
  if (rows.length < 2) return null
  return (
    <>
      <h2 className="section">{title}</h2>
      <div className="card">
        {rows.map((r) => (
          <div className="pref" key={r.label}>
            <span>{r.label} <span className="muted small">· {r.n}</span></span>
            <b>{r.avg.toFixed(1)}</b>
            <span className="bar"><i style={{ width: `${(r.avg / 5) * 100}%` }} /></span>
          </div>
        ))}
      </div>
    </>
  )
}

export function InsightsScreen({ coffees, model }: { coffees: Coffee[]; model: Model }) {
  const t = useT()
  const lang = useLang()
  const rated = coffees.filter((c) => c.rating != null)
  const taste = tasteSummary(model)
  const [reading, setReading] = useState(false)
  const roasterOf = groupRoasters(coffees.map((c) => c.roaster))
  const roasters = groupAverages(rated, (c) => roasterOf(c.roaster)?.label ?? null).filter((r) => r.n >= 2).slice(0, 3)

  return (
    <div className="screen">
      <div className="row taste-head">
        <div>
          <h1 className="screen-title">{t.taste.title}</h1>
          <p className="screen-sub">{t.taste.subtitle}</p>
        </div>
        <span className="spacer" />
        <button type="button" className="book-btn" onClick={() => setReading(true)} aria-label={t.book.open}>
          <BookIcon />
        </button>
      </div>
      {reading && <Encyclopedia onClose={() => setReading(false)} />}

      {rated.length < MIN_RATINGS ? (
        <div className="empty">
          <TasteIcon />
          <div>{t.taste.needMore(MIN_RATINGS)}</div>
        </div>
      ) : (
        <>
          <div className="stat-row">
            <div className="stat"><b>{rated.length}</b><span>{t.taste.rated}</span></div>
            <div className="stat"><b>{model.mean.toFixed(1)}</b><span>{t.taste.average}</span></div>
            <div className="stat"><b>{coffees.length - rated.length}</b><span>{t.taste.toTry}</span></div>
          </div>

          {model.accuracy && (
            <>
              <h2 className="section">{t.taste.accuracy}</h2>
              <div className="card">
                <div style={{ fontWeight: 600 }}>{t.taste.accuracyLine(model.accuracy.mae.toFixed(2), Math.round(model.accuracy.within * 100))}</div>
                <p className="muted small" style={{ margin: '6px 0 0' }}>
                  {t.taste.accuracyHow(model.accuracy.n, model.accuracy.baseline.toFixed(2))} {model.accuracy.tuned ? t.taste.tuned : t.taste.notTuned(TUNE_FROM)}
                </p>
              </div>
            </>
          )}

          {taste ? (
            <>
              {taste.likes.length > 0 && (
                <>
                  <h2 className="section">{t.taste.higher}</h2>
                  <div className="card"><ul className="taste-list">
                    {taste.likes.map((r) => <li key={r.id}><span className="sign up">+</span>{reasonText(t, r, lang, true)}</li>)}
                  </ul></div>
                </>
              )}
              {taste.dislikes.length > 0 && (
                <>
                  <h2 className="section">{t.taste.lower}</h2>
                  <div className="card"><ul className="taste-list">
                    {taste.dislikes.map((r) => <li key={r.id}><span className="sign down">−</span>{reasonText(t, r, lang, true)}</li>)}
                  </ul></div>
                </>
              )}
            </>
          ) : (
            <p className="muted small" style={{ margin: '16px 4px 0' }}>{t.taste.fewMore}</p>
          )}

          <Breakdown title={t.taste.byProcess} rows={groupAverages(rated, (c) => (c.process === 'unknown' ? null : t.process[c.process]))} />
          <Breakdown title={t.taste.byOrigin} rows={groupAverages(rated, (c) => countryName(c, lang) || null)} />
          {/* Every rating counts here, so a coffee rated with both methods shows up under each. */}
          <Breakdown
            title={t.taste.byBrew}
            rows={groupAverages(rated.flatMap((c) => methodRatings(c).map((m) => ({ ...c, rating: m.rating, brewedWith: m.brew }))), (c) => (c.brewedWith ? t.brew[c.brewedWith] : null))}
          />
          <Breakdown title={t.taste.byRoast} rows={groupAverages(rated, (c) => (c.roast === 'unknown' ? null : t.roast[c.roast]))} />
          {roasters.length > 0 && <Breakdown title={t.taste.roasters} rows={roasters} />}
        </>
      )}
    </div>
  )
}
