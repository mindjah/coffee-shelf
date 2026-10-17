import { FLAVORS, type Brew, type Coffee, type CoffeeDraft, type Region } from './types'
import { brewMethod } from './brew'
import { sameRoaster } from './roaster'
import { normalize } from './lexicon'

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
}

const ROAST_VALUE = { light: 0, 'medium-light': 0.25, medium: 0.5, 'medium-dark': 0.75, dark: 1, unknown: 0.35 }
const scale = (v: number | null) => (v == null ? 0.5 : (v - 1) / 4)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

const BASE_FEATURES: Feature[] = [
  ...FLAVORS.map((f) => ({
    id: f,
    group: 'flavor' as const,
    weight: 1,
    get: (c: CoffeeDraft) => c.flavors[f] ?? 0,
  })),
  ...(['washed', 'natural', 'honey', 'anaerobic'] as const).map((p) => ({
    id: p,
    group: 'process' as const,
    weight: 0.8,
    get: (c: CoffeeDraft) => (c.process === p ? 1 : 0),
  })),
  // Lets a bag from a country you haven't rated still match its neighbours (Burundi ~ Kenya).
  ...(['east-africa', 'other-africa', 'central-america', 'south-america', 'asia-pacific'] as Region[]).map((r) => ({
    id: r,
    group: 'origin' as const,
    weight: 0.3,
    get: (c: CoffeeDraft) => (c.region === r ? 1 : 0),
    hidden: true,
  })),
  // Printed on the bag or estimated from it.
  { id: 'espresso', group: 'roast', weight: 0.4, get: (c) => (brewMethod(c)?.method === 'espresso' ? 1 : 0) },
  { id: 'roast', group: 'roast', weight: 1, get: (c) => ROAST_VALUE[c.roast] },
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
    })),
    ...[...roasters.keys()].map((name) => ({
      id: `roaster:${name}`,
      group: 'roaster' as const,
      weight: 0.6,
      get: (c: CoffeeDraft) => (sameRoaster(name, c.roaster) ? 1 : 0),
    })),
    ...[...varieties].map(([key, name]) => ({
      id: `variety:${name}`,
      group: 'variety' as const,
      weight: 0.5,
      get: (c: CoffeeDraft) => (c.varieties.some((v) => varietyKey(v) === key) ? 1 : 0),
    })),
  ]
}

const vec = (features: Feature[], params: Params, c: CoffeeDraft) =>
  features.map((f) => f.get(c) * Math.sqrt(f.weight * params.mult[f.group]))

function dist2(a: number[], b: number[]) {
  let s = 0
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2
  return s
}

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

function sums(xs: number[][], ys: number[]): Sums {
  const d = xs[0]?.length ?? 0
  const s: Sums = { n: 0, sy: 0, sx: new Array(d).fill(0), sxx: Array.from({ length: d }, () => new Array(d).fill(0)), sxy: new Array(d).fill(0) }
  xs.forEach((x, k) => {
    s.n++
    s.sy += ys[k]
    for (let i = 0; i < d; i++) {
      s.sx[i] += x[i]
      s.sxy[i] += x[i] * ys[k]
      for (let j = 0; j < d; j++) s.sxx[i][j] += x[i] * x[j]
    }
  })
  return s
}

/** Ridge fit on centred data; `without` leaves one coffee out. */
function ridge(s: Sums, lambda: number, without?: { x: number[]; y: number }) {
  const d = s.sx.length
  const n = s.n - (without ? 1 : 0)
  const wx = without?.x
  const wy = without?.y ?? 0
  const featureMean = s.sx.map((v, i) => (v - (wx ? wx[i] : 0)) / n)
  const mean = (s.sy - wy) / n
  const A = Array.from({ length: d }, (_, i) =>
    Array.from({ length: d }, (_, j) => s.sxx[i][j] - (wx ? wx[i] * wx[j] : 0) - n * featureMean[i] * featureMean[j] + (i === j ? lambda : 0)))
  const b = s.sxy.map((v, i) => v - (wx ? wx[i] * wy : 0) - n * featureMean[i] * mean)
  return { beta: solve(A, b), featureMean, mean }
}

/** Kernel width from the typical distance between your coffees, so it adapts as the library grows. */
function kernelWidth(xs: number[][]) {
  const ds: number[] = []
  for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) ds.push(dist2(xs[i], xs[j]))
  ds.sort((a, b) => a - b)
  return Math.max(0.15, (ds[Math.floor(ds.length / 2)] ?? 1) * 0.5)
}

function knn(x: number[], pool: { x: number[]; y: number }[], mean: number, sigma2: number) {
  const sims = pool.map((r) => ({ r, s: Math.exp(-dist2(x, r.x) / (2 * sigma2)) })).sort((a, b) => b.s - a.s).slice(0, 7)
  const wSum = sims.reduce((s, t) => s + t.s, 0)
  return { score: mean + sims.reduce((s, t) => s + t.s * (t.r.y - mean), 0) / (wSum + 0.5), wSum }
}

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
  params: Params
  count: number
  mean: number
  rated: { coffee: Coffee; x: number[] }[]
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
  const rated = ratedCoffees.map((coffee) => ({ coffee, x: vec(features, params, coffee) }))
  const n = rated.length
  const mean = n ? rated.reduce((s, r) => s + r.coffee.rating!, 0) / n : 3
  const fit = n >= RIDGE_FROM ? ridge(sums(rated.map((r) => r.x), rated.map((r) => r.coffee.rating!)), params.lambda) : null
  return {
    features,
    params,
    count: n,
    mean,
    rated,
    sigma2: kernelWidth(rated.map((r) => r.x)),
    featureMean: fit?.featureMean ?? new Array(features.length).fill(0),
    beta: fit?.beta ?? null,
    brewCounts: {
      v60: ratedCoffees.filter((c) => c.brewedWith === 'v60').length,
      aeropress: ratedCoffees.filter((c) => c.brewedWith === 'aeropress').length,
    },
    accuracy,
  }
}

