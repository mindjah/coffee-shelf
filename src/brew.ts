// When the bag doesn't say what it's roasted for, estimate it from the rest of the label. Roast
// level is the strongest sign; origin, process, variety, score and the tasting notes tip it.
import { normalize } from './lexicon'
import type { Brew, CoffeeDraft, Roast } from './types'

export type BrewMethod = 'filter' | 'espresso' | 'omni'
type Side = 'filter' | 'espresso'

export type BrewClue =
  | { id: 'roast'; roast: Roast }
  | { id: 'blend' | 'bright' | 'floral' | 'chocolate' | 'anaerobic' | 'geisha' | 'sca' | 'eastAfrica' | 'brazil' }

interface Weighted { clue: BrewClue; side: Side; weight: number }

export interface BrewGuess {
  method: BrewMethod
  /** Taken from the coffee's own "Roasted for" (the bag or an edit), not estimated. */
  stated?: boolean
  /** Strongest signs behind the guess, strongest first. */
  clues: BrewClue[]
}

const ROAST_SIDE: Partial<Record<Roast, [Side, number]>> = {
  light: ['filter', 3],
  'medium-light': ['filter', 2],
  medium: ['espresso', 1],
  'medium-dark': ['espresso', 2.5],
  dark: ['espresso', 3],
}

function clues(c: CoffeeDraft): Weighted[] {
  const out: Weighted[] = []
  const add = (clue: BrewClue, side: Side, weight: number) => out.push({ clue, side, weight })
  const roast = ROAST_SIDE[c.roast]
  if (roast) add({ id: 'roast', roast: c.roast }, ...roast)
  const nameWords = normalize(c.name).split(/[^\p{L}]+/u)
  if (c.region === 'blend' || nameWords.some((w) => ['blend', 'бленд', 'mezcla'].includes(w))) add({ id: 'blend' }, 'espresso', 2)
  // Printed notes only: an estimated profile already comes from origin, process and roast.
  if (!c.flavorsEstimated) {
    const f = c.flavors
    if (Math.max(f.floral, f.tea) >= 0.5) add({ id: 'floral' }, 'filter', 2)
    if (Math.max(f.citrus, f.berry, f.stoneFruit) >= 0.66) add({ id: 'bright' }, 'filter', 1.5)
    const dark = Math.max(f.chocolate, f.nutty, f.roasty)
    if (dark >= 0.66 && dark >= Math.max(f.floral, f.citrus, f.berry, f.stoneFruit)) add({ id: 'chocolate' }, 'espresso', 1.5)
  }
  if (c.process === 'anaerobic') add({ id: 'anaerobic' }, 'filter', 1)
  if (c.varieties.some((v) => /ge(i)?sha/i.test(v))) add({ id: 'geisha' }, 'filter', 2)
  if ((c.scaScore ?? 0) >= 87) add({ id: 'sca' }, 'filter', 1)
  if (c.region === 'east-africa') add({ id: 'eastAfrica' }, 'filter', 1)
  if (c.region !== 'blend' && c.countryCodes?.length === 1 && c.countryCodes[0] === 'BR') add({ id: 'brazil' }, 'espresso', 1)
  return out
}

/** A likely brew method when the bag doesn't print one; null when the label says too little. */
export function guessBrewMethod(c: CoffeeDraft): BrewGuess | null {
  if (c.roastFor !== 'unknown') return null
  const all = clues(c)
  const score = (side: Side) => all.filter((w) => w.side === side).reduce((s, w) => s + w.weight, 0)
  const filter = score('filter')
  const espresso = score('espresso')
  if (filter + espresso < 2) return null
  const method: BrewMethod = filter - espresso >= 1.5 ? 'filter' : espresso - filter >= 1.5 ? 'espresso' : 'omni'
  const shown = all
    .filter((w) => method === 'omni' || w.side === method)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
  return { method, clues: shown.map((w) => w.clue) }
}

/** The brew method to show: the stated one, else a guess. */
export function brewMethod(c: CoffeeDraft): BrewGuess | null {
  return c.roastFor !== 'unknown' ? { method: c.roastFor, clues: [], stated: true } : guessBrewMethod(c)
}

/** Recipe names (any language the encyclopedia has, and your own recipes) → the general method. */
const RECIPE_METHODS: [RegExp, Brew][] = [
  [/\bv\s?60\b|iced pour|холодный пуровер|con hielo/i, 'v60'],
  [/kalita|калита/i, 'kalita'],
  [/origami|оригами/i, 'origami'],
  [/chemex|кемекс/i, 'chemex'],
  [/clever|кливер/i, 'clever'],
  [/aero\s?press|аэропресс/i, 'aeropress'],
  [/french press|prensa francesa|френч/i, 'frenchPress'],
  [/moka|мока|гейзер|italiana/i, 'moka'],
  [/cold brew|колд брю/i, 'coldBrew'],
  [/cezve|джезв|турк|turkish|turco/i, 'cezve'],
  [/espresso|эспрессо/i, 'espresso'],
]

/**
 * The brew method a rating goes under, from a recipe's name: "V60 — 4:6 method" is V60,
 * "AeroPress — inverted" is AeroPress, "Japanese iced pour-over" is brewed in a V60.
 */
export function brewOfRecipe(title: string): Brew | null {
  return RECIPE_METHODS.find(([re]) => re.test(title))?.[1] ?? null
}
