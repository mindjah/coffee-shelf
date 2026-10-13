import { useMemo, useState, type ReactNode } from 'react'
import type { Coffee } from '../types'
import { countryName, useLang, useT } from '../i18n'
import { FilterIcon } from './icons'
import { groupRoasters } from '../roaster'

// Search, the filter button and its panel (roaster, country, sort, view, rated) shared by the
// Shelf and Compare's "Add from shelf", so both list coffees the same way.

type Filter = 'all' | 'rated' | 'todo'
export type Sort = 'newest' | 'ratingDesc' | 'ratingAsc'
export type ShelfView = 'list' | 'compact'

const SORTS: Sort[] = ['newest', 'ratingDesc', 'ratingAsc']
const VIEWS: ShelfView[] = ['list', 'compact']
const SORT_KEY = 'coffee-shelf.shelfSort'
const VIEW_KEY = 'coffee-shelf.shelfView'

/** Per-device preference with a fallback when storage is unavailable (private mode). */
function remembered<T extends string>(key: string, allowed: T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key) as T
    return allowed.includes(v) ? v : fallback
  } catch {
    return fallback
  }
}

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Not remembered; the choice still applies until the app closes.
  }
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

export interface ShelfFilters {
  /** Search field with the filter button, plus the panel when open. */
  controls: ReactNode
  shown: Coffee[]
  view: ShelfView
  /** Filters (not sort) are hiding coffees. */
  filtering: boolean
  clearFilters: () => void
}

/** `withView` adds the List / Compact shelf choice (the Shelf has it, the picker doesn't). */
export function useShelfFilters(coffees: Coffee[], { withView = false } = {}): ShelfFilters {
  const t = useT()
  const lang = useLang()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [roaster, setRoaster] = useState('')
  const [country, setCountry] = useState('')
  const [sort, setSort] = useState<Sort>(() => remembered(SORT_KEY, SORTS, 'newest'))
  const [view, setView] = useState<ShelfView>(() => (withView ? remembered(VIEW_KEY, VIEWS, 'list') : 'list'))
  const [open, setOpen] = useState(false)

  const filtering = !!roaster || !!country || filter !== 'all'
  const clearFilters = () => (setRoaster(''), setCountry(''), setFilter('all'))
  // Spellings of the same roaster ("Martines", "Martines family roastery") filter as one.
  const roasterOf = useMemo(() => groupRoasters(coffees.map((c) => c.roaster)), [coffees])
  const roasterKey = (c: Coffee) => roasterOf(c.roaster)?.key ?? ''
  const roasters = useMemo(() => options(coffees, roasterKey, (c) => roasterOf(c.roaster)?.label ?? c.roaster), [coffees, roasterOf])
  const countries = useMemo(() => options(coffees, countryKey, (c) => countryName(c, lang)), [coffees, lang])
  const q = query.trim().toLowerCase()
  const shown = coffees
    .filter((c) => (filter === 'rated' ? c.rating != null : filter === 'todo' ? c.rating == null : true))
    .filter((c) => !roaster || roasterKey(c) === roaster)
    .filter((c) => !country || countryKey(c) === country)
    .filter((c) => !q || haystack(c).includes(q))
    .sort(compare(sort))

  const controls = (
    <>
      <div className="search-row">
        <input className="input" type="search" placeholder={t.shelf.search} value={query} onChange={(e) => setQuery(e.target.value)} />
        {coffees.length > 0 && (
          <button
            type="button"
            className={`icon-btn${open ? ' open' : ''}${filtering ? ' filtering' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-label={t.shelf.filters}
            aria-expanded={open}
          >
            <FilterIcon />
          </button>
        )}
      </div>
      {coffees.length > 0 && open && (
        <div className="grid-2 shelf-filters">
          <select className={`input${roaster ? ' active' : ''}`} value={roaster} onChange={(e) => setRoaster(e.target.value)} aria-label={t.shelf.roaster}>
            <option value="">{t.shelf.allRoasters}</option>
            {roasters.map(([k, o]) => <option key={k} value={k}>{o.label} ({o.n})</option>)}
          </select>
          <select className={`input${country ? ' active' : ''}`} value={country} onChange={(e) => setCountry(e.target.value)} aria-label={t.shelf.country}>
            <option value="">{t.shelf.allCountries}</option>
            {countries.map(([k, o]) => <option key={k} value={k}>{o.label} ({o.n})</option>)}
          </select>
          <select
            className={`input${withView ? '' : ' shelf-sort'}`}
            value={sort}
            onChange={(e) => (setSort(e.target.value as Sort), remember(SORT_KEY, e.target.value))}
            aria-label={t.shelf.sort}
          >
            {SORTS.map((s) => <option key={s} value={s}>{t.shelf.sorts[s]}</option>)}
          </select>
          {withView && (
            <select className="input" value={view} onChange={(e) => (setView(e.target.value as ShelfView), remember(VIEW_KEY, e.target.value))} aria-label={t.shelf.view}>
              {VIEWS.map((v) => <option key={v} value={v}>{t.shelf.views[v]}</option>)}
            </select>
          )}
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
    </>
  )

  return { controls, shown, view, filtering, clearFilters }
}
