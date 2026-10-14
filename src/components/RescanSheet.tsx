import { useRef, useState } from 'react'
import type { CoffeeDraft } from '../types'
import { ScanError } from '../errors'
import { resizeImage } from '../image'
import { useT, type Dict } from '../i18n'
import { usePhotoUrl } from './CoffeeSummary'
import { CameraIcon, PlusIcon } from './icons'
import { Linkify } from './Linkify'
import { PourOver } from './PourOver'
import { Sheet } from './Sheet'
import type { OcrProgress } from '../ocr'

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

type ErrorState = { code: keyof Dict['errors'] | 'photo'; detail?: string }

/**
 * Photograph a bag again (or reuse its saved photo) and read it with the method chosen in Settings. Hands the result (and the
 * first photo) back to the editor, which fills its fields for review; nothing is saved here.
 */
export function RescanSheet({ photo, onResult, onClose }: {
  /** The coffee's saved photo, offered as a shot so the bag needn't be at hand. */
  photo?: ArrayBuffer
  onResult: (draft: CoffeeDraft, firstShot: Blob) => void
  onClose: () => void
}) {
  const t = useT()
  const cameraRef = useRef<HTMLInputElement>(null)
  const libraryRef = useRef<HTMLInputElement>(null)
  const [shots, setShots] = useState<Blob[]>([])
  const [reading, setReading] = useState(false)
  const [ocr, setOcr] = useState<OcrProgress>()
  const [error, setError] = useState<ErrorState>()
  const reader = useRef<AbortController>(undefined)

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
    const ac = new AbortController()
    reader.current = ac
    setReading(true)
    setError(undefined)
    try {
      const { readLabel } = await import('../scan')
      const { draft } = await readLabel(shots, ac.signal, setOcr)
      onResult(draft, shots[0])
    } catch (err) {
      if (ac.signal.aborted && !(err instanceof ScanError)) return
      setError(err instanceof ScanError ? { code: err.code, detail: err.detail } : { code: 'unknown', detail: (err as Error).message })
    } finally {
      if (reader.current === ac) {
        reader.current = undefined
        setReading(false)
        setOcr(undefined)
      }
    }
  }

  const close = () => (reader.current?.abort(), onClose())

  return (
    <Sheet title={t.editor.rescan} closeLabel={t.common.cancel} onClose={close}>
      <input ref={cameraRef} className="file-input" type="file" accept="image/*" capture="environment" onChange={(e) => (addFiles(e.target.files), (e.target.value = ''))} />
      <input ref={libraryRef} className="file-input" type="file" accept="image/*" multiple onChange={(e) => (addFiles(e.target.files), (e.target.value = ''))} />
      <p className="muted small" style={{ margin: '0 4px 12px' }}>{t.editor.rescanHint}</p>
      {reading ? (
        <div className="card brewing">
          <PourOver />
          <div className="verdict" style={{ marginTop: 14 }}>
            {ocr ? `${ocr.stage === 'reading' ? t.scan.ocrReading : t.scan.ocrLoading} ${Math.round(ocr.progress * 100)}%` : t.scan.reading}
          </div>
          <button className="btn ghost" style={{ marginTop: 20, minWidth: 160 }} onClick={() => reader.current?.abort()}>{t.scan.cancelReading}</button>
        </div>
      ) : shots.length === 0 ? (
        <div className="hero">
          <h2>{t.scan.heroTitle}</h2>
          <p>{t.scan.heroText}</p>
          <button className="btn block" onClick={() => cameraRef.current?.click()}>
            <CameraIcon /> {t.scan.takePhoto}
          </button>
          <button className="btn plain block" style={{ marginTop: 6 }} onClick={() => libraryRef.current?.click()}>{t.scan.fromPhotos}</button>
          {photo && (
            <button className="btn plain block" style={{ marginTop: 6 }} onClick={() => setShots([new Blob([photo], { type: 'image/jpeg' })])}>
              {t.editor.rescanSaved}
            </button>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="shots">
            {shots.map((b, i) => <Shot key={i} blob={b} onRemove={() => setShots((s) => s.filter((_, j) => j !== i))} />)}
            {shots.length < 3 && (
              <button className="shot add" onClick={() => cameraRef.current?.click()}>
                <PlusIcon />
                {t.scan.otherSide}
              </button>
            )}
          </div>
          <button className="btn block" style={{ marginTop: 14 }} onClick={read}>{t.scan.readLabel}</button>
        </div>
      )}
      {error && (
        <div className="error" style={{ marginTop: 14 }}>
          {error.code === 'photo' ? t.scan.photoError : <Linkify text={t.errors[error.code]} />}
          {error.detail && `: ${error.detail}`}
        </div>
      )}
    </Sheet>
  )
}
