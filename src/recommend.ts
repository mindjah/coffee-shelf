import { FLAVORS, type Brew, type Coffee, type CoffeeDraft, type Region } from './types'
import { brewMethod } from './brew'
import { sameRoaster } from './roaster'
import { normalize } from './lexicon'
import { methodRatings } from './ratings'

/**
 * Content-based recommender sized for a personal journal (tens of ratings):
 * - kNN: similarity-weighted average of your ratings for coffees close in feature space,
 *   shrunk toward your mean rating when nothing similar has been rated yet.
 * - Ridge regression over the same features, used both as a second opinion and to explain
 *   which traits push a prediction up or down.
 * How much each group of traits counts, and how the two are blended, is tuned to your own ratings
 * by leave-one-out testing (see tune()), which also measures how accurate predictions are.
 */

/** Traits tuned together: one weight per group. */
export const GROUPS = ['flavor', 'process', 'origin', 'roast', 'structure', 'altitude', 'roaster', 'variety', 'sca', 'brew'] as const
export type Group = (typeof GROUPS)[number]

export interface Params {
  /** Multiplier on each group's built-in weight; 0 switches a group off. */
  mult: Record<Group, number>
  /** Share of the ridge prediction in the final score (the rest is kNN). */
  blend: number
  /** Ridge regularisation: higher trusts individual traits less. */
  lambda: number
}

export const DEFAULT_PARAMS: Params = {
  mult: Object.fromEntries(GROUPS.map((g) => [g, 1])) as Record<Group, number>,
  blend: 0.5,
  lambda: 1.5,
}

interface Feature {
  /** Key into the i18n `reasons` table, or "country:XX" / "roaster:Name" / "variety:Name". */
  id: string
  group: Group
  weight: number
  get: (c: CoffeeDraft) => number
  /** Helps matching but isn't shown as a reason (broad regions; countries are shown instead). */
  hidden?: boolean
  /**
   * False when the bag doesn't say (no country, process unknown…). The trait then takes the
   * average of your rated coffees, so a missing fact counts as neither "is" nor "isn't".
   */
  known?: (c: CoffeeDraft) => boolean
}

const ROAST_VALUE = { light: 0, 'medium-light': 0.25, medium: 0.5, 'medium-dark': 0.75, dark: 1, unknown: 0.35 }
const scale = (v: number | null) => (v == null ? 0.5 : (v - 1) / 4)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** A flavor profile worth comparing: from tasting notes, or estimated from at least origin or process. */
export const hasProfile = (c: CoffeeDraft) => !c.flavorsEstimated || c.region !== 'unknown' || c.process !== 'unknown' || c.roast !== 'unknown'

/**
 * How much the bag tells about the taste: tasting notes count double, then origin, process, roast
 * and varieties, with altitude, SCA score and printed acidity/body/sweetness as half facts. The
 * roaster, name and weight say nothing about how it tastes.
 */
export function bagFacts(c: CoffeeDraft): number {
  return (c.flavorsEstimated ? 0 : 2) +
    (c.countryCodes?.length || c.region !== 'unknown' ? 1 : 0) +
    (c.process !== 'unknown' ? 1 : 0) +
    (c.roast !== 'unknown' ? 1 : 0) +
    (c.varieties.length ? 1 : 0) +
    (c.altitude != null ? 0.5 : 0) +
    (c.scaScore != null ? 0.5 : 0) +
    (c.structure.acidity != null || c.structure.body != null || c.structure.sweetness != null ? 0.5 : 0)
}

/** Below this, there's too little on the bag to guess how you'd like it, or what it's like. */
export const MIN_FACTS = 2
const bagIsThin = (c: CoffeeDraft) => bagFacts(c) < MIN_FACTS

