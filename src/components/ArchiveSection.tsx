import type { Coffee } from '../types'
import { useT } from '../i18n'
import { Bookcase } from './Bookcase'

/** Bottom of Settings: archived coffees on a dusty bookcase; tapping one opens it to restore. */
export function ArchiveSection({ archived, onOpen }: { archived: Coffee[]; onOpen: (id: number) => void }) {
  const t = useT()
  return (
    <>
      <h2 className="section">{t.archive.title}</h2>
      {archived.length === 0 ? (
        <p className="muted small" style={{ margin: '0 4px' }}>{t.archive.empty}</p>
      ) : (
        <>
          <p className="muted small" style={{ margin: '0 4px 12px' }}>{t.archive.count(archived.length)}. {t.archive.hint}</p>
          <Bookcase coffees={archived} onPick={(c) => onOpen(c.id!)} dusty />
        </>
      )}
    </>
  )
}
