import Dexie, { type EntityTable } from 'dexie'
import type { Coffee } from './types'
import { blobToBase64 } from './image'

export const db = new Dexie('coffee-shelf') as Dexie & { coffees: EntityTable<Coffee, 'id'> }

db.version(1).stores({ coffees: '++id, createdAt, rating, roaster' })

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
