import type { Prediction } from '../recommend'
import { MIN_RATINGS, toneFor } from '../recommend'
import { reasonText, useLang, useT } from '../i18n'
import { Stars } from './Stars'
import { BREWS } from '../types'

/** `rated`: your own rating of this coffee from before, shown instead of a guess. */
export function PredictionCard({ prediction, ratedCount, rated }: { prediction: Prediction | null; ratedCount: number; rated?: number | null }) {
  const t = useT()
  const lang = useLang()
  if (rated != null) {
    return (
      <div className={`card tone-${toneFor(rated)}`}>
        <div className="prediction">
          <div className="dial" style={{ ['--p' as string]: (rated - 1) / 4 }}>
            <span>{rated.toFixed(1)}</span>
          </div>
          <div>
            <div className="verdict">{t.prediction.yourRating}</div>
            <div className="muted small">{t.prediction.yourRatingHint}</div>
          </div>
        </div>
      </div>
    )
  }
  if (!prediction) {
    return (
      <div className="card">
        <div className="verdict">{t.prediction.notEnough}</div>
        <div className="muted small">{t.prediction.rateMore(MIN_RATINGS - ratedCount)}</div>
        <div className="progress"><i style={{ width: `${(ratedCount / MIN_RATINGS) * 100}%` }} /></div>
      </div>
    )
  }
  const p = prediction
  return (
    <div className={`card tone-${p.tone}`}>
      <div className="prediction">
        <div className="dial" style={{ ['--p' as string]: (p.score - 1) / 4 }}>
          <span>{p.score.toFixed(1)}</span>
        </div>
        <div>
          <div className="verdict">{t.prediction.verdict[p.tone]}</div>
          <div className="muted small">{t.prediction.subtitle(t.prediction.confidence[p.confidence])}</div>
        </div>
      </div>
      {p.byBrew && (
        // Same coffee, both of your brew methods; the dial shows your usual one.
        <div className="row small brew-scores">
          <span className="muted">{t.prediction.byBrew}</span>
          <span className="spacer" />
          {BREWS.map((b) => (
            <span key={b} className={b === p.brew ? 'on' : 'muted'}>{t.brew[b]} {p.byBrew![b].toFixed(1)}</span>
          ))}
        </div>
      )}
      {p.reasons.length > 0 && (
        <ul className="reasons">
          {p.reasons.map((r) => (
            <li key={r.id}>
              <span className={`sign ${r.impact > 0 ? 'up' : 'down'}`}>{r.impact > 0 ? '+' : '−'}</span>
              {reasonText(t, r, lang)}
            </li>
          ))}
        </ul>
      )}
      {p.similar.length > 0 && (
        <>
          <h2 className="section" style={{ marginTop: 18 }}>{t.prediction.closest}</h2>
          {p.similar.map(({ coffee, similarity }) => (
            <div className="row small" key={coffee.id} style={{ padding: '5px 0' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{coffee.name || coffee.roaster}</div>
                <div className="muted">{coffee.roaster} · {t.prediction.similar(Math.round(similarity * 100))}</div>
              </div>
              <span className="spacer" />
              <Stars value={coffee.rating} small />
            </div>
          ))}
        </>
      )}
    </div>
  )
}
