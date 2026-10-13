import type { MouseEvent } from 'react'
import { usePhotoUrl } from './CoffeeSummary'
import { openPhoto } from './PhotoViewer'
import { BeanIcon } from './icons'

/** Bag photo that opens full screen when tapped, or a coffee-bean placeholder when there's none. */
export function CoffeeThumb({ photo, className = 'thumb' }: { photo?: Blob | ArrayBuffer; className?: string }) {
  const url = usePhotoUrl(photo)
  if (!photo || !url) {
    return (
      <span className={`${className} thumb-empty`} aria-hidden="true">
        <BeanIcon />
      </span>
    )
  }
  const open = (e: MouseEvent) => {
    // Thumbnails sit inside tappable rows; the photo tap shouldn't also open the row.
    e.stopPropagation()
    openPhoto(photo)
  }
  return <img className={`${className} thumb-photo`} src={url} alt="" onClick={open} />
}
