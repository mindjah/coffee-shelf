import Dexie, { type EntityTable, type Table } from 'dexie'
import type { Coffee, CoffeeDraft } from './types'
import { blobToBase64 } from './image'

/** The scan not yet saved to the shelf, kept so it survives iOS closing the app. */
export interface PendingScan {
  /** JPEG bytes; ArrayBuffer because WebKit can refuse Blobs in IndexedDB. */
  shots: ArrayBuffer[]
  draft?: CoffeeDraft
  rating: number | null
  /** Per-method ratings given on the scan screen (see ratings.ts). */
  ratings?: Coffee['ratings']
  brewedWith?: Coffee['brewedWith']
  comment: string
}

/** A bag held for side-by-side comparison: freshly scanned, or a coffee already on the shelf. */
export interface CompareItem {
  id?: number
  addedAt: number
  /** Snapshot of the bag; for shelf coffees the live shelf entry is shown when it still exists. */
  draft: CoffeeDraft
  /** Set when the item is a coffee from the shelf. */
  coffeeId?: number
}

export const MAX_COMPARE = 6

/** One step of your own brew recipe; `seconds` null is a step you finish at your own pace. */
export interface RecipeStep {
  text: string
  seconds: number | null
}

/** A brew recipe you wrote yourself, shown with the encyclopedia's brew methods. */
export interface Recipe {
  id?: number
  createdAt: number
  name: string
  note: string
  /** Grams of coffee and water, water °C. */
  coffee: number | null
  water: number | null
  temp: number | null
  grind: string
  steps: RecipeStep[]
}

export const db = new Dexie('coffee-shelf') as Dexie & {
  coffees: EntityTable<Coffee, 'id'>
  pending: Table<PendingScan, string>
  compare: EntityTable<CompareItem, 'id'>
  recipes: EntityTable<Recipe, 'id'>
}

db.version(3).stores({ coffees: '++id, createdAt, rating, roaster', pending: '', compare: '++id, addedAt' })
db.version(4).stores({ recipes: '++id, createdAt' })

const PENDING_KEY = 'scan'
export const loadPendingScan = () => db.pending.get(PENDING_KEY)
export const savePendingScan = (scan: PendingScan) => db.pending.put(scan, PENDING_KEY)
export const clearPendingScan = () => db.pending.delete(PENDING_KEY)

/** Asks Safari not to evict our data under storage pressure. */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (await navigator.storage?.persisted?.()) return true
    return (await navigator.storage?.persist?.()) ?? false
  } catch {
    return false
  }
}


export async function exportBackup(): Promise<Blob> {
  const all = await db.coffees.toArray()
  const rows = await Promise.all(
    all.map(async ({ photo, ...c }) => ({ ...c, photo: photo ? `data:image/jpeg;base64,${await blobToBase64(new Blob([photo]))}` : null })),
  )
  const recipes = await db.recipes.toArray()
  return new Blob([JSON.stringify({ app: 'coffee-shelf', version: 1, coffees: rows, recipes })], { type: 'application/json' })
}

/** Your recipes in a backup; undefined for backups made before recipes existed. */
async function readRecipes(file: Blob): Promise<Recipe[] | undefined> {
  const data = JSON.parse(await file.text())
  return Array.isArray(data?.recipes) ? data.recipes.map(({ id: _id, ...r }: Recipe) => r) : undefined
}

async function readBackup(file: Blob): Promise<Coffee[]> {
  const data = JSON.parse(await file.text())
  if (data?.app !== 'coffee-shelf' || !Array.isArray(data.coffees)) throw new Error('notBackup')
  return Promise.all(
    data.coffees.map(async ({ id: _id, photo, ...c }: Coffee & { photo: string | null }) => ({
      ...c,
      photo: photo ? await (await fetch(photo)).arrayBuffer() : undefined,
    })),
  )
}

/** Replaces the whole shelf with a backup. */
export async function importBackup(file: Blob): Promise<number> {
  const rows = await readBackup(file)
  const recipes = await readRecipes(file)
  await db.transaction('rw', db.coffees, db.recipes, async () => {
    await db.coffees.clear()
    await db.coffees.bulkAdd(rows)
    // An older backup has no recipes: keep the ones on this device rather than wiping them.
    if (recipes) {
      await db.recipes.clear()
      await db.recipes.bulkAdd(recipes)
    }
  })
  return rows.length
}

const coffeeKey = (c: Pick<Coffee, 'roaster' | 'name'>) => `${c.roaster}|${c.name}`.toLowerCase().replace(/\s+/g, ' ').trim()

/** Adds coffees from a file to the shelf, skipping ones already there (same roaster and name). */
export async function mergeBackup(file: Blob): Promise<{ added: number; skipped: number }> {
  const rows = await readBackup(file)
  const recipes = (await readRecipes(file)) ?? []
  return db.transaction('rw', db.coffees, db.recipes, async () => {
    const existing = new Set((await db.coffees.toArray()).map(coffeeKey))
    const fresh = rows.filter((c) => !existing.has(coffeeKey(c)))
    await db.coffees.bulkAdd(fresh)
    const names = new Set((await db.recipes.toArray()).map((r) => r.name.trim().toLowerCase()))
    await db.recipes.bulkAdd(recipes.filter((r) => !names.has(r.name.trim().toLowerCase())))
    return { added: fresh.length, skipped: rows.length - fresh.length }
  })
}

export type AddResult = 'added' | 'full' | 'duplicate'

/** Puts a shelf coffee into the comparison next to scanned bags. */
export async function addShelfToCompare(coffee: Coffee): Promise<AddResult> {
  const items = await db.compare.toArray()
  if (items.some((i) => i.coffeeId === coffee.id)) return 'duplicate'
  if (items.length >= MAX_COMPARE) return 'full'
  const { id, createdAt: _c, rating: _r, ratedAt: _ra, comment: _co, ...draft } = coffee
  await db.compare.add({ addedAt: Date.now(), draft, coffeeId: id })
  return 'added'
}

// --- change tracking (drives automatic Google Drive backup) ------------------

const LAST_CHANGE_KEY = 'coffee-shelf.lastChange'
const changeListeners = new Set<() => void>()

export function lastChange(): number {
  try {
    return Number(localStorage.getItem(LAST_CHANGE_KEY)) || 0
  } catch {
    return 0
  }
}

export function onShelfChange(listener: () => void): () => void {
  changeListeners.add(listener)
  return () => void changeListeners.delete(listener)
}

function markChanged() {
  try {
    localStorage.setItem(LAST_CHANGE_KEY, String(Date.now()))
  } catch {
    // Without storage, automatic backup just won't notice this change.
  }
  // After the transaction settles, so a backup reads the new data.
  setTimeout(() => changeListeners.forEach((l) => l()), 0)
}

db.coffees.hook('creating', markChanged)
db.coffees.hook('updating', markChanged)
db.coffees.hook('deleting', markChanged)
db.recipes.hook('creating', markChanged)
db.recipes.hook('updating', markChanged)
db.recipes.hook('deleting', markChanged)
