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
  'decaf', 'microlot', 'micro', 'drip', 'дрип', 'дрип-пакет',
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

const KNOWN_PROCESSES = new Set(['washed', 'natural', 'honey', 'anaerobic'])

/** Variety words, so "Red Bourbon" and "Bourbon" share one but "Typica" and "Caturra" share none. */
const varietyWords = (c: CoffeeDraft) => c.varieties.flatMap((v) => normalize(v).split(/[^\p{L}\p{N}]+/u)).filter((w) => w.length >= 4)

/**
 * Bag details that can't both be true of one coffee: different countries, processes or varieties.
 * One series often shares a name across coffees ("… Drip Coffee"), so a matching name alone isn't
 * proof. Only details read on both bags count; a missing one proves nothing.
 */
function contradicts(a: CoffeeDraft, b: CoffeeDraft): boolean {
  const [ca, cb] = [a.countryCodes ?? [], b.countryCodes ?? []]
  if (ca.length && cb.length && !ca.some((c) => cb.includes(c))) return true
  if (KNOWN_PROCESSES.has(a.process) && KNOWN_PROCESSES.has(b.process) && a.process !== b.process) return true
  const [va, vb] = [varietyWords(a), varietyWords(b)]
  return va.length > 0 && vb.length > 0 && !va.some((w) => wordsWithin([w], vb))
}

/**
 * Same coffee from the same roaster, read twice — and reading makes mistakes, so words may differ by
 * a letter or two (see fuzzy.ts). It matches when the names agree once origin and process words are
 * dropped, one name is the other plus one word (at least two words in common), or the bag details
 * agree: same producer, country and process. Never when the details contradict (see contradicts()).
 */
function sameCoffee(a: CoffeeDraft, b: CoffeeDraft): boolean {
  if (contradicts(a, b)) return false
  const [x, y] = [nameWords(a.name), nameWords(b.name)].sort((p, q) => p.length - q.length)
  if (x.length && samePhrase(x, y)) return true
  // A name of only generic words ("Fresh Lot", "House Espresso"): the whole name has to agree.
  if (!x.length && !y.length && normalize(a.name).trim() && normalize(a.name).trim() === normalize(b.name).trim()) return true
  // "Sebastian Ramirez" ~ "Sebastian Ramirez Competition", but a series name plus a coffee name
  // ("Unholy Water" vs "Unholy Water Spicy Mix") is a different coffee.
  if (x.length >= 2 && y.length - x.length <= 1 && wordsWithin(x, y)) return true
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
