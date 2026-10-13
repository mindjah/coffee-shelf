import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { usePhotoUrl } from './CoffeeSummary'
import { useT } from '../i18n'
import { SaveIcon } from './icons'

// One app-wide viewer: any thumbnail calls openPhoto(), <PhotoViewer /> in App shows it.
let current: { photo: Blob | ArrayBuffer; name: string } | undefined
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/** `name` becomes the file name when the photo is saved, e.g. "Martines – Luis Marcelino". */
export function openPhoto(photo: Blob | ArrayBuffer, name = 'Coffee Shelf') {
  current = { photo, name }
  emit()
}

function closePhoto() {
  current = undefined
  emit()
}

/** iPhone: the share sheet offers "Save Image" (Photos), Files and AirDrop; elsewhere a download. */
async function savePhoto(photo: Blob | ArrayBuffer, name: string) {
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

/** Full-screen photo. Pinch (iOS gesture events) or double-tap to zoom, scroll to pan, ✕ to close. */
export function PhotoViewer() {
  const t = useT()
  const shown = useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => current)
  const photo = shown?.photo
  const url = usePhotoUrl(photo)
  const [zoom, setZoom] = useState(1)
  const stage = useRef<HTMLDivElement>(null)
  const pinchStart = useRef(1)

  useEffect(() => setZoom(1), [photo])

  useEffect(() => {
    const el = stage.current
    if (!el) return
    // The app blocks page zoom on document; inside the viewer the gesture zooms the photo instead.
    const start = (e: Event) => (e.preventDefault(), e.stopPropagation(), (pinchStart.current = zoom))
    const change = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      const scale = (e as Event & { scale: number }).scale
      setZoom(Math.min(MAX_ZOOM, Math.max(1, pinchStart.current * scale)))
    }
    el.addEventListener('gesturestart', start, { passive: false })
    el.addEventListener('gesturechange', change, { passive: false })
    return () => {
      el.removeEventListener('gesturestart', start)
      el.removeEventListener('gesturechange', change)
    }
  }, [url, zoom])

  useEffect(() => {
    if (!photo) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closePhoto()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photo])

  if (!photo || !url) return null
  return (
    <div className="viewer" role="dialog" aria-modal="true">
      <div ref={stage} className="viewer-stage" onDoubleClick={() => setZoom((z) => (z > 1 ? 1 : 2.5))}>
        <img src={url} alt="" style={zoom > 1 ? { width: `${zoom * 100}%`, maxWidth: 'none', maxHeight: 'none' } : undefined} />
      </div>
      <div className="viewer-actions">
        <button className="viewer-btn" onClick={() => shown && savePhoto(shown.photo, shown.name)} aria-label={t.common.savePhoto}>
          <SaveIcon />
        </button>
        <button className="viewer-btn" onClick={closePhoto} aria-label={t.common.close}>✕</button>
      </div>
    </div>
  )
}
