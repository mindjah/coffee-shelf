import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { clearPendingScan, db, loadPendingScan, MAX_COMPARE, savePendingScan, type CompareItem } from '../db'
import { CompareSheet } from './CompareSheet'
import { ScanError } from '../errors'
import { PHOTO_SIDE, resizeImage } from '../image'
import { MIN_RATINGS, predict, type Model } from '../recommend'
import { needsKey, useSettings } from '../settings'
import { emptyDraft, isBlankDraft } from '../parse'
import type { OcrProgress } from '../ocr'
import type { ReadStatus } from '../scan'
import { statusText, useT, type Dict } from '../i18n'
import type { Coffee, CoffeeDraft } from '../types'
import { brewTitle, brewWhy, CoffeeSummary, usePhotoUrl } from '../components/CoffeeSummary'
import { CoffeeEditor } from '../components/CoffeeEditor'
import { PredictionCard } from '../components/PredictionCard'
import { Stars } from '../components/Stars'
import { BeanIcon, CameraIcon, PlusIcon } from '../components/icons'
import { Avatar } from '../components/Avatar'
import { PourOver } from '../components/PourOver'
import { focusDriveSection } from '../gdrive'
import { Linkify } from '../components/Linkify'
import { openPhoto } from '../components/PhotoViewer'
import { shelfHistory } from '../history'
import { brewMethod } from '../brew'
import { BrewPicker } from '../components/BrewPicker'
import { NoteField } from '../components/NoteField'
import { useMethodRating, type Rated } from '../useMethodRating'

interface Props {
  model: Model
  coffees: Coffee[]
  onSaved: (id: number) => void
  onOpenSettings: () => void
}

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

type ErrorState = { code: keyof Dict['errors'] | 'photo'; detail?: string }

