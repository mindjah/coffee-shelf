// Names for short map links in your notes ("maps.app.goo.gl/…" doesn't say which place). Gemini
// finds them (see placeFromLink) in the background, straight into the saved notes, so you can paste
// a link, save and leave. Results are remembered on this device; a link is never looked up twice.
import { useSyncExternalStore } from 'react'
import { db } from './db'
import { linkInfo, URL_IN_TEXT } from './links'
import { getSettings } from './settings'
import type { Coffee } from './types'

const KEY = 'coffee-shelf.placeNames'
/** Link → place name, or '' when the page opened but showed no place. */
let cache: Record<string, string> = load()
/** Links being looked up now (shown as "Finding the place…"). */
let pending = new Set<string>()
/** Lookups that failed for another reason (offline, busy): tried again next launch, not on every change. */
const failed = new Set<string>()
const listeners = new Set<() => void>()

function load(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

function setPending(next: Set<string>) {
  pending = next
  listeners.forEach((l) => l())
}

/** Needs a Gemini key: Gemini is what opens the link (also when another provider reads bags). */
export const canFindPlaces = () => !!getSettings().geminiKey

/** Links being looked up right now. */
export function usePendingPlaces(): Set<string> {
  return useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => pending)
}

/** Map links in a note that don't say which place, by their address. */
export function unnamedMapLinks(text: string): string[] {
  return [...text.matchAll(URL_IN_TEXT)].filter((m) => !m[2] && linkInfo(m[0]).map && !linkInfo(m[0]).named).map((m) => m[0])
}

/** "[name](link)" in place of the bare link: it keeps working and reads by its name. */
export const withPlaceName = (text: string, raw: string, name: string) =>
  text.replace(raw, `[${name.replace(/[[\]]/g, '')}](${linkInfo(raw).href})`)

async function lookUp(href: string): Promise<string | null> {
  if (href in cache) return cache[href] || null
  setPending(new Set(pending).add(href))
  try {
    const { placeFromLink } = await import('./gemini')
    const name = await placeFromLink(href)
    cache = { ...cache, [href]: name ?? '' }
    try {
      localStorage.setItem(KEY, JSON.stringify(cache))
    } catch {
      // Looked up again next launch.
    }
    return name
  } catch {
    failed.add(href)
    return null
  } finally {
    const next = new Set(pending)
    next.delete(href)
    setPending(next)
  }
}

/**
 * Names every unnamed map link in the shelf's notes, writing the name into the saved note when it
 * arrives — read fresh from the database then, so an edit made meanwhile isn't overwritten.
 */
export function nameMapLinks(coffees: Coffee[]) {
  if (!canFindPlaces()) return
  for (const c of coffees) {
    for (const raw of unnamedMapLinks(c.comment)) {
      const href = linkInfo(raw).href
      if (pending.has(href) || failed.has(href) || cache[href] === '') continue
      lookUp(href).then(async (name) => {
        if (!name || c.id == null) return
        const fresh = await db.coffees.get(c.id)
        if (fresh?.comment.includes(raw)) await db.coffees.update(c.id, { comment: withPlaceName(fresh.comment, raw, name) })
      })
    }
  }
}
