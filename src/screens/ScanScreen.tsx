import { useMemo, useRef, useState } from 'react'
import { db } from '../db'
import { ScanError } from '../errors'
import { resizeImage } from '../image'
import { MIN_RATINGS, predict, type Model } from '../recommend'
import { activeKey, useSettings } from '../settings'
import { useT, type Dict } from '../i18n'
import type { Coffee, CoffeeDraft } from '../types'
import { CoffeeSummary, usePhotoUrl } from '../components/CoffeeSummary'
import { CoffeeEditor } from '../components/CoffeeEditor'
import { PredictionCard } from '../components/PredictionCard'
import { Stars } from '../components/Stars'
import { BeanIcon, CameraIcon, PlusIcon } from '../components/icons'

interface Props {
  model: Model
  coffees: Coffee[]
  onSaved: (id: number) => void
  onOpenSettings: () => void
}

type ErrorState = { code: keyof Dict['errors'] | 'photo'; detail?: string }

function Shot({ blob, onRemove }: { blob: Blob; onRemove: () => void }) {
  const t = useT()
  const url = usePhotoUrl(blob)
  return (
    <div className="shot">
      {url && <img src={url} alt={t.scan.bagPhoto} />}
      <button onClick={onRemove} aria-label={t.scan.removePhoto}>×</button>
    </div>
  )
}

export function ScanScreen({ model, coffees, onSaved, onOpenSettings }: Props) {
  const t = useT()
  const apiKey = activeKey(useSettings())
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)
  const [shots, setShots] = useState<Blob[]>([])
  const [reading, setReading] = useState(false)
  const [error, setError] = useState<ErrorState>()
  const [draft, setDraft] = useState<CoffeeDraft>()
  const [editing, setEditing] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')

  const prediction = useMemo(() => (draft ? predict(model, draft) : null), [model, draft])
  const seenBefore = useMemo(() => {
    if (!draft?.name) return undefined
    const key = (c: CoffeeDraft) => `${c.roaster}|${c.name}`.toLowerCase().replace(/\s+/g, ' ').trim()
    return coffees.find((c) => key(c) === key(draft))
  }, [coffees, draft])

  async function addFiles(files: FileList | null) {
    if (!files?.length) return
    setError(undefined)
    try {
      const resized = await Promise.all([...files].map((f) => resizeImage(f, 1600)))
      setShots((s) => [...s, ...resized].slice(0, 3))
    } catch {
      setError({ code: 'photo' })
    }
  }

  async function read() {
    setReading(true)
    setError(undefined)
    try {
      const { readBag } = await import('../scan')
      const d = await readBag(shots)
      setDraft({ ...d, photo: await (await resizeImage(shots[0], 600, 0.8)).arrayBuffer() })
    } catch (e) {
      setError(e instanceof ScanError ? { code: e.code, detail: e.detail } : { code: 'unknown', detail: (e as Error).message })
    } finally {
      setReading(false)
    }
  }

  function reset() {
    setShots([])
    setDraft(undefined)
    setRating(null)
    setComment('')
    setError(undefined)
  }

  async function save(withRating: boolean) {
    if (!draft) return
    const id = await db.coffees.add({
      ...draft,
      createdAt: Date.now(),
      rating: withRating ? rating : null,
      ratedAt: withRating && rating != null ? Date.now() : null,
      comment,
    })
    reset()
    onSaved(id as number)
  }

  const inputs = (
    <>
      <input ref={cameraRef} className="file-input" type="file" accept="image/*" capture="environment" onChange={(e) => (addFiles(e.target.files), (e.target.value = ''))} />
      <input ref={libraryRef} className="file-input" type="file" accept="image/*" multiple onChange={(e) => (addFiles(e.target.files), (e.target.value = ''))} />
    </>
  )

  if (draft) {
    return (
      <div className="screen">
        <div className="row">
          <h1 className="screen-title">{t.scan.newBag}</h1>
          <span className="spacer" />
          <button className="btn plain" onClick={() => setEditing(true)}>{t.common.edit}</button>
        </div>
        <p className="screen-sub">{t.scan.newBagHint}</p>
        <div className="stack">
          {seenBefore && (
            <div className="card row small">
              <span>{seenBefore.rating != null ? t.scan.seenBeforeRated : t.scan.seenBefore}</span>
              <span className="spacer" />
              {seenBefore.rating != null && <Stars value={seenBefore.rating} small />}
            </div>
          )}
          <PredictionCard prediction={prediction} ratedCount={model.count} />
          <CoffeeSummary coffee={draft} />
          <div className="card">
            <div className="row">
              <div style={{ fontWeight: 600 }}>{t.scan.tasted}</div>
              <span className="spacer" />
              {rating != null && <span className="muted">{rating.toFixed(1)}</span>}
            </div>
            <div style={{ margin: '12px 0' }}><Stars value={rating} onChange={setRating} /></div>
            <textarea className="input" placeholder={t.common.commentPlaceholder} value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
          <button className="btn block" disabled={rating == null} onClick={() => save(true)}>{t.scan.saveRated}</button>
          <button className="btn ghost block" onClick={() => save(false)}>{t.scan.saveLater}</button>
          <button className="btn danger block" onClick={reset}>{t.scan.discard}</button>
        </div>
        {editing && (
          <CoffeeEditor coffee={draft} onClose={() => setEditing(false)} onSave={(c) => (setDraft(c), setEditing(false))} />
        )}
      </div>
    )
  }

  return (
    <div className="screen">
      {inputs}
      <h1 className="screen-title">Coffee Shelf</h1>
      <p className="screen-sub">{t.scan.subtitle}</p>

      {reading ? (
        <div className="card brewing">
          <BeanIcon />
          <div className="verdict" style={{ marginTop: 14 }}>{t.scan.reading}</div>
          <div className="muted small">{t.scan.readingHint}</div>
        </div>
      ) : shots.length === 0 ? (
        <div className="hero">
          <img className="hero-bean" src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
          <h2>{t.scan.heroTitle}</h2>
          <p>{t.scan.heroText}</p>
          <button className="btn block" onClick={() => (apiKey ? cameraRef.current?.click() : onOpenSettings())}>
            <CameraIcon /> {apiKey ? t.scan.takePhoto : t.scan.needKey}
          </button>
          {apiKey && (
            <button className="btn plain block" style={{ marginTop: 6 }} onClick={() => libraryRef.current?.click()}>
              {t.scan.fromPhotos}
            </button>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="shots">
            {shots.map((b, i) => (
              <Shot key={i} blob={b} onRemove={() => setShots((s) => s.filter((_, j) => j !== i))} />
            ))}
            {shots.length < 3 && (
              <button className="shot add" onClick={() => cameraRef.current?.click()}>
                <PlusIcon />
                {t.scan.otherSide}
              </button>
            )}
          </div>
          <button className="btn block" style={{ marginTop: 14 }} onClick={read}>{t.scan.readLabel}</button>
          <button className="btn plain block" onClick={reset}>{t.scan.startOver}</button>
        </div>
      )}

      {error && (
        <div className="error" style={{ marginTop: 14 }}>
          {error.code === 'photo' ? t.scan.photoError : t.errors[error.code]}
          {error.detail && `: ${error.detail}`}
        </div>
      )}

      {!reading && shots.length === 0 && (
        <>
          <h2 className="section">{t.scan.howItWorks}</h2>
          <div className="card small stack">
            {t.scan.steps(MIN_RATINGS).map(([head, text]) => (
              <div key={head}><b>{head}</b> <span className="muted">{text}</span></div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