const BASE_FEATURES: Feature[] = [
  ...FLAVORS.map((f) => ({
    id: f,
    group: 'flavor' as const,
    weight: 1,
    get: (c: CoffeeDraft) => c.flavors[f] ?? 0,
    known: hasProfile,
  })),
  ...(['washed', 'natural', 'honey', 'anaerobic'] as const).map((p) => ({
    id: p,
    group: 'process' as const,
    weight: 0.8,
    get: (c: CoffeeDraft) => (c.process === p ? 1 : 0),
    known: (c: CoffeeDraft) => c.process !== 'unknown',
  })),
  // Lets a bag from a country you haven't rated still match its neighbours (Burundi ~ Kenya).
  ...(['east-africa', 'other-africa', 'central-america', 'south-america', 'asia-pacific'] as Region[]).map((r) => ({
    id: r,
    group: 'origin' as const,
    weight: 0.3,
    get: (c: CoffeeDraft) => (c.region === r ? 1 : 0),
    known: (c: CoffeeDraft) => c.region !== 'unknown',
    hidden: true,
  })),
  // Printed on the bag or estimated from it.
  { id: 'espresso', group: 'roast', weight: 0.4, get: (c) => (brewMethod(c)?.method === 'espresso' ? 1 : 0), known: (c) => !!brewMethod(c) },
  { id: 'roast', group: 'roast', weight: 1, get: (c) => ROAST_VALUE[c.roast], known: (c) => c.roast !== 'unknown' },
  { id: 'acidity', group: 'structure', weight: 0.7, get: (c) => scale(c.structure.acidity) },
  { id: 'body', group: 'structure', weight: 0.7, get: (c) => scale(c.structure.body) },
  { id: 'sweetness', group: 'structure', weight: 0.5, get: (c) => scale(c.structure.sweetness) },
  {
    id: 'altitude',
    group: 'altitude',
    weight: 0.3,
    get: (c) => (c.altitude == null ? 0.5 : clamp01((c.altitude - 1000) / 1400)),
  },
  // 80 → 0, 92+ → 1; a bag without a score sits in the middle.
  { id: 'sca', group: 'sca', weight: 0.5, get: (c) => (c.scaScore == null ? 0.5 : clamp01((c.scaScore - 80) / 12)) },
  // V60 is 0, AeroPress 1; ratings from before the method was asked sit in between.
  { id: 'aeropress', group: 'brew', weight: 0.6, get: (c) => (c.brewedWith === 'aeropress' ? 1 : c.brewedWith === 'v60' ? 0 : 0.5) },
]

/** Countries, roasters and varieties become their own factor once you've rated at least this many. */
const MIN_RATED_FOR_FACTOR = 2

/** Variety spellings that are the same plant. */
const varietyKey = (v: string) => normalize(v).replace(/\bgesha\b/, 'geisha').replace(/\bborbon\b/, 'bourbon').trim()

function frequent<T>(items: T[][], key: (t: T) => string): Map<string, T> {
  const seen = new Map<string, { item: T; n: number }>()
  for (const list of items) {
    for (const [k, item] of new Map(list.map((t) => [key(t), t]))) {
      if (k) seen.set(k, { item: seen.get(k)?.item ?? item, n: (seen.get(k)?.n ?? 0) + 1 })
    }
  }
  return new Map([...seen].filter(([, v]) => v.n >= MIN_RATED_FOR_FACTOR).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, v.item]))
}

function extraFeatures(rated: Coffee[]): Feature[] {
  const countries = frequent(rated.map((c) => c.countryCodes ?? []), (code) => code)
  // Roasters are grouped by name with misread letters allowed; the first spelling names the group.
  const roasterNames: string[] = []
  for (const c of rated) if (c.roaster.trim() && !roasterNames.some((r) => sameRoaster(r, c.roaster))) roasterNames.push(c.roaster.trim())
  const roasters = frequent(rated.map((c) => roasterNames.filter((r) => sameRoaster(r, c.roaster))), (r) => r)
  const varieties = frequent(rated.map((c) => c.varieties), varietyKey)
  return [
    ...[...countries.keys()].map((code) => ({
      id: `country:${code}`,
      group: 'origin' as const,
      weight: 0.6,
      get: (c: CoffeeDraft) => ((c.countryCodes ?? []).includes(code) ? 1 : 0),
      known: (c: CoffeeDraft) => !!c.countryCodes?.length,
    })),
    ...[...roasters.keys()].map((name) => ({
      id: `roaster:${name}`,
      group: 'roaster' as const,
      weight: 0.6,
      get: (c: CoffeeDraft) => (sameRoaster(name, c.roaster) ? 1 : 0),
      known: (c: CoffeeDraft) => !!c.roaster.trim(),
    })),
    ...[...varieties].map(([key, name]) => ({
      id: `variety:${name}`,
      group: 'variety' as const,
      weight: 0.5,
      get: (c: CoffeeDraft) => (c.varieties.some((v) => varietyKey(v) === key) ? 1 : 0),
      known: (c: CoffeeDraft) => c.varieties.length > 0,
    })),
  ]
}

