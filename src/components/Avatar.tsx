import { useState } from 'react'
import { useDrive } from '../gdrive'

/** Google profile picture of the signed-in account; the initial when there's no picture or no network. */
export function Avatar({ size = 'small', onClick, label }: { size?: 'small' | 'large'; onClick?: () => void; label?: string }) {
  const drive = useDrive()
  const [broken, setBroken] = useState<string>()
  if (!drive.enabled || !drive.signedIn) return null
  const initial = (drive.name || drive.email || '?').trim().charAt(0).toUpperCase()
  const showPicture = drive.picture && broken !== drive.picture
  const face = showPicture ? (
    // Google's image host can refuse requests that carry a referrer.
    <img src={drive.picture} alt="" referrerPolicy="no-referrer" onError={() => setBroken(drive.picture)} />
  ) : (
    <span>{initial}</span>
  )
  return onClick ? (
    <button type="button" className={`avatar ${size}`} onClick={onClick} aria-label={label ?? drive.email}>{face}</button>
  ) : (
    <span className={`avatar ${size}`} aria-hidden="true">{face}</span>
  )
}
