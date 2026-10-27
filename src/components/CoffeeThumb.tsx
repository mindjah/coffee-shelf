import type { MouseEvent } from 'react'
import { usePhotoUrl } from './CoffeeSummary'
import { openPhoto } from './PhotoViewer'
import { BeanIcon } from './icons'
import type { CoffeeDraft } from '../types'

type Bag = Pick<CoffeeDraft, 'photo' | 'cover' | 'coverFrom'>

/** The picture that stands for the bag: the cover photo when there is one, unless the label is picked. */
export const coverOf = (c: Bag) => (c.cover && c.coverFrom !== 'label' ? c.cover : c.photo ?? c.cover)

/** All of a bag's pictures, the one shown as its cover first. */
export const photosOf = (c: Bag) => {
  const cover = coverOf(c)
  return [cover, cover === c.photo ? c.cover : c.photo].filter((p): p is ArrayBuffer => !!p)
}

const bagName = (c: Pick<CoffeeDraft, 'roaster' | 'name'>) => [c.roaster, c.name].filter(Boolean).join(' – ')

/** Bag photo that opens full screen when tapped, or a coffee-bean placeholder when there's none. */
/** `zoomable={false}` when the whole tile is a button (e.g. a bag on the compact shelf). */
/** `name` names the file if the photo is saved from full screen; `gallery` is what you can swipe through there. */
export function CoffeeThumb({ photo, gallery, className = 'thumb', zoomable = true, name }: {
  photo?: Blob | ArrayBuffer
  gallery?: (Blob | ArrayBuffer)[]
  className?: string
  zoomable?: boolean
  name?: string
}) {
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
    const all = gallery?.length ? gallery : [photo]
    openPhoto(all, name, Math.max(0, all.indexOf(photo)))
  }
  return <img className={`${className} thumb-photo`} src={url} alt="" onClick={open} />
}

/** A coffee's cover picture; full screen, you can swipe to its other photo. */
export function BagThumb({ coffee, className, zoomable }: { coffee: Bag & Pick<CoffeeDraft, 'roaster' | 'name'>; className?: string; zoomable?: boolean }) {
  return <CoffeeThumb photo={coverOf(coffee)} gallery={photosOf(coffee)} className={className} zoomable={zoomable} name={bagName(coffee)} />
}
