import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Model } from '../recommend'
import { CompareSheet } from './CompareSheet'
import type { Coffee } from '../types'
import { useLang, useT } from '../i18n'
import { originLine } from '../components/CoffeeSummary'
import { CoffeeThumb } from '../components/CoffeeThumb'
import { CompareIcon, ShelfIcon } from '../components/icons'
import { DriveBanner } from '../components/DriveSection'
import { useShelfFilters } from '../components/ShelfFilters'
import { Bookcase } from '../components/Bookcase'

function Row({ coffee, onOpen }: { coffee: Coffee; onOpen: () => void }) {
  const t = useT()
  const lang = useLang()
  return (
    <button className="card list-item" onClick={onOpen}>
      <CoffeeThumb photo={coffee.photo} name={[coffee.roaster, coffee.name].filter(Boolean).join(' – ')} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="roaster">{coffee.roaster || t.common.unknownRoaster}</div>
        <div className="coffee-name">{coffee.name || t.common.untitled}</div>
        <div className="muted small">
          {originLine(coffee, t, lang)}
          {coffee.scaScore != null && <span className="sca-tag">SCA {coffee.scaScore}</span>}
        </div>
      </div>
      {coffee.rating != null ? <span className="badge">{coffee.rating.toFixed(1)}</span> : <span className="badge todo">{t.shelf.todo}</span>}
    </button>
  )
}

export function LibraryScreen({ coffees, model, onOpen }: { coffees: Coffee[]; model: Model; onOpen: (id: number) => void }) {
  const t = useT()
  const compareItems = useLiveQuery(() => db.compare.orderBy('addedAt').toArray(), []) ?? []
  const [comparing, setComparing] = useState(false)
  const { controls, shown, view, filtering, clearFilters } = useShelfFilters(coffees, { withView: true })

  return (
    <div className="screen">
      <div className="row screen-head">
        <div>
          <h1 className="screen-title">{t.shelf.title}</h1>
          <p className="screen-sub">{t.shelf.logged(coffees.length)}</p>
        </div>
        <span className="spacer" />
        <button type="button" className="icon-btn head-btn" onClick={() => setComparing(true)} aria-label={t.compare.title}>
          <CompareIcon />
          {compareItems.length > 0 && <span className="count-badge">{compareItems.length}</span>}
        </button>
      </div>
      <DriveBanner />
      {controls}
      {shown.length === 0 ? (
        <div className="empty">
          <ShelfIcon />
          <div>{coffees.length ? t.shelf.noMatch : t.shelf.empty}</div>
          {filtering && (
            <button className="btn plain" onClick={clearFilters}>{t.shelf.clearFilters}</button>
          )}
        </div>
      ) : view === 'compact' ? (
        <Bookcase coffees={shown} onPick={(c) => onOpen(c.id!)} />
      ) : (
        shown.map((c) => <Row key={c.id} coffee={c} onOpen={() => onOpen(c.id!)} />)
      )}
      {comparing && <CompareSheet items={compareItems} model={model} coffees={coffees} onClose={() => setComparing(false)} />}
    </div>
  )
}
