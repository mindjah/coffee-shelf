import type { MouseEvent } from 'react'
import { usePhotoUrl } from './CoffeeSummary'
import { openPhoto } from './PhotoViewer'
import { BeanIcon } from './icons'

/** Bag photo that opens full screen when tapped, or a coffee-bean placeholder when there's none. */
/** `zoomable={false}` when the whole tile is a button (e.g. a bag on the compact shelf). */
/** `name` names the file if the photo is saved from full screen. */
export function CoffeeThumb({ photo, className = 'thumb', zoomable = true, name }: { photo?: Blob | ArrayBuffer; className?: string; zoomable?: boolean; name?: string }) {
  const url = usePhotoUrl(photo)
  if (!photo || !url) {
    return (
      <span className={`${className} thumb-empty`} aria-hidden="true">
        <BeanIcon />
      </span>
    )
  }
  if (!zoomable) return <img className={className} src={url} alt="" />
  const open = (e: MouseEvent) => {
    // Thumbnails sit inside tappable rows; the photo tap shouldn't also open the row.
    e.stopPropagation()
    openPhoto(photo, name)
  }
  return <img className={`${className} thumb-photo`} src={url} alt="" onClick={open} />
}