function Shot({ blob, onRemove }: { blob: Blob; onRemove: () => void }) {
  const t = useT()
  const url = usePhotoUrl(blob)
  return (
    <div className="shot">
      {url && <img src={url} alt={t.scan.bagPhoto} onClick={() => openPhoto(blob)} />}
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
  // This bag's rating, per brew method like a saved coffee's (see useMethodRating).
  const [rated, setRated] = useState<Rated>({ rating: null })
  const rating = useMethodRating(rated, (patch) => setRated((r) => ({ ...r, ...patch })))
  const [comment, setComment] = useState('')
  const [ocr, setOcr] = useState<OcrProgress>()
  const [ocrText, setOcrText] = useState('')
  // When the usual model is busy: what's happening while reading, then which model stood in.
  const [readStatus, setReadStatus] = useState<ReadStatus>()
  const [readVia, setReadVia] = useState<string>()
  const reader = useRef<AbortController>(undefined)
  // "Closest to" coffees picked to compare this bag with on the spot (not the saved comparison list).
  const [closestPicked, setClosestPicked] = useState<number[]>([])
  const [quickCompare, setQuickCompare] = useState(false)
  const compareItems = useLiveQuery(() => db.compare.orderBy('addedAt').toArray(), []) ?? []
  const [comparing, setComparing] = useState(false)
  const [notice, setNotice] = useState<string>()

  // Restore an unsaved scan from the last session, then keep it saved as it changes so it
  // survives iOS closing the app in the background. An interrupted read just needs a retry.
  const restored = useRef(false)
  const latest = useRef({ shots, draft, rated, comment })
  latest.current = { shots, draft, rated, comment }

  useEffect(() => {
    loadPendingScan()
      .then((p) => {
        if (!p) return
        setShots(p.shots.map((b) => new Blob([b], { type: 'image/jpeg' })))
        setDraft(p.draft)
        setRated({ rating: p.rating, ratings: p.ratings, brewedWith: p.brewedWith })
        setComment(p.comment)
      })
      .catch(() => {})
      .finally(() => (restored.current = true))
  }, [])

  const persist = useCallback(async () => {
    if (!restored.current) return
    const { shots, draft, rated, comment } = latest.current
    try {
      if (!shots.length && !draft) await clearPendingScan()
      else await savePendingScan({ shots: await Promise.all(shots.map((s) => s.arrayBuffer())), draft, rating: rated.rating, ratings: rated.ratings, brewedWith: rated.brewedWith, comment })
    } catch {
      // Storage unavailable (e.g. private mode): the scan still works, it just won't survive a restart.
    }
  }, [])

  useEffect(() => {
    const id = setTimeout(persist, 300)
    return () => clearTimeout(id)
  }, [shots, draft, rated, comment, persist])

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

  const prediction = useMemo(() => (draft ? predict(model, draft, settings.brew) : null), [model, draft, settings.brew])
  const history = useMemo(() => (draft ? shelfHistory(draft, coffees) : undefined), [coffees, draft])
  // The quick comparison: this bag first, then the picked coffees (negative ids: they aren't saved).
  const quickItems = useMemo<CompareItem[]>(() => (draft ? [
    { id: -1, addedAt: 0, draft },
    ...closestPicked.flatMap((id, i) => {
      const c = coffees.find((x) => x.id === id)
      return c ? [{ id: -(i + 2), addedAt: i + 1, draft: c, coffeeId: id }] : []
    }),
  ] : []), [draft, closestPicked, coffees])
  const brew = useMemo(() => (draft ? brewMethod(draft) : null), [draft])

  // A coffee you've rated before starts with that rating filled in, once per scanned bag.
  const prefilled = useRef(false)
  useEffect(() => {
    if (!draft) return void (prefilled.current = false)
    if (prefilled.current) return
    prefilled.current = true
    // Its ratings for each method come along, so switching method shows what you gave with it.
    const existing = history?.tried[0]
    if (existing && existing.rating != null) setRated((r) => (r.rating != null ? r : { rating: existing.rating, ratings: existing.ratings, brewedWith: existing.brewedWith }))
  }, [draft, history])

  async function addFiles(files: FileList | null) {
    if (!files?.length) return
    setError(undefined)
    setNotice(undefined)
    try {
      const resized = await Promise.all([...files].map((f) => resizeImage(f, 1600)))
      setShots((s) => [...s, ...resized].slice(0, 3))
    } catch {
      setError({ code: 'photo' })
    }
  }

  const thumbnail = async () => (shots[0] ? (await resizeImage(shots[0], PHOTO_SIDE, 0.82)).arrayBuffer() : undefined)

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
    setReading(true)
    setError(undefined)
    try {
      const { readLabel } = await import('../scan')
      setReadStatus(undefined)
      const { draft: d, ocrText: text, via } = await readLabel(shots, ac.signal, setOcr, setReadStatus)
      setReadVia(via)
      setDraft({ ...d, photo: await thumbnail() })
      if (text) {
        // Read without AI: open the editor so the fields get checked.
        setOcrText(text)
        setEditing(true)
      }
    } catch (err) {
      // A user cancel just returns to the photos; anything else (including the time limit) is shown.
      if (ac.signal.aborted && !(err instanceof ScanError)) return
      setError(err instanceof ScanError ? { code: err.code, detail: err.detail } : { code: 'unknown', detail: (err as Error).message })
    } finally {
      if (reader.current === ac) {
        reader.current = undefined
        setReading(false)
        setOcr(undefined)
        setReadStatus(undefined)
      }
    }
  }

  function cancelReading() {
    reader.current?.abort()
  }

  function reset() {
    rating.reset()
    setClosestPicked([])
    setQuickCompare(false)
    setShots([])
    setDraft(undefined)
    setRated({ rating: null })
    setComment('')
    setError(undefined)
    setOcrText('')
    setReadVia(undefined)
    setNotice(undefined)
  }

  /** Shop flow: park this bag for side-by-side comparison and get ready for the next one. */
  async function addToCompare() {
    if (!draft) return
    if (compareItems.length >= MAX_COMPARE) return setNotice(t.compare.full(MAX_COMPARE))
    await db.compare.add({ addedAt: Date.now(), draft })
    reset()
    setNotice(t.compare.added)
  }

  async function save(withRating: boolean) {
    if (!draft) return
    const id = await db.coffees.add({
      ...draft,
      createdAt: Date.now(),
      ...(withRating && rated.rating != null
        ? { rating: rated.rating, ratings: rated.ratings, brewedWith: rated.brewedWith ?? null, ratedAt: Date.now() }
        : { rating: null, ratedAt: null, brewedWith: null }),
      comment,
    })
    reset()
    onSaved(id as number)
  }

  /** The rating fields for an existing coffee: started from its own ratings, so they replace them when changed. */
  function rescanRating(existing: Coffee): Partial<Coffee> {
    const same = rated.rating === existing.rating && JSON.stringify(rated.ratings ?? {}) === JSON.stringify(existing.ratings ?? {})
    if (same || rated.rating == null) return {}
    return { rating: rated.rating, ratings: rated.ratings, brewedWith: rated.brewedWith ?? null, ratedAt: Date.now() }
  }

  /** Same coffee already on the shelf: the new rating, comment and bag photo go onto that entry. */
  async function updateExisting() {
    const existing = history?.tried[0]
    if (!draft || !existing?.id) return
    const note = comment.trim()
    await db.coffees.update(existing.id, {
      ...rescanRating(existing),
      ...(note && note !== existing.comment.trim() && { comment: existing.comment.trim() ? `${existing.comment.trim()}\n\n${note}` : note }),
      ...(draft.photo && { photo: draft.photo }),
      // Bought again, so it's back on the shelf.
      archivedAt: null,
    })
    reset()
    onSaved(existing.id)
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
        {readVia && <p className="muted small" style={{ margin: '-8px 4px 12px' }}>{t.scan.readVia(readVia)}</p>}
        <div className="stack">
          {((history && (history.tried.length > 0 || history.roaster)) || brew) && (
            // First thing after a scan: this coffee and its roaster on your shelf, and what it's
            // probably roasted for when the bag doesn't say.
            <div className="card small scan-facts">
              {history?.tried.length ? (
                <div className="row">
                  <span>{history.rating != null ? t.scan.triedRated : t.scan.triedUnrated}</span>
                  <span className="spacer" />
                  {history.rating != null && <Stars value={history.rating} small />}
                </div>
              ) : null}
              {history?.roaster && (
                <div className="row">
                  <span>{history.roaster.bags ? t.scan.roasterBags(history.roaster.label, history.roaster.bags) : t.scan.roasterNew(history.roaster.label)}</span>
                  <span className="spacer" />
                  {history.roaster.average != null && (
                    <span className="muted" style={{ whiteSpace: 'nowrap' }}>{t.scan.roasterAverage} ★ {history.roaster.average.toFixed(1)}</span>
                  )}
                </div>
              )}
              {brew && (
                <div>
                  <div>{brewTitle(brew, t)}</div>
                  <div className="muted">{brewWhy(brew, t)}</div>
                </div>
              )}
            </div>
          )}
          <PredictionCard
            prediction={prediction}
            ratedCount={model.count}
            rated={history?.rating}
            pick={{
              selected: closestPicked,
              onToggle: (id) => setClosestPicked((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])),
              onCompare: () => setQuickCompare(true),
            }}
          />
          <CoffeeSummary coffee={draft} showBrewWhy={false} />
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
              {rating.byMethod.length > 1
                ? <span className="muted small">{rating.byMethod.map((m) => `${t.brew[m.brew!]} ${m.rating.toFixed(1)}`).join(' · ')}</span>
                : rated.rating != null && <span className="muted">{rated.rating.toFixed(1)}</span>}
            </div>
            {history?.rating != null && <div className="muted small" style={{ marginTop: 6 }}>{t.scan.alreadyRated}</div>}
            {/* Pick the method, then the stars are its rating; pick the other to rate it too. */}
            <div style={{ marginTop: 12 }}>
              <BrewPicker value={rating.selected} ratings={rated} onChange={rating.pick} />
            </div>
            <div style={{ margin: '0 0 12px' }}><Stars value={rating.shown} onChange={rating.rate} /></div>
            <NoteField value={comment} placeholder={t.common.commentPlaceholder} onChange={setComment} />
          </div>
          {history?.tried.length ? (
            // Already on the shelf: update that entry, or keep this bag as a separate one.
            <>
              <button className="btn block" onClick={updateExisting}>{t.scan.updateExisting}</button>
              <button className="btn ghost block" onClick={() => save(true)}>{t.scan.saveNewAnyway}</button>
            </>
          ) : (
            <>
              <button className="btn block" disabled={rated.rating == null} onClick={() => save(true)}>{t.scan.saveRated}</button>
              <button className="btn ghost block" onClick={() => save(false)}>{t.scan.saveLater}</button>
            </>
          )}
          <button className="btn ghost block" onClick={addToCompare}>{t.compare.add}</button>
          {notice && <div className="notice">{notice}</div>}
          <button className="btn danger block" onClick={reset}>{t.scan.discard}</button>
        </div>
        {editing && (
          <CoffeeEditor coffee={draft} onClose={() => (setEditing(false), isBlankDraft(draft) && reset())} onSave={(c) => (setDraft(c), setEditing(false))} />
        )}
        {quickCompare && (
          <CompareSheet
            items={quickItems}
            model={model}
            coffees={coffees}
            onClose={() => setQuickCompare(false)}
            onQuickRemove={(item) => {
              // Removing the bag itself, or the last coffee picked, leaves nothing to compare.
              const left = closestPicked.filter((id) => id !== item.coffeeId)
              if (item.coffeeId == null || !left.length) setQuickCompare(false)
              if (item.coffeeId != null) setClosestPicked(left)
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="screen">
      {inputs}
      <div className="row title-row">
        <h1 className="screen-title">Coffee Shelf</h1>
        <span className="spacer" />
        <Avatar onClick={() => (focusDriveSection(), onOpenSettings())} label={t.drive.title} />
      </div>
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
          <PourOver />
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
              <div className="muted small">{readStatus ? statusText(t, readStatus) : t.scan.readingHint}</div>
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

      {!reading && compareItems.length > 0 && (
        <div className="card compare-bar">
          <b style={{ flex: 1 }}>{t.compare.bar(compareItems.length)}</b>
          <button className="btn" onClick={() => setComparing(true)}>{t.compare.open}</button>
        </div>
      )}
      {notice && !reading && <div className="notice">{notice}</div>}

      {error && (
        <div className="error" style={{ marginTop: 14 }}>
          {error.code === 'photo' ? t.scan.photoError : <Linkify text={t.errors[error.code]} />}
          {error.detail && `: ${error.detail}`}
        </div>
      )}

      {comparing && <CompareSheet items={compareItems} model={model} coffees={coffees.filter((c) => !c.archivedAt)} onClose={() => setComparing(false)} />}

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