/** Each trait's average over your rated coffees that state it: the stand-in when a bag doesn't. */
function fillsFor(features: Feature[], rated: Coffee[]) {
  return features.map((f) => {
    const known = rated.filter((c) => f.known?.(c) ?? true)
    return known.length ? known.reduce((s, c) => s + f.get(c), 0) / known.length : 0
  })
}

const vec = (features: Feature[], params: Params, fills: number[], c: CoffeeDraft) =>
  features.map((f, j) => ((f.known?.(c) ?? true) ? f.get(c) : fills[j]) * Math.sqrt(f.weight * params.mult[f.group]))

function dist2(a: number[], b: number[]) {
  let s = 0
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2
  return s
}

/**
 * Distance between two coffees. An estimated profile is a guess from origin and process, so when
 * either side's flavors are estimated the flavor traits count for half: two lots of the same
 * origin and process aren't pushed apart because one bag printed notes and the other didn't.
 */
function distance(flavor: boolean[], a: number[], aGuess: boolean, b: number[], bGuess: boolean) {
  const k = aGuess || bGuess ? 0.5 : 1
  let s = 0
  for (let i = 0; i < a.length; i++) s += (flavor[i] ? k : 1) * (a[i] - b[i]) ** 2
  return s
}

/** Words in coffee names that don't tell one coffee from another. */
const COMMON = new Set(['coffee', 'cafe', 'кофе', 'lot', 'лот', 'blend', 'бленд', 'mezcla', 'espresso', 'эспрессо', 'filter', 'фильтр', 'filtro', 'drip', 'micro', 'microlot',
  'washed', 'natural', 'honey', 'anaerobic', 'мытый', 'мытая', 'натуральный', 'натуральная', 'лавадо', 'lavado', 'grade', 'single', 'origin', 'decaf'])
const countryWords = new Map<string, string[]>()

/** Words that name this coffee in particular: not the roaster's, its country's, a process or a grade. */
function nameWords(c: CoffeeDraft) {
  const split = (s: string) => normalize(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean)
  const skip = new Set([...split(c.roaster), ...split(c.country)])
  for (const code of c.countryCodes ?? []) {
    let words = countryWords.get(code)
    if (!words) {
      words = ['en', 'ru', 'es'].flatMap((l) => {
        try { return split(new Intl.DisplayNames([l], { type: 'region' }).of(code) ?? '') } catch { return [] }
      })
      countryWords.set(code, words)
    }
    words.forEach((w) => skip.add(w))
  }
  return new Set(split(c.name).filter((w) => w.length >= 3 && !/^(g|gr)\d$|^\d+$/.test(w) && !COMMON.has(w) && !skip.has(w)))
}

/**
 * Another lot of the same coffee, as far as the bags tell: same roaster and origin country, no
 * conflicting process, and a word of the name in common (Worka Smoky BBQ and Wicho BBQ). Same
 * roaster and country alone isn't enough: two Ethiopian stations from one roaster can taste, and
 * be rated, nothing alike.
 */
export function kin(a: CoffeeDraft, b: CoffeeDraft) {
  const ca = a.countryCodes ?? []
  const cb = b.countryCodes ?? []
  if (!sameRoaster(a.roaster, b.roaster) || !ca.some((code) => cb.includes(code))) return false
  if (a.process !== b.process && a.process !== 'unknown' && b.process !== 'unknown') return false
  const wa = nameWords(a)
  return [...nameWords(b)].some((w) => wa.has(w))
}

/** How much closer kin are than their traits alone make them, and how much more a rated one counts. */
const KIN_PULL = 0.35
const KIN_WEIGHT = 3

/** Solves A x = b in place with partial pivoting; A is small and symmetric positive definite. */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length
  for (let i = 0; i < n; i++) {
    let p = i
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r
    ;[A[i], A[p]] = [A[p], A[i]]
    ;[b[i], b[p]] = [b[p], b[i]]
    for (let r = i + 1; r < n; r++) {
      const k = A[r][i] / A[i][i]
      for (let c = i; c < n; c++) A[r][c] -= k * A[i][c]
      b[r] -= k * b[i]
    }
  }
  const x = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i]
    for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c]
    x[i] = s / A[i][i]
  }
  return x
}

