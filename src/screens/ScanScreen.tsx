import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clearPendingScan, db, loadPendingScan, savePendingScan } from '../db'
import { ScanError } from '../errors'
import { resizeImage } from '../image'
import { MIN_RATINGS, predict, type Model } from '../recommend'
import { needsKey, useSettings } from '../settings'
import { emptyDraft, isBlankDraft, parseLabel } from '../parse'
import type { OcrProgress } from '../ocr'
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

const READ_TIMEOUT_MS = 90_000

/** Scan screen switch: read a bag photo, or type everything in by hand. Remembered per device. */
type EntryMode = 'scan' | 'manual'
const ENTRY_MODE_KEY = 'coffee-shelf.entryMode'
function readEntryMode(): EntryMode {
  try {
    return localStorage.getItem(ENTRY_MODE_KEY) === 'manual' ? 'manual' : 'scan'
  } catch {
    return 'scan'
  }
}

/** Settles as soon as the signal aborts, so the UI never waits on a request that won't stop. */
function untilAborted<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason)
    signal.addEventListener('abort', () => reject(signal.reason), { once: true })
    work.then(resolve, reject)
  })
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
  const settings = useSettings()
  const provider = settings.provider
  const [mode, setMode] = useState<EntryMode>(readEntryMode)
  const chooseMode = (m: EntryMode) => {
    setMode(m)
    try {
      localStorage.setItem(ENTRY_MODE_KEY, m)
    } catch {
      // Not remembered in private mode; the switch still works.
    }
  }
  const missingKey = mode === 'scan' && needsKey(settings)
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)
  const [shots, setShots] = useState<Blob[]>([])
  const [reading, setReading] = useState(false)
  const [error, setError] = useState<ErrorState>()
  const [draft, setDraft] = useState<CoffeeDraft>()
  const [editing, setEditing] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [ocr, setOcr] = useState<OcrProgress>()
  const [ocrText, setOcrText] = useState('')
  const reader = useRef<AbortController>(undefined)

  // Restore an unsaved scan from the last session, then keep it saved as it changes so it
  // survives iOS closing the app in the background. An interrupted read just needs a retry.
  const restored = useRef(false)
  const latest = useRef({ shots, draft, rating, comment })
  latest.current = { shots, draft, rating, comment }

  useEffect(() => {
    loadPendingScan()
      .then((p) => {
        if (!p) return
        setShots(p.shots.map((b) => new Blob([b], { type: 'image/jpeg' })))
        setDraft(p.draft)
        setRating(p.rating)
        setComment(p.comment)
      })
      .catch(() => {})
      .finally(() => (restored.current = true))
  }, [])

  const persist = useCallback(async () => {
    if (!restored.current) return
    const { shots, draft, rating, comment } = latest.current
    try {
      if (!shots.length && !draft) await clearPendingScan()
      else await savePendingScan({ shots: await Promise.all(shots.map((s) => s.arrayBuffer())), draft, rating, comment })
    } catch {
      // Storage unavailable (e.g. private mode): the scan still works, it just won't survive a restart.
    }
  }, [])

  useEffect(() => {
    const id = setTimeout(persist, 300)
    return () => clearTimeout(id)
  }, [shots, draft, rating, comment, persist])

  useEffect(() => {
    // iOS may close a backgrounded app without warning; flush pending typing right away.
    const flush = () => document.visibilityState === 'hidden' && persist()
    document.addEventListener('visibilitychange', flush)
    window.addEventListener('pagehide', persist)
    return () => {
      document.removeEventListener('visibilitychange', flush)
      window.removeEventListener('pagehide', persist)
    }
  }, [persist])

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

  const thumbnail = async () => (shots[0] ? (await resizeImage(shots[0], 600, 0.8)).arrayBuffer() : undefined)

  function startManual() {
    setDraft(emptyDraft())
    setEditing(true)
  }

  async function read() {
    if (mode === 'manual') {
      setDraft({ ...emptyDraft(), photo: await thumbnail() })
      return setEditing(true)
    }
    const ac = new AbortController()
    reader.current = ac
    // AI reading can hang without an answer; on-device OCR has no limit because the first run downloads files.
    const timer = provider === 'ocr' ? undefined : setTimeout(() => ac.abort(new ScanError('timeout')), READ_TIMEOUT_MS)
    setReading(true)
    setError(undefined)
    try {
      if (provider === 'ocr') {
        // On-device text recognition, then rule-based parsing; the user reviews the result.
        const { recognize } = await import('../ocr')
        const text = await untilAborted(recognize(shots, setOcr, ac.signal), ac.signal)
        setOcrText(text)
        setDraft({ ...parseLabel(text), photo: await thumbnail() })
        setEditing(true)
      } else {
        const { readBag } = await import('../scan')
        const d = await untilAborted(readBag(shots, ac.signal), ac.signal)
        setDraft({ ...d, photo: await thumbnail() })
      }
    } catch (e) {
      const err = ac.signal.aborted ? ac.signal.reason : e
      // A user cancel just returns to the photos; anything else is shown.
      if (ac.signal.aborted && !(err instanceof ScanError)) return
      setError(err instanceof ScanError ? { code: err.code, detail: err.detail } : { code: 'unknown', detail: (err as Error).message })
    } finally {
      clearTimeout(timer)
      if (reader.current === ac) {
        reader.current = undefined
        setReading(false)
        setOcr(undefined)
      }
    }
  }

  function cancelReading() {
    reader.current?.abort()
  }

  function reset() {
    setShots([])
    setDraft(undefined)
    setRating(null)
    setComment('')
    setError(undefined)
    setOcrText('')
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
        <p className="screen-sub">{ocrText ? t.scan.reviewHint : t.scan.newBagHint}</p>
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
          {ocrText && (
            <details className="card small">
              <summary style={{ fontWeight: 600 }}>{t.scan.recognizedText}</summary>
              <pre className="muted" style={{ whiteSpace: 'pre-wrap', font: 'inherit', margin: '10px 0 0' }}>{ocrText}</pre>
            </details>
          )}
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
          <CoffeeEditor coffee={draft} onClose={() => (setEditing(false), isBlankDraft(draft) && reset())} onSave={(c) => (setDraft(c), setEditing(false))} />
        )}
      </div>
    )
  }

  return (
    <div className="screen">
      {inputs}
      <h1 className="screen-title">Coffee Shelf</h1>
      <p className="screen-sub">{t.scan.subtitle}</p>
      {!reading && (
        <div className="segmented" role="tablist">
          {(['scan', 'manual'] as EntryMode[]).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} onClick={() => chooseMode(m)}>
              {t.scan.modes[m]}
            </button>
          ))}
        </div>
      )}

      {reading ? (
        <div className="card brewing">
          <BeanIcon />
          {provider === 'ocr' ? (
            <>
              <div className="verdict" style={{ marginTop: 14 }}>
                {ocr?.stage === 'reading' ? t.scan.ocrReading : t.scan.ocrLoading} {ocr ? `${Math.round(ocr.progress * 100)}%` : ''}
              </div>
              <div className="muted small">{ocr?.stage === 'reading' ? '' : t.scan.ocrFirstTime}</div>
            </>
          ) : (
            <>
              <div className="verdict" style={{ marginTop: 14 }}>{t.scan.reading}</div>
              <div className="muted small">{t.scan.readingHint}</div>
            </>
          )}
          <button className="btn ghost" style={{ marginTop: 20, minWidth: 160 }} onClick={cancelReading}>{t.scan.cancelReading}</button>
        </div>
      ) : shots.length === 0 ? (
        <div className="hero">
          <span className="hero-bean" aria-hidden="true"><BeanIcon /></span>
          {mode === 'manual' ? (
            <>
              <h2>{t.scan.manualTitle}</h2>
              <p>{t.scan.manualText}</p>
              <button className="btn block" onClick={startManual}>
                <PlusIcon /> {t.scan.enterManually}
              </button>
              <button className="btn plain block" style={{ marginTop: 6 }} onClick={() => cameraRef.current?.click()}>
                {t.scan.addPhoto}
              </button>
            </>
          ) : (
            <>
              <h2>{t.scan.heroTitle}</h2>
              <p>{t.scan.heroText}</p>
              <button className="btn block" onClick={() => (missingKey ? onOpenSettings() : cameraRef.current?.click())}>
                <CameraIcon /> {missingKey ? t.scan.needKey : t.scan.takePhoto}
              </button>
              {!missingKey && (
                <button className="btn plain block" style={{ marginTop: 6 }} onClick={() => libraryRef.current?.click()}>
                  {t.scan.fromPhotos}
                </button>
              )}
            </>
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
          <button className="btn block" style={{ marginTop: 14 }} onClick={read}>
            {mode === 'manual' ? t.scan.continue : provider === 'ocr' ? t.scan.recognize : t.scan.readLabel}
          </button>
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
