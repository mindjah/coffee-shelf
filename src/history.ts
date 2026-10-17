// What the shelf already knows about a freshly scanned bag: the same coffee logged before, and
// other bags from the same roaster. Archived coffees count too — you did buy them.
import { normalize } from './lexicon'
import { samePhrase, wordsWithin } from './fuzzy'
import { findCountries } from './parse'
import { GENERIC_WORDS, groupRoasters } from './roaster'
import type { Coffee, CoffeeDraft } from './types'

/** Words that vary between bags of the same lot ("Kerisa" vs "Kerisa Natural"). */
const VARYING_WORDS = new Set([
  'natural', 'washed', 'honey', 'anaerobic', 'lavado', 'anaerobico', 'miel',
  'натуральная', 'мытая', 'хани', 'анаэробная', 'lot', 'лот', 'filter', 'espresso', 'фильтр', 'эспрессо',
  'decaf', 'microlot', 'micro',
])

const PRODUCER_WORDS = new Set([
  'farm', 'finca', 'estate', 'hacienda', 'fazenda', 'sitio', 'washing', 'station', 'estacion', 'lavado',
  'cooperative', 'cooperativa', 'coop', 'mill', 'beneficio', 'ферма', 'станция', 'кооператив', 'the', 'los', 'las', 'del',
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

/** Farm or producer words without the generic ones ("El Placer Farm" ~ "Finca El Placer"). */
function producerWords(producer: string): string[] {
  return normalize(producer).split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2 && !PRODUCER_WORDS.has(w))
}

/**
 * Same coffee from the same roaster, read twice — and reading makes mistakes, so words may differ by
 * a letter or two (see fuzzy.ts). It matches when the names agree once origin and process words are
 * dropped, one name is the other with words added (at least two words in common), or the bag
 * details agree: same producer, country and process.
 */
function sameCoffee(a: CoffeeDraft, b: CoffeeDraft): boolean {
  const [x, y] = [nameWords(a.name), nameWords(b.name)].sort((p, q) => p.length - q.length)
  if (x.length && samePhrase(x, y)) return true
  if (x.length >= 2 && wordsWithin(x, y)) return true
  const [px, py] = [producerWords(a.producer), producerWords(b.producer)].sort((p, q) => p.length - q.length)
  return px.length > 0 && wordsWithin(px, py)
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
