import { useState } from 'react'
import type { Coffee } from '../types'
import { countryName, useLang, useT } from '../i18n'
import { originLine, usePhotoUrl } from '../components/CoffeeSummary'
import { ShelfIcon } from '../components/icons'

type Filter = 'all' | 'rated' | 'todo'

function Row({ coffee, onOpen }: { coffee: Coffee; onOpen: () => void }) {
  const t = useT()
  const lang = useLang()
  const photo = usePhotoUrl(coffee.photo)
  return (
    <button className="card list-item" onClick={onOpen}>
      {photo ? <img className="thumb" src={photo} alt="" /> : <div className="thumb" />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="roaster">{coffee.roaster || t.common.unknownRoaster}</div>
        <div className="coffee-name">{coffee.name || t.common.untitled}</div>
        <div className="muted small">{originLine(coffee, t, lang)}</div>
      </div>
      {coffee.rating != null ? <span className="badge">{coffee.rating.toFixed(1)}</span> : <span className="badge todo">{t.shelf.todo}</span>}
    </button>
  )
}

/** Everything a search might match: printed text plus every translation and display name. */
function haystack(c: Coffee) {
  return [
    c.roaster, c.name, c.country, c.area, c.producer, c.process, ...c.varieties, ...c.notes,
    ...Object.values(c.translations ?? {}).flatMap((tr) => tr?.notes ?? []),
    countryName(c, 'en'), countryName(c, 'ru'),
  ].join(' ').toLowerCase()
}

export function LibraryScreen({ coffees, onOpen }: { coffees: Coffee[]; onOpen: (id: number) => void }) {
  const t = useT()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const shown = coffees
    .filter((c) => (filter === 'rated' ? c.rating != null : filter === 'todo' ? c.rating == null : true))
    .filter((c) => !q || haystack(c).includes(q))
    .sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="screen">
      <h1 className="screen-title">{t.shelf.title}</h1>
      <p className="screen-sub">{t.shelf.logged(coffees.length)}</p>
      <input className="input" type="search" placeholder={t.shelf.search} value={query} onChange={(e) => setQuery(e.target.value)} style={{ marginBottom: 12 }} />
      <div className="segmented">
        {(['all', 'rated', 'todo'] as Filter[]).map((f) => (
          <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
            {t.shelf[f]}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="empty">
          <ShelfIcon />
          <div>{coffees.length ? t.shelf.noMatch : t.shelf.empty}</div>
        </div>
      ) : (
        shown.map((c) => <Row key={c.id} coffee={c} onOpen={() => onOpen(c.id!)} />)
      )}
    </div>
  )
}
