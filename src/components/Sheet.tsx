import { useEffect, useRef, type ReactNode } from 'react'
import { useT } from '../i18n'
import { useSwipeBack } from '../gestures'

interface Props {
  title: string
  onClose: () => void
  closeLabel?: string
  action?: { label: string; onClick: () => void; disabled?: boolean }
  children: ReactNode
}

export function Sheet({ title, onClose, closeLabel, action, children }: Props) {
  const t = useT()
  const ref = useRef<HTMLDivElement>(null)
  // Swiping right does what the close/back button does.
  useSwipeBack(ref, onClose)
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => void (document.body.style.overflow = prev)
  }, [])
  return (
    <>
      <div className="sheet-backdrop" />
      <div ref={ref} className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-bar">
          <button className="btn plain" onClick={onClose}>{closeLabel ?? t.common.close}</button>
          <div className="title">{title}</div>
          {action ? (
            <button className="btn plain" style={{ fontWeight: 700 }} onClick={action.onClick} disabled={action.disabled}>{action.label}</button>
          ) : (
            <span style={{ minWidth: 72 }} />
          )}
        </div>
        <div className="screen" style={{ paddingTop: 12 }}>{children}</div>
      </div>
    </>
  )
}
