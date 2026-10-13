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

function Row({ coffee, onOpen }: { coffee: Coffee; onOpen: () => void }) {
  const t = useT()
  const lang = useLang()
  return (
    <button className="card list-item" onClick={onOpen}>
      <CoffeeThumb photo={coffee.photo} />
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

const GENERIC_WORDS = new Set(['coffee', 'coffees', 'roaster', 'roasters', 'roastery', 'roasting', 'roasted', 'roastworks', 'cafe', 'café', 'the', 'co', 'company', 'lab', 'кофе', 'кофейня', 'обжарщик', 'обжарка'])

/** One word for the label above a bag: the first distinctive word of the roaster's name. */
function roasterWord(roaster: string): string {
  const words = roaster.replace(/\(.*?\)/g, ' ').split(/[\s&+,.·/-]+/).filter(Boolean)
  return words.find((w) => !GENERIC_WORDS.has(w.toLowerCase())) ?? words[0] ?? ''
}

/** Compact view: bags standing three to a wooden shelf, roaster word above each. */
function Bookcase({ coffees, onOpen }: { coffees: Coffee[]; onOpen: (id: number) => void }) {
  const t = useT()
  const shelves: Coffee[][] = []
  for (let i = 0; i < coffees.length; i += 3) shelves.push(coffees.slice(i, i + 3))
  return (
    <div className="bookcase">
      {shelves.map((row, i) => (
        <div className="bookcase-shelf" key={i}>
          <div className="bookcase-row">
            {row.map((c) => (
              <button key={c.id} className="bag" onClick={() => onOpen(c.id!)} aria-label={`${c.roaster} ${c.name}`.trim()}>
                <span className="bag-label">{roasterWord(c.roaster) || t.common.unknownRoaster}</span>
                <span className="bag-body">
                  <CoffeeThumb photo={c.photo} className="bag-photo" zoomable={false} />
                  {c.rating != null && <span className="bag-rating">{c.rating.toFixed(1)}</span>}
                </span>
              </button>
            ))}
          </div>
          <div className="plank" />
        </div>
      ))}
    </div>
  )
}

export function LibraryScreen({ coffees, model, onOpen }: { coffees: Coffee[]; model: Model; onOpen: (id: number) => void }) {
  const t = useT()
  const compareItems = useLiveQuery(() => db.compare.orderBy('addedAt').toArray(), []) ?? []
  const [comparing, setComparing] = useState(false)
  const { controls, shown, view, filtering, clearFilters } = useShelfFilters(coffees, { withView: true })

  return (
    <div className="screen">
      <div className="row title-row">
        <h1 className="screen-title">{t.shelf.title}</h1>
        <span className="spacer" />
        <button type="button" className="icon-btn title-btn" onClick={() => setComparing(true)} aria-label={t.compare.title}>
          <CompareIcon />
          {compareItems.length > 0 && <span className="count-badge">{compareItems.length}</span>}
        </button>
      </div>
      <p className="screen-sub">{t.shelf.logged(coffees.length)}</p>
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
        <Bookcase coffees={shown} onOpen={onOpen} />
      ) : (
        shown.map((c) => <Row key={c.id} coffee={c} onOpen={() => onOpen(c.id!)} />)
      )}
      {comparing && <CompareSheet items={compareItems} model={model} coffees={coffees} onClose={() => setComparing(false)} />}
    </div>
  )
}
