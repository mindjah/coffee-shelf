// What the shelf already knows about a freshly scanned bag: the same coffee logged before, and
// other bags from the same roaster. Archived coffees count too — you did buy them.
import { normalize } from './lexicon'
import { findCountries } from './parse'
import { GENERIC_WORDS, groupRoasters } from './roaster'
import type { Coffee, CoffeeDraft } from './types'

/** Words that vary between bags of the same lot ("Kerisa" vs "Kerisa Natural"). */
const VARYING_WORDS = new Set([
  'natural', 'washed', 'honey', 'anaerobic', 'lavado', 'anaerobico', 'miel',
  'натуральная', 'мытая', 'хани', 'анаэробная', 'lot', 'лот', 'filter', 'espresso', 'фильтр', 'эспрессо',
  'decaf', 'microlot', 'micro',
])

/**
 * The words that identify a coffee by name. Origin words go too ("Colombia Sebastian Ramirez" vs
 * "Sebastian Ramirez"), unless the name is nothing but an origin ("Ethiopia Guji").
 */
function nameWords(name: string): string[] {
  const words = normalize(name).split(/[^\p{L}\p{N}]+/u).filter((w) => w && !GENERIC_WORDS.has(w) && !VARYING_WORDS.has(w))
  const distinctive = words.filter((w) => !findCountries(w).length)
  return distinctive.length ? distinctive : words
}

/**
 * Same coffee from the same roaster, read twice: the names agree once origin and process words are
 * dropped, one name is the other with words added (at least two words in common), or the bag
 * details agree — same producer, country and process.
 */
function sameCoffee(a: CoffeeDraft, b: CoffeeDraft): boolean {
  const [x, y] = [nameWords(a.name), nameWords(b.name)].sort((p, q) => p.length - q.length)
  if (x.length && x.join(' ') === y.join(' ')) return true
  if (x.length >= 2 && x.every((w) => y.includes(w))) return true
  const producer = normalize(a.producer).trim()
  return !!producer && producer === normalize(b.producer).trim()
    && !!a.countryCodes?.some((c) => b.countryCodes?.includes(c))
    && (a.process === b.process || a.process === 'unknown' || b.process === 'unknown')
}

export interface ShelfHistory {
  /** This coffee logged before, latest first. */
  tried: Coffee[]
  /** The rating to show for it: the latest one given. */
  rating: number | null
  /** Bags from this roaster on the shelf, including `tried`; undefined when the roaster isn't known. */
  roaster?: { label: string; bags: number; rated: number; average: number | null }
}

export function shelfHistory(draft: CoffeeDraft, coffees: Coffee[]): ShelfHistory {
  const roasterOf = groupRoasters([...coffees.map((c) => c.roaster), draft.roaster])
  const key = roasterOf(draft.roaster)?.key
  const sameRoaster = key ? coffees.filter((c) => roasterOf(c.roaster)?.key === key) : []
  // Without a roaster only an exact name counts, so two "Ethiopia" bags don't look like one coffee.
  const name = normalize(draft.name).trim()
  const tried = (key ? sameRoaster.filter((c) => sameCoffee(c, draft)) : name ? coffees.filter((c) => !c.roaster.trim() && normalize(c.name).trim() === name) : [])
    .sort((a, b) => b.createdAt - a.createdAt)
  const rating = tried.find((c) => c.rating != null)?.rating ?? null
  if (!key || !sameRoaster.length) return { tried, rating, roaster: key ? { label: draft.roaster.trim(), bags: 0, rated: 0, average: null } : undefined }
  const rated = sameRoaster.filter((c) => c.rating != null)
  return {
    tried,
    rating,
    roaster: {
      label: roasterOf(draft.roaster)!.label,
      bags: sameRoaster.length,
      rated: rated.length,
      average: rated.length ? rated.reduce((s, c) => s + c.rating!, 0) / rated.length : null,
    },
  }
}