/** Running sums for ridge regression, so one coffee can be taken out cheaply when testing. */
interface Sums {
  n: number
  sy: number
  sx: number[]
  sxx: number[][]
  sxy: number[]
}

/** A training row; `w` is how much it counts (see rowWeight). */
interface Row {
  x: number[]
  y: number
  w: number
  /** Its flavors are estimated, not from the bag's notes. */
  guess: boolean
  coffee: CoffeeDraft
  /**
   * Its bag says too little about the taste (see bagFacts()). With most traits missing it sits in
   * the middle of everything, so it can't be anyone's neighbour; it still counts in the ridge fit,
   * where missing traits are neutral.
   */
  thin: boolean
}

/** Weighted running sums: `n` is the total weight. */
function sums(rs: Row[]): Sums {
  const d = rs[0]?.x.length ?? 0
  const s: Sums = { n: 0, sy: 0, sx: new Array(d).fill(0), sxx: Array.from({ length: d }, () => new Array(d).fill(0)), sxy: new Array(d).fill(0) }
  for (const { x, y, w } of rs) {
    s.n += w
    s.sy += w * y
    for (let i = 0; i < d; i++) {
      s.sx[i] += w * x[i]
      s.sxy[i] += w * x[i] * y
      for (let j = 0; j < d; j++) s.sxx[i][j] += w * x[i] * x[j]
    }
  }
  return s
}

/** Weighted mean rating. */
const meanOf = (rs: Row[]) => {
  const w = rs.reduce((s, r) => s + r.w, 0)
  return w ? rs.reduce((s, r) => s + r.w * r.y, 0) / w : 3
}

/** Ridge fit on centred data; `without` leaves some rows out (one coffee's ratings, when testing). */
function ridge(s: Sums, lambda: number, without: Row[] = []) {
  const d = s.sx.length
  const n = s.n - without.reduce((sum, r) => sum + r.w, 0)
  const minus = (f: (r: Row) => number) => without.reduce((sum, r) => sum + r.w * f(r), 0)
  const featureMean = s.sx.map((v, i) => (v - minus((r) => r.x[i])) / n)
  const mean = (s.sy - minus((r) => r.y)) / n
  const A = Array.from({ length: d }, (_, i) =>
    Array.from({ length: d }, (_, j) => s.sxx[i][j] - minus((r) => r.x[i] * r.x[j]) - n * featureMean[i] * featureMean[j] + (i === j ? lambda : 0)))
  const b = s.sxy.map((v, i) => v - minus((r) => r.x[i] * r.y) - n * featureMean[i] * mean)
  return { beta: solve(A, b), featureMean, mean }
}

/**
 * How much a rated coffee teaches the model: half when its profile was estimated (no tasting notes,
 * or only drinks named as associations), since the flavors are a guess rather than the bag's word.
 */
const rowWeight = (c: CoffeeDraft) => (c.flavorsEstimated ? 0.5 : 1)

/** One training row per rating: a coffee rated in both V60 and AeroPress counts twice, once per method. */
function rows(features: Feature[], params: Params, fills: number[], rated: Coffee[]) {
  return rated.flatMap((coffee) =>
    methodRatings(coffee).map((m) => ({ coffee, brew: m.brew, y: m.rating, w: rowWeight(coffee), guess: coffee.flavorsEstimated, thin: bagIsThin(coffee), x: vec(features, params, fills, { ...coffee, brewedWith: m.brew }) })))
}

/** Kernel width from the typical distance between your coffees, so it adapts as the library grows. */
function kernelWidth(xs: number[][]) {
  const ds: number[] = []
  for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) ds.push(dist2(xs[i], xs[j]))
  ds.sort((a, b) => a - b)
  return Math.max(0.15, (ds[Math.floor(ds.length / 2)] ?? 1) * 0.5)
}

function similarity(flavor: boolean[], x: number[], c: CoffeeDraft, r: Row, sigma2: number) {
  const k = kin(c, r.coffee)
  return { sim: Math.exp(-distance(flavor, x, c.flavorsEstimated, r.x, r.guess) * (k ? KIN_PULL : 1) / (2 * sigma2)), kin: k }
}

