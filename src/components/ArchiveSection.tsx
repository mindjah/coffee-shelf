import { useState } from 'react'
import type { Coffee } from '../types'
import { useT } from '../i18n'
import { Bookcase } from './Bookcase'
import { Sheet } from './Sheet'
import { SectionHeader } from './SectionHeader'

const PREVIEW = 3 // one shelf

/**
 * Bottom of Settings: the first shelf of archived coffees on a dusty bookcase; more opens the full
 * archive page. Tapping a bag opens the coffee, where it can be restored.
 */
export function ArchiveSection({ archived, onOpen }: { archived: Coffee[]; onOpen: (id: number) => void }) {
  const t = useT()
  const [full, setFull] = useState(false)
  const open = (c: Coffee) => onOpen(c.id!)
  return (
    <>
      <SectionHeader
        title={t.archive.title}
        info={t.archive.about.map((line, i) => <p key={i} style={{ margin: i ? '8px 0 0' : 0 }}>{line}</p>)}
      />
      {archived.length === 0 ? (
        <p className="muted small" style={{ margin: '0 4px' }}>{t.archive.empty}</p>
      ) : (
        <>
          <p className="muted small" style={{ margin: '0 4px 12px' }}>{t.archive.count(archived.length)}. {t.archive.hint}</p>
          <Bookcase coffees={archived.slice(0, PREVIEW)} onPick={open} dusty />
          {archived.length > PREVIEW && (
            <button className="btn ghost block" style={{ marginTop: 12 }} onClick={() => setFull(true)}>{t.archive.openAll(archived.length)}</button>
          )}
        </>
      )}
      {full && (
        <Sheet title={t.archive.title} onClose={() => setFull(false)} closeLabel={t.common.done}>
          <p className="muted small" style={{ margin: '0 4px 12px' }}>{t.archive.count(archived.length)}. {t.archive.hint}</p>
          {archived.length ? <Bookcase coffees={archived} onPick={open} dusty /> : <p className="muted small">{t.archive.empty}</p>}
        </Sheet>
      )}
    </>
  )
}
