import { useMemo, useState } from 'react'
import type { Coffee } from '../types'
import { countryName, useLang, useT } from '../i18n'
import { originLine } from '../components/CoffeeSummary'
import { CoffeeThumb } from '../components/CoffeeThumb'
import { FilterIcon, ShelfIcon } from '../components/icons'
import { DriveBanner } from '../components/DriveSection'

type Filter = 'all' | 'rated' | 'todo'

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

/** Everything a search might match: printed text plus every translation and display name. */
function haystack(c: Coffee) {
  return [
    c.roaster, c.name, c.country, c.area, c.producer, c.process, ...c.varieties, ...c.notes,
    ...Object.values(c.translations ?? {}).flatMap((tr) => tr?.notes ?? []),
    countryName(c, 'en'), countryName(c, 'ru'),
  ].join(' ').toLowerCase()
}

/** Country used for grouping: ISO codes when known (so "Колумбия" and "Colombia" match), else the typed name. */
const countryKey = (c: Coffee) => (c.countryCodes?.length ? c.countryCodes.join('/') : c.country.trim().toLowerCase())

/** Distinct values on the shelf with counts, most common first, then alphabetical. */
function options(coffees: Coffee[], key: (c: Coffee) => string, label: (c: Coffee) => string) {
  const m = new Map<string, { label: string; n: number }>()
  for (const c of coffees) {
    const k = key(c)
    if (!k) continue
    m.set(k, { label: m.get(k)?.label ?? label(c), n: (m.get(k)?.n ?? 0) + 1 })
  }
  return [...m.entries()].sort((a, b) => b[1].n - a[1].n || a[1].label.localeCompare(b[1].label))
}

type Sort = 'newest' | 'ratingDesc' | 'ratingAsc'
const SORTS: Sort[] = ['newest', 'ratingDesc', 'ratingAsc']
const SORT_KEY = 'coffee-shelf.shelfSort'

function readSort(): Sort {
  try {
    const s = localStorage.getItem(SORT_KEY) as Sort
    return SORTS.includes(s) ? s : 'newest'
  } catch {
    return 'newest'
  }
}

/** Rating orders keep unrated coffees at the end; ties fall back to newest first. */
function compare(sort: Sort) {
  return (a: Coffee, b: Coffee) => {
    if (sort !== 'newest') {
      if (a.rating == null || b.rating == null) {
        if (a.rating != null) return -1
        if (b.rating != null) return 1
      } else if (a.rating !== b.rating) {
        return sort === 'ratingDesc' ? b.rating - a.rating : a.rating - b.rating
      }
    }
    return b.createdAt - a.createdAt
  }
}

export function LibraryScreen({ coffees, onOpen }: { coffees: Coffee[]; onOpen: (id: number) => void }) {
  const t = useT()
  const lang = useLang()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [roaster, setRoaster] = useState('')
  const [country, setCountry] = useState('')
  const [sort, setSort] = useState<Sort>(readSort)
  const [showFilters, setShowFilters] = useState(false)
  // Filters that hide coffees (sort only reorders), flagged on the button while the panel is closed.
  const filtering = !!roaster || !!country || filter !== 'all'
  const clearFilters = () => (setRoaster(''), setCountry(''), setFilter('all'))
  const chooseSort = (s: Sort) => {
    setSort(s)
    try {
      localStorage.setItem(SORT_KEY, s)
    } catch {
      // Not remembered in private mode; sorting still works.
    }
  }
  const q = query.trim().toLowerCase()
  const roasterKey = (c: Coffee) => c.roaster.trim().toLowerCase()
  const roasters = useMemo(() => options(coffees, roasterKey, (c) => c.roaster.trim()), [coffees])
  const countries = useMemo(() => options(coffees, countryKey, (c) => countryName(c, lang)), [coffees, lang])
  const shown = coffees
    .filter((c) => (filter === 'rated' ? c.rating != null : filter === 'todo' ? c.rating == null : true))
    .filter((c) => !roaster || roasterKey(c) === roaster)
    .filter((c) => !country || countryKey(c) === country)
    .filter((c) => !q || haystack(c).includes(q))
    .sort(compare(sort))

  return (
    <div className="screen">
      <h1 className="screen-title">{t.shelf.title}</h1>
      <p className="screen-sub">{t.shelf.logged(coffees.length)}</p>
      <DriveBanner />
      <div className="search-row">
        <input className="input" type="search" placeholder={t.shelf.search} value={query} onChange={(e) => setQuery(e.target.value)} />
        {coffees.length > 0 && (
          <button
            type="button"
            className={`icon-btn${showFilters ? ' open' : ''}${filtering ? ' filtering' : ''}`}
            onClick={() => setShowFilters((v) => !v)}
            aria-label={t.shelf.filters}
            aria-expanded={showFilters}
          >
            <FilterIcon />
          </button>
        )}
      </div>
      {coffees.length > 0 && showFilters && (
        <div className="grid-2 shelf-filters">
          <select className={`input${roaster ? ' active' : ''}`} value={roaster} onChange={(e) => setRoaster(e.target.value)} aria-label={t.shelf.roaster}>
            <option value="">{t.shelf.allRoasters}</option>
            {roasters.map(([k, o]) => <option key={k} value={k}>{o.label} ({o.n})</option>)}
          </select>
          <select className={`input${country ? ' active' : ''}`} value={country} onChange={(e) => setCountry(e.target.value)} aria-label={t.shelf.country}>
            <option value="">{t.shelf.allCountries}</option>
            {countries.map(([k, o]) => <option key={k} value={k}>{o.label} ({o.n})</option>)}
          </select>
          <select className="input shelf-sort" value={sort} onChange={(e) => chooseSort(e.target.value as Sort)} aria-label={t.shelf.sort}>
            {SORTS.map((s) => <option key={s} value={s}>{t.shelf.sorts[s]}</option>)}
          </select>
          <div className="segmented shelf-sort" style={{ marginBottom: 0 }}>
            {(['all', 'rated', 'todo'] as Filter[]).map((f) => (
              <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
                {t.shelf[f]}
              </button>
            ))}
          </div>
          {filtering && (
            <button className="btn plain shelf-sort" style={{ minHeight: 36 }} onClick={clearFilters}>{t.shelf.clearFilters}</button>
          )}
        </div>
      )}
      {shown.length === 0 ? (
        <div className="empty">
          <ShelfIcon />
          <div>{coffees.length ? t.shelf.noMatch : t.shelf.empty}</div>
          {filtering && (
            <button className="btn plain" onClick={clearFilters}>{t.shelf.clearFilters}</button>
          )}
        </div>
      ) : (
        shown.map((c) => <Row key={c.id} coffee={c} onOpen={() => onOpen(c.id!)} />)
      )}
    </div>
  )
}