function knn(flavor: boolean[], x: number[], c: CoffeeDraft, pool: Row[], mean: number, sigma2: number) {
  // A rated kin counts like several neighbours, and in full even with a guessed profile: what makes
  // them kin isn't the guess.
  const sims = pool.map((r) => ({ r, ...similarity(flavor, x, c, r, sigma2) })).filter((t) => !t.r.thin || t.kin).map((t) => ({ ...t, s: (t.kin ? KIN_WEIGHT : t.r.w) * t.sim })).sort((a, b) => b.s - a.s).slice(0, 7)
  const wSum = sims.reduce((s, t) => s + t.s, 0)
  const top = Math.max(0, ...sims.map((t) => t.sim))
  return { score: mean + sims.reduce((s, t) => s + t.s * (t.r.y - mean), 0) / (wSum + 0.5), wSum, top }
}

/**
 * How much the ridge fit counts next to kNN. A rated coffee nearly identical to this one (another
 * lot of the same coffee) is the best evidence there is, so the fit, which can only speak in
 * averages, steps back as the closest match gets near.
 */
const ridgeShare = (blend: number, top: number) => blend * (1 - top ** 4)

export interface Accuracy {
  /** Ratings it was tested on. */
  n: number
  /** Average miss, in stars. */
  mae: number
  /** Share of predictions within half a star. */
  within: number
  /** Average miss of always guessing your average rating, for comparison. */
  baseline: number
  /** Weights were tuned to your ratings (enough of them). */
  tuned: boolean
}

export interface Model {
  /** Base features plus one per country, roaster and variety you've rated enough of. */
  features: Feature[]
  /** Which features are flavors (see distance()). */
  flavor: boolean[]
  /** Stand-ins for traits a bag doesn't state (see fillsFor()). */
  fills: number[]
  params: Params
  count: number
  mean: number
  /** One row per rating (see rows()). */
  rated: (Row & { coffee: Coffee; brew: Brew | null })[]
  sigma2: number
  featureMean: number[]
  beta: number[] | null
  /** Rated with each brew method, to tell when a per-method prediction means something. */
  brewCounts: Record<Brew, number>
  accuracy?: Accuracy
}

export const MIN_RATINGS = 3
const RIDGE_FROM = 6

export function buildModel(all: Coffee[], params: Params = DEFAULT_PARAMS, accuracy?: Accuracy): Model {
  const ratedCoffees = all.filter((c) => c.rating != null)
  const features = [...BASE_FEATURES, ...extraFeatures(ratedCoffees)]
  const fills = fillsFor(features, ratedCoffees)
  const rated = rows(features, params, fills, ratedCoffees)
  const n = rated.length
  const mean = meanOf(rated)
  const fit = n >= RIDGE_FROM ? ridge(sums(rated), params.lambda) : null
  return {
    features,
    flavor: features.map((f) => f.group === 'flavor'),
    fills,
    params,
    count: ratedCoffees.length,
    mean,
    rated,
    sigma2: kernelWidth(rated.map((r) => r.x)),
    featureMean: fit?.featureMean ?? new Array(features.length).fill(0),
    beta: fit?.beta ?? null,
    brewCounts: {
      v60: rated.filter((r) => r.brew === 'v60').length,
      aeropress: rated.filter((r) => r.brew === 'aeropress').length,
    },
    accuracy,
  }
}

// --- testing & tuning ----------------------------------------------------------

/**
 * Each rating predicted from all the other coffees, compared with your real rating. A coffee's other
 * method's rating is left out too: it would give the answer away.
 */
