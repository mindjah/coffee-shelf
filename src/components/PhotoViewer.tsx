import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { usePhotoUrl } from './CoffeeSummary'
import { useT } from '../i18n'

// One app-wide viewer: any thumbnail calls openPhoto(), <PhotoViewer /> in App shows it.
let current: Blob | ArrayBuffer | undefined
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function openPhoto(photo: Blob | ArrayBuffer) {
  current = photo
  emit()
}

function closePhoto() {
  current = undefined
  emit()
}

const MAX_ZOOM = 4

/** Full-screen photo. Pinch (iOS gesture events) or double-tap to zoom, scroll to pan, ✕ to close. */
export function PhotoViewer() {
  const t = useT()
  const photo = useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => current)
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
      <button className="viewer-close" onClick={closePhoto} aria-label={t.common.close}>✕</button>
    </div>
  )
}
