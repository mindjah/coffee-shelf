import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { usePhotoUrl } from './CoffeeSummary'
import { useT } from '../i18n'
import { SaveIcon } from './icons'

type Photo = Blob | ArrayBuffer

// One app-wide viewer: any thumbnail calls openPhoto(), <PhotoViewer /> in App shows it.
let current: { photos: Photo[]; index: number; name: string } | undefined
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/**
 * Shows a photo full screen, or several to swipe through starting at `index`.
 * `name` becomes the file name when one is saved, e.g. "Martines – Luis Marcelino".
 */
export function openPhoto(photo: Photo | Photo[], name = 'Coffee Shelf', index = 0) {
  const photos = Array.isArray(photo) ? photo : [photo]
  current = { photos, index: Math.min(index, photos.length - 1), name }
  emit()
}

function closePhoto() {
  current = undefined
  emit()
}

/** iPhone: the share sheet offers "Save Image" (Photos), Files and AirDrop; elsewhere a download. */
async function savePhoto(photo: Photo, name: string) {
  const safe = name.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Coffee Shelf'
  const file = new File([photo], `${safe}.jpg`, { type: 'image/jpeg' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(file)
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

const MAX_ZOOM = 4

/** One photo in the viewer; only the one in view zooms. */
function Slide({ photo, zoom, active, onZoom }: { photo: Photo; zoom: number; active: boolean; onZoom: (z: number | ((z: number) => number)) => void }) {
  const url = usePhotoUrl(photo)
  const stage = useRef<HTMLDivElement>(null)
  const pinchStart = useRef(1)

  useEffect(() => {
    const el = stage.current
    if (!el || !active) return
    // The app blocks page zoom on document; inside the viewer the gesture zooms the photo instead.
    const start = (e: Event) => (e.preventDefault(), e.stopPropagation(), (pinchStart.current = zoom))
    const change = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      const scale = (e as Event & { scale: number }).scale
      onZoom(Math.min(MAX_ZOOM, Math.max(1, pinchStart.current * scale)))
    }
    el.addEventListener('gesturestart', start, { passive: false })
    el.addEventListener('gesturechange', change, { passive: false })
    return () => {
      el.removeEventListener('gesturestart', start)
      el.removeEventListener('gesturechange', change)
    }
  }, [active, zoom, onZoom])

  const z = active ? zoom : 1
  return (
    <div ref={stage} className="viewer-stage" onDoubleClick={() => onZoom((v) => (v > 1 ? 1 : 2.5))}>
      {url && <img src={url} alt="" style={z > 1 ? { width: `${z * 100}%`, maxWidth: 'none', maxHeight: 'none' } : undefined} />}
    </div>
  )
}

/**
 * Full-screen photos. Swipe sideways between them, pinch (iOS gesture events) or double-tap to
 * zoom, scroll to pan a zoomed one, ✕ to close.
 */
export function PhotoViewer() {
  const t = useT()
  const shown = useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => current)
  const photos = shown?.photos
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const track = useRef<HTMLDivElement>(null)

  // Opens on the photo that was tapped.
  useLayoutEffect(() => {
    if (!shown) return
    setIndex(shown.index)
    setZoom(1)
    const el = track.current
    if (el) el.scrollLeft = shown.index * el.clientWidth
  }, [shown])

  const go = (i: number) => {
    const el = track.current
    if (!el || !photos || i < 0 || i >= photos.length) return
    setZoom(1)
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!shown) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePhoto()
      if (e.key === 'ArrowRight') go(index + 1)
      if (e.key === 'ArrowLeft') go(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!shown || !photos) return null
  return (
    <div className="viewer" role="dialog" aria-modal="true">
      {/* A zoomed photo pans instead of paging. */}
      <div
        ref={track}
        className={`viewer-track${zoom > 1 ? ' zoomed' : ''}`}
        onScroll={(e) => {
          const i = Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth)
          if (i !== index) (setIndex(i), setZoom(1))
        }}
      >
        {photos.map((p, i) => (
          <Slide key={i} photo={p} active={i === index} zoom={zoom} onZoom={setZoom} />
        ))}
      </div>
      {photos.length > 1 && (
        <div className="viewer-dots" aria-label={`${index + 1} / ${photos.length}`}>
          {photos.map((_, i) => (
            <button key={i} className={i === index ? 'on' : ''} onClick={() => go(i)} aria-label={`${i + 1} / ${photos.length}`} aria-current={i === index} />
          ))}
        </div>
      )}
      <div className="viewer-actions">
        <button className="viewer-btn" onClick={() => savePhoto(photos[index] ?? photos[0], shown.name)} aria-label={t.common.savePhoto}>
          <SaveIcon />
        </button>
        <button className="viewer-btn" onClick={closePhoto} aria-label={t.common.close}>✕</button>
      </div>
    </div>
  )
}