// --- testing & tuning ----------------------------------------------------------

/** Each rated coffee predicted from all the others, compared with your real rating. */
export function evaluate(ratedCoffees: Coffee[], params: Params): Omit<Accuracy, 'tuned'> | null {
  const n = ratedCoffees.length
  if (n < MIN_RATINGS + 1) return null
  const features = [...BASE_FEATURES, ...extraFeatures(ratedCoffees)]
  const xs = ratedCoffees.map((c) => vec(features, params, c))
  const ys = ratedCoffees.map((c) => c.rating!)
  const all = sums(xs, ys)
  const sigma2 = kernelWidth(xs)
  const pool = xs.map((x, i) => ({ x, y: ys[i] }))
  let miss = 0
  let close = 0
  let baseline = 0
  for (let i = 0; i < n; i++) {
    const others = pool.filter((_, j) => j !== i)
    const mean = (all.sy - ys[i]) / (n - 1)
    let score = knn(xs[i], others, mean, sigma2).score
    if (n - 1 >= RIDGE_FROM && params.blend > 0) {
      const fit = ridge(all, params.lambda, { x: xs[i], y: ys[i] })
      const r = fit.mean + fit.beta.reduce((s, b, j) => s + b * (xs[i][j] - fit.featureMean[j]), 0)
      score = (1 - params.blend) * score + params.blend * r
    }
    score = Math.min(5, Math.max(1, score))
    miss += Math.abs(score - ys[i])
    if (Math.abs(score - ys[i]) <= 0.5) close++
    baseline += Math.abs(mean - ys[i])
  }
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

function scoreFor(model: Model, x: number[]) {
  const pool = model.rated.map((r) => ({ x: r.x, y: r.coffee.rating! }))
  const k = knn(x, pool, model.mean, model.sigma2)
  if (!model.beta) return { score: k.score, wSum: k.wSum, contrib: null }
  const contrib = model.features.map((f, j) => ({ f, delta: x[j] - model.featureMean[j], impact: model.beta![j] * (x[j] - model.featureMean[j]) }))
  const r = model.mean + contrib.reduce((s, c) => s + c.impact, 0)
  return { score: (1 - model.params.blend) * k.score + model.params.blend * r, wSum: k.wSum, contrib }
}

const clampScore = (s: number) => Math.min(5, Math.max(1, s))

/** Predicted rating for a coffee brewed with `brew` (your usual method). */
export function predict(model: Model, c: CoffeeDraft, brew: Brew = 'v60'): Prediction | null {
  if (model.count < MIN_RATINGS) return null
  const x = vec(model.features, model.params, { ...c, brewedWith: brew })
  const { score, wSum, contrib } = scoreFor(model, x)

  const reasons: Reason[] = []
  if (contrib) {
    // The brew method is your choice, not the coffee's, so it isn't given as a reason.
    const shown = contrib.filter((c) => !c.f.hidden && c.f.group !== 'brew')
    for (const c of shown.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 4)) {
      if (Math.abs(c.impact) >= 0.08) reasons.push({ id: c.f.id, up: c.delta > 0, impact: c.impact })
    }
  }

  const sims = model.rated
    .map((r) => ({ coffee: r.coffee, similarity: Math.exp(-dist2(x, r.x) / (2 * model.sigma2)) }))
    .sort((a, b) => b.similarity - a.similarity)
  const strength = Math.min(1, model.count / 15) * Math.min(1, wSum / 1.2)
  const confidence = strength > 0.55 ? 'high' : strength > 0.25 ? 'medium' : 'low'
  const final = clampScore(score)

  let byBrew: Prediction['byBrew']
  if (model.brewCounts.v60 >= MIN_RATED_FOR_FACTOR && model.brewCounts.aeropress >= MIN_RATED_FOR_FACTOR) {
    const other: Brew = brew === 'v60' ? 'aeropress' : 'v60'
    const otherScore = clampScore(scoreFor(model, vec(model.features, model.params, { ...c, brewedWith: other })).score)
    byBrew = { [brew]: final, [other]: otherScore } as Record<Brew, number>
  }

  return {
    score: final,
    confidence,
    tone: toneFor(final),
    reasons,
    similar: sims.filter((s) => s.similarity > 0.15).slice(0, 3),
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
    .filter((i) => !i.f.hidden && Math.abs(i.w) >= 0.1)
    .sort((a, b) => b.w - a.w)
  return {
    likes: items.filter((i) => i.w > 0).slice(0, 5).map((i) => ({ id: i.f.id, up: true, impact: i.w })),
    dislikes: items.filter((i) => i.w < 0).reverse().slice(0, 4).map((i) => ({ id: i.f.id, up: true, impact: i.w })),
  }
}
