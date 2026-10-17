import { sameWord } from './fuzzy'
import { normalize } from './lexicon'

/** Words that describe the business rather than name it ("… Specialty Coffee Roasters"). */
export const GENERIC_WORDS = new Set([
  'coffee', 'coffees', 'kaffe', 'kaffee', 'koffie', 'café', 'cafe', 'caffè', 'caffe',
  'roaster', 'roasters', 'roastery', 'roasteries', 'roasting', 'roasted', 'roastworks', 'roast',
  'specialty', 'speciality', 'special', 'micro', 'microroastery', 'craft', 'artisan', 'fresh',
  'company', 'co', 'inc', 'ltd', 'lab', 'labs', 'house', 'shop', 'bar', 'store', 'the',
  'кофе', 'кофейня', 'кофейная', 'обжарщик', 'обжарка', 'обжарочная', 'спешелти', 'компания', 'лаборатория',
])

/** Extra words ignored only when deciding whether two roaster names are the same business. */
const SAME_BUSINESS_WORDS = new Set(['family', 'familia', 'bros', 'brothers', 'and', 'семейная', 'семья'])

/** The words that identify a roaster: no brackets, case, accents or generic business words. */
function core(name: string): string[] {
  const words = normalize(name.replace(/\(.*?\)/g, ' ')).split(/[^\p{L}\p{N}]+/u).filter(Boolean)
  const kept = words.filter((w) => !GENERIC_WORDS.has(w) && !SAME_BUSINESS_WORDS.has(w))
  return kept.length ? kept : words
}

export interface RoasterGroup {
  key: string
  /** Name shown for the group: the most used spelling, the shorter on a tie. */
  label: string
}

/**
 * Groups spellings of the same roaster: "Martines" and "Martines family roastery" share the core
 * "martines". Names merge when one core is the start of the other, so "Square Mile" and "Square
 * One" stay apart.
 */
export function groupRoasters(names: string[]): (name: string) => RoasterGroup | undefined {
  const counts = new Map<string, number>()
  for (const n of names.map((x) => x.trim()).filter(Boolean)) counts.set(n, (counts.get(n) ?? 0) + 1)
  const spellings = [...counts.keys()].map((name) => ({ name, core: core(name) })).sort((a, b) => a.core.length - b.core.length)
  const groups: { core: string[]; names: string[] }[] = []
  for (const s of spellings) {
    // A misread letter still counts as the same roaster ("Martines" / "Martinez").
    const g = groups.find((g) => g.core.every((w, i) => s.core[i] != null && sameWord(s.core[i], w)))
    if (g) g.names.push(s.name)
    else groups.push({ core: s.core, names: [s.name] })
  }
  const byName = new Map<string, RoasterGroup>()
  for (const g of groups) {
    const label = [...g.names].sort((a, b) => counts.get(b)! - counts.get(a)! || a.length - b.length)[0]
    for (const n of g.names) byName.set(n, { key: g.core.join(' '), label })
  }
  return (name) => byName.get(name.trim())
}