export function evaluate(ratedCoffees: Coffee[], params: Params): Omit<Accuracy, 'tuned'> | null {
  if (ratedCoffees.length < MIN_RATINGS + 1) return null
  const features = [...BASE_FEATURES, ...extraFeatures(ratedCoffees)]
  const flavor = features.map((f) => f.group === 'flavor')
  const pool = rows(features, params, fillsFor(features, ratedCoffees), ratedCoffees)
  const all = sums(pool)
  const sigma2 = kernelWidth(pool.map((r) => r.x))
  let miss = 0
  let close = 0
  let baseline = 0
  // Bags too thin to predict get no prediction in the app, so they aren't tested either.
  for (const coffee of ratedCoffees.filter((c) => !bagIsThin(c))) {
    const mine = pool.filter((r) => r.coffee === coffee)
    const others = pool.filter((r) => r.coffee !== coffee)
    const mean = meanOf(others)
    // The yardstick: your plain average rating, the same for every row.
    const average = others.reduce((s, r) => s + r.y, 0) / others.length
    for (const row of mine) {
      const k = knn(flavor, row.x, coffee, others, mean, sigma2)
      let score = k.score
      if (others.length >= RIDGE_FROM && params.blend > 0) {
        const fit = ridge(all, params.lambda, mine)
        const r = fit.mean + fit.beta.reduce((s, b, j) => s + b * (row.x[j] - fit.featureMean[j]), 0)
        const share = ridgeShare(params.blend, k.top)
        score = (1 - share) * score + share * r
      }
      score = Math.min(5, Math.max(1, score))
      miss += Math.abs(score - row.y)
      if (Math.abs(score - row.y) <= 0.5) close++
      baseline += Math.abs(average - row.y)
    }
  }
  const n = pool.filter((r) => !r.thin).length
  if (!n) return null
  return { n, mae: miss / n, within: close / n, baseline: baseline / n }
}

/** Below this many ratings the weights stay as built in: too few to tune without fooling ourselves. */
export const TUNE_FROM = 10

/**
 * Picks the weights that predict your own ratings best (each coffee predicted from the others), one
 * setting at a time. A change has to beat the current best clearly, so a handful of ratings can't
 * push the weights around on noise.
 */
export function tune(all: Coffee[]): { params: Params; accuracy: Accuracy | null } {
  const rated = all.filter((c) => c.rating != null)
  let params = DEFAULT_PARAMS
  let best = evaluate(rated, params)
  if (!best || rated.length < TUNE_FROM) return { params, accuracy: best && { ...best, tuned: false } }
  const tryParams = (next: Params) => {
    const result = evaluate(rated, next)
    if (result && result.mae < best!.mae * 0.99) {
      params = next
      best = result
    }
  }
  for (let round = 0; round < 2; round++) {
    for (const blend of [0, 0.25, 0.5, 0.75, 1]) tryParams({ ...params, blend })
    for (const lambda of [0.5, 1.5, 4, 10]) tryParams({ ...params, lambda })
    for (const g of GROUPS) for (const m of [0, 0.5, 1, 2, 3]) tryParams({ ...params, mult: { ...params.mult, [g]: m } })
  }
  return { params, accuracy: { ...best, tuned: true } }
}

// --- predictions -----------------------------------------------------------------

export interface Reason {
  id: string
  /** Present (or higher) rather than absent (or lower) on this coffee. */
  up: boolean
  impact: number
}

/** Verdict band for a 1–5 score, shared by predictions and your own ratings. */
export const toneFor = (score: number): Prediction['tone'] =>
  score >= 4.2 ? 'love' : score >= 3.6 ? 'like' : score >= 2.9 ? 'maybe' : 'pass'

export interface Prediction {
  score: number
  confidence: 'low' | 'medium' | 'high'
  tone: 'love' | 'like' | 'maybe' | 'pass'
  reasons: Reason[]
  similar: { coffee: Coffee; similarity: number }[]
  /** The brew method this score is for. */
  brew: Brew
  /** Scores per method, once you've rated a few coffees with each. */
  byBrew?: Record<Brew, number>
}

function scoreFor(model: Model, x: number[], c: CoffeeDraft) {
  const k = knn(model.flavor, x, c, model.rated, model.mean, model.sigma2)
  if (!model.beta) return { score: k.score, wSum: k.wSum, contrib: null }
  const contrib = model.features.map((f, j) => ({ f, delta: x[j] - model.featureMean[j], impact: model.beta![j] * (x[j] - model.featureMean[j]) }))
  const r = model.mean + contrib.reduce((s, c) => s + c.impact, 0)
  const share = ridgeShare(model.params.blend, k.top)
  return { score: (1 - share) * k.score + share * r, wSum: k.wSum, contrib }
}

const clampScore = (s: number) => Math.min(5, Math.max(1, s))

