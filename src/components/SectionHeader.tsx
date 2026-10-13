import { useState, type ReactNode, type Ref } from 'react'
import { useT } from '../i18n'

/**
 * Section title with an optional ⓘ on the right of the same line; tapping it shows the
 * explanation right under the title, above the section's card.
 */
export function SectionHeader({ title, info, headingRef }: { title: string; info?: ReactNode; headingRef?: Ref<HTMLHeadingElement> }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="section-head">
        <h2 className="section" ref={headingRef} style={{ scrollMarginTop: 'calc(var(--safe-top) + 12px)' }}>{title}</h2>
        {info && (
          <button type="button" className={`info-btn${open ? ' open' : ''}`} onClick={() => setOpen((v) => !v)} aria-label={t.common.info} aria-expanded={open}>
            i
          </button>
        )}
      </div>
      {info && open && <div className="info-panel small">{info}</div>}
    </>
  )
}
