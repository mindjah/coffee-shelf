import Dexie, { type EntityTable, type Table } from 'dexie'
import type { Coffee, CoffeeDraft } from './types'
import { blobToBase64 } from './image'

/** The scan not yet saved to the shelf, kept so it survives iOS closing the app. */
export interface PendingScan {
  /** JPEG bytes; ArrayBuffer because WebKit can refuse Blobs in IndexedDB. */
  shots: ArrayBuffer[]
  draft?: CoffeeDraft
  rating: number | null
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

export const db = new Dexie('coffee-shelf') as Dexie & {
  coffees: EntityTable<Coffee, 'id'>
  pending: Table<PendingScan, string>
  compare: EntityTable<CompareItem, 'id'>
}

db.version(3).stores({ coffees: '++id, createdAt, rating, roaster', pending: '', compare: '++id, addedAt' })

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
  return new Blob([JSON.stringify({ app: 'coffee-shelf', version: 1, coffees: rows })], { type: 'application/json' })
}

export async function importBackup(file: File): Promise<number> {
  const data = JSON.parse(await file.text())
  if (data?.app !== 'coffee-shelf' || !Array.isArray(data.coffees)) throw new Error('notBackup')
  const rows: Coffee[] = await Promise.all(
    data.coffees.map(async ({ id: _id, photo, ...c }: Coffee & { photo: string | null }) => ({
      ...c,
      photo: photo ? await (await fetch(photo)).arrayBuffer() : undefined,
    })),
  )
  await db.transaction('rw', db.coffees, async () => {
    await db.coffees.clear()
    await db.coffees.bulkAdd(rows)
  })
  return rows.length
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