/** Predicted rating for a coffee brewed with `brew` (your usual method); `excludeId` keeps a saved coffee out of its own "closest" list. */
export function predict(model: Model, c: CoffeeDraft, brew: Brew = 'v60', excludeId?: number): Prediction | null {
  if (model.count < MIN_RATINGS) return null
  // Roaster and name alone say nothing about the taste: no guess, and nothing is "similar".
  const facts = bagFacts(c)
  if (facts < MIN_FACTS) return null
  const x = vec(model.features, model.params, model.fills, { ...c, brewedWith: brew })
  const { score, wSum, contrib } = scoreFor(model, x, c)

  const reasons: Reason[] = []
  // A rated lot of the same coffee leads the reasons: it's what the guess rests on most.
  const sibling = model.rated.filter((r) => r.coffee.id !== excludeId && kin(c, r.coffee)).sort((a, b) => b.y - a.y)[0]
  if (sibling) reasons.push({ id: `kin:${sibling.y}:${sibling.coffee.name || sibling.coffee.roaster}`, up: sibling.y >= model.mean, impact: sibling.y - model.mean })
  if (contrib) {
    // The brew method is your choice, not the coffee's, so it isn't given as a reason.
    // Nor is a trait the bag doesn't state ("not Colombia" for a bag that names no country).
    // "Not Colombia", "not roaster X" explain nothing about the coffee itself either.
    const isNot = (d: { f: Feature; delta: number }) => d.delta < 0 && /^(country|roaster|variety):/.test(d.f.id)
    const shown = contrib.filter((d) => !d.f.hidden && d.f.group !== 'brew' && (d.f.known?.(c) ?? true) && !(d.f.group === 'flavor' && c.flavorsEstimated) && !isNot(d))
    for (const c of shown.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 4)) {
      if (Math.abs(c.impact) >= 0.08 && reasons.length < 4) reasons.push({ id: c.f.id, up: c.delta > 0, impact: c.impact })
    }
  }

  // A coffee rated with both methods is listed once, by its closer rating.
  const sims = model.rated
    .map((r) => ({ coffee: r.coffee, ...similarity(model.flavor, x, c, r, model.sigma2) }))
    .filter((r) => !bagIsThin(r.coffee) || r.kin)
    .map(({ coffee, sim }) => ({ coffee, similarity: sim }))
    .sort((a, b) => b.similarity - a.similarity)
    .filter((s, i, all) => all.findIndex((o) => o.coffee === s.coffee) === i)
  // A guessed profile (no tasting notes, or only drink associations) makes for a less certain prediction.
  // So does a bag that says little: confidence grows with what it states (see bagFacts()).
  const strength = Math.min(1, model.rated.length / 15) * Math.min(1, wSum / 1.2) * (c.flavorsEstimated ? 0.6 : 1) * Math.min(1, facts / 4)
  const confidence = strength > 0.55 ? 'high' : strength > 0.25 ? 'medium' : 'low'
  const final = clampScore(score)

  let byBrew: Prediction['byBrew']
  if (model.brewCounts.v60 >= MIN_RATED_FOR_FACTOR && model.brewCounts.aeropress >= MIN_RATED_FOR_FACTOR) {
    const other: Brew = brew === 'v60' ? 'aeropress' : 'v60'
    const otherScore = clampScore(scoreFor(model, vec(model.features, model.params, model.fills, { ...c, brewedWith: other }), c).score)
    byBrew = { [brew]: final, [other]: otherScore } as Record<Brew, number>
  }

  return {
    score: final,
    confidence,
    tone: toneFor(final),
    reasons,
    similar: sims.filter((s) => s.similarity > 0.15 && s.coffee.id !== excludeId).slice(0, 3),
    brew,
    byBrew,
  }
}

export interface Taste {
  likes: Reason[]
  dislikes: Reason[]
}

/** Strongest ridge weights, read as "what moves your ratings". */
export function tasteSummary(model: Model): Taste | null {
  if (!model.beta) return null
  const items = model.features.map((f, j) => ({ f, w: model.beta![j] * Math.sqrt(f.weight * model.params.mult[f.group]) }))
    // Roasters still steer predictions, but "you like roaster X" says nothing about taste.
    .filter((i) => !i.f.hidden && i.f.group !== 'roaster' && Math.abs(i.w) >= 0.1)
    .sort((a, b) => b.w - a.w)
  return {
    likes: items.filter((i) => i.w > 0).slice(0, 5).map((i) => ({ id: i.f.id, up: true, impact: i.w })),
    dislikes: items.filter((i) => i.w < 0).reverse().slice(0, 4).map((i) => ({ id: i.f.id, up: true, impact: i.w })),
  }
}
