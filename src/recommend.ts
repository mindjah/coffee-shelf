import { FLAVORS, type Coffee, type CoffeeDraft, type Region } from './types'

/**
 * Content-based recommender sized for a personal journal (tens of ratings):
 * - kNN: similarity-weighted average of your ratings for coffees close in feature space,
 *   shrunk toward your mean rating when nothing similar has been rated yet.
 * - Ridge regression over the same features, used both as a second opinion and to explain
 *   which traits push a prediction up or down.
 */

type Kind = 'presence' | 'roast' | 'acidity' | 'body' | 'sweetness' | 'altitude'
interface Feature {
  /** Key into the i18n `reasons` table. */
  id: string
  kind: Kind
  weight: number
  get: (c: CoffeeDraft) => number
}

const ROAST_VALUE = { light: 0, 'medium-light': 0.25, medium: 0.5, 'medium-dark': 0.75, dark: 1, unknown: 0.35 }
const scale = (v: number | null) => (v == null ? 0.5 : (v - 1) / 4)

const FEATURES: Feature[] = [
  ...FLAVORS.map((f) => ({
    id: f,
    kind: 'presence' as const,
    weight: 1,
    get: (c: CoffeeDraft) => c.flavors[f] ?? 0,
  })),
  ...(['washed', 'natural', 'honey', 'anaerobic'] as const).map((p) => ({
    id: p,
    kind: 'presence' as const,
    weight: 0.8,
    get: (c: CoffeeDraft) => (c.process === p ? 1 : 0),
  })),
  ...(['east-africa', 'other-africa', 'central-america', 'south-america', 'asia-pacific'] as Region[]).map((r) => ({
    id: r,
    kind: 'presence' as const,
    weight: 0.6,
    get: (c: CoffeeDraft) => (c.region === r ? 1 : 0),
  })),
  { id: 'espresso', kind: 'presence', weight: 0.4, get: (c) => (c.roastFor === 'espresso' ? 1 : 0) },
  { id: 'roast', kind: 'roast', weight: 1, get: (c) => ROAST_VALUE[c.roast] },
  { id: 'acidity', kind: 'acidity', weight: 0.7, get: (c) => scale(c.structure.acidity) },
  { id: 'body', kind: 'body', weight: 0.7, get: (c) => scale(c.structure.body) },
  { id: 'sweetness', kind: 'sweetness', weight: 0.5, get: (c) => scale(c.structure.sweetness) },
  {
    id: 'altitude',
    kind: 'altitude',
    weight: 0.3,
    get: (c) => (c.altitude == null ? 0.5 : Math.min(1, Math.max(0, (c.altitude - 1000) / 1400))),
  },
]

const vec = (c: CoffeeDraft) => FEATURES.map((f) => f.get(c) * Math.sqrt(f.weight))

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

export interface Model {
  count: number
  mean: number
  rated: { coffee: Coffee; x: number[] }[]
  sigma2: number
  featureMean: number[]
  beta: number[] | null
}

export const MIN_RATINGS = 3
const RIDGE_FROM = 6

export function buildModel(all: Coffee[]): Model {
  const ratedCoffees = all.filter((c) => c.rating != null)
  const rated = ratedCoffees.map((coffee) => ({ coffee, x: vec(coffee) }))
  const n = rated.length
  const mean = n ? rated.reduce((s, r) => s + r.coffee.rating!, 0) / n : 3
  const d = FEATURES.length
  const featureMean = new Array(d).fill(0)
  for (const r of rated) r.x.forEach((v, j) => (featureMean[j] += v / n))

  // Kernel width from the typical distance between your coffees, so it adapts as the library grows.
  const ds: number[] = []
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) ds.push(dist2(rated[i].x, rated[j].x))
  ds.sort((a, b) => a - b)
  const sigma2 = Math.max(0.15, (ds[Math.floor(ds.length / 2)] ?? 1) * 0.5)

  let beta: number[] | null = null
  if (n >= RIDGE_FROM) {
    const lambda = 1.5
    const A = Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => (i === j ? lambda : 0)))
    const b = new Array(d).fill(0)
    for (const r of rated) {
      const xc = r.x.map((v, j) => v - featureMean[j])
      const y = r.coffee.rating! - mean
      for (let i = 0; i < d; i++) {
        b[i] += xc[i] * y
        for (let j = 0; j < d; j++) A[i][j] += xc[i] * xc[j]
      }
    }
    beta = solve(A, b)
  }
  return { count: n, mean, rated, sigma2, featureMean, beta }
}

export interface Reason {
  id: string
  /** Present (or higher) rather than absent (or lower) on this coffee. */
  up: boolean
  impact: number
}

export interface Prediction {
  score: number
  confidence: 'low' | 'medium' | 'high'
  tone: 'love' | 'like' | 'maybe' | 'pass'
  reasons: Reason[]
  similar: { coffee: Coffee; similarity: number }[]
}


export function predict(model: Model, c: CoffeeDraft, excludeId?: number): Prediction | null {
  const pool = model.rated.filter((r) => r.coffee.id !== excludeId)
  if (pool.length < MIN_RATINGS) return null
  const mean = pool.reduce((s, r) => s + r.coffee.rating!, 0) / pool.length
  const x = vec(c)

  const sims = pool
    .map((r) => ({ coffee: r.coffee, similarity: Math.exp(-dist2(x, r.x) / (2 * model.sigma2)) }))
    .sort((a, b) => b.similarity - a.similarity)
  const top = sims.slice(0, 7)
  const wSum = top.reduce((s, t) => s + t.similarity, 0)
  const knn = mean + top.reduce((s, t) => s + t.similarity * (t.coffee.rating! - mean), 0) / (wSum + 0.5)

  let score = knn
  const reasons: Reason[] = []
  if (model.beta && excludeId == null) {
    const contrib = FEATURES.map((f, j) => ({ f, delta: x[j] - model.featureMean[j], impact: model.beta![j] * (x[j] - model.featureMean[j]) }))
    const ridge = model.mean + contrib.reduce((s, c) => s + c.impact, 0)
    score = 0.5 * knn + 0.5 * ridge
    for (const c of contrib.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 4)) {
      if (Math.abs(c.impact) >= 0.08) reasons.push({ id: c.f.id, up: c.delta > 0, impact: c.impact })
    }
  }
  score = Math.min(5, Math.max(1, score))

  const strength = Math.min(1, pool.length / 15) * Math.min(1, wSum / 1.2)
  const confidence = strength > 0.55 ? 'high' : strength > 0.25 ? 'medium' : 'low'
  const tone = score >= 4.2 ? 'love' : score >= 3.6 ? 'like' : score >= 2.9 ? 'maybe' : 'pass'

  return {
    score,
    confidence,
    tone,
    reasons,
    similar: sims.filter((s) => s.similarity > 0.15).slice(0, 3),
  }
}

export interface Taste {
  likes: Reason[]
  dislikes: Reason[]
}

/** Strongest ridge weights, read as "what moves your ratings". */
export function tasteSummary(model: Model): Taste | null {
  if (!model.beta) return null
  const items = FEATURES.map((f, j) => ({ f, w: model.beta![j] * Math.sqrt(f.weight) }))
    .filter((i) => Math.abs(i.w) >= 0.1)
    .sort((a, b) => b.w - a.w)
  return {
    likes: items.filter((i) => i.w > 0).slice(0, 5).map((i) => ({ id: i.f.id, up: true, impact: i.w })),
    dislikes: items.filter((i) => i.w < 0).reverse().slice(0, 4).map((i) => ({ id: i.f.id, up: true, impact: i.w })),
  }
}
