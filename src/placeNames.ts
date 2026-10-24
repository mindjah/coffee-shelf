// Names for short map links in your notes ("maps.app.goo.gl/…" doesn't say which place). Gemini
// finds them (see placeFromLink) in the background, straight into the saved notes, so you can paste
// a link, save and leave. Results are remembered on this device.
import { useSyncExternalStore } from 'react'
import { db } from './db'
import { linkInfo, URL_IN_TEXT } from './links'
import { GEMINI_MODELS, getSettings } from './settings'
import type { Coffee } from './types'

const KEY = 'coffee-shelf.placeLookups'
/** Pauses before trying again after a busy server, a network hiccup or an unopened page. */
const RETRY_DELAYS_MS = [3_000, 8_000]
/** A request that hasn't answered by then is dropped and counts as a failed try. */
const ATTEMPT_TIMEOUT_MS = 20_000

interface Lookup {
  name?: string
  /** Why Gemini couldn't name it (kept for troubleshooting). */
  reason?: string
  at: number
}

/** Link → what the last lookup found. */
let cache: Record<string, Lookup> = load()
/** When the app opened: a lookup that failed before this is tried again (each launch). */
const launchedAt = Date.now()
/** Links being looked up now (shown as "Finding the place…"). */
let pending = new Set<string>()
const listeners = new Set<() => void>()

function load(): Record<string, Lookup> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

function remember(href: string, lookup: Lookup) {
  cache = { ...cache, [href]: lookup }
  try {
    localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    // Looked up again next launch.
  }
}

function setPending(next: Set<string>) {
  pending = next
  listeners.forEach((l) => l())
}

/** Needs a Gemini key: Gemini is what opens the link (also when another provider reads bags). */
export const canFindPlaces = () => !!getSettings().geminiKey

const recentFailure = (href: string) => !!cache[href]?.reason && cache[href].at >= launchedAt

/** Gemini can't name this link: no key to ask with, or it tried since the app opened and couldn't. */
export const placeNotFound = (href: string) => !canFindPlaces() || recentFailure(href)

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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** A request the model can't serve at all (e.g. the link tool unsupported): no point asking it again. */
const refused = (message: string) => /\b(400|403|404)\b|INVALID_ARGUMENT|unsupported|not found/i.test(message)

/**
 * Asks Gemini like a bag scan does, model after model (the lighter one first).
 * Each model gets a retry after a pause when the server was busy, the network dropped or the page
 * didn't open (these often pass); a model refusing the request moves on at once, and a page that
 * opened without a place isn't asked about again.
 */
async function lookUp(href: string): Promise<string | null> {
  if (cache[href]?.name) return cache[href].name!
  setPending(new Set(pending).add(href))
  // Lighter models first: reading a name off a page needs no more, and they answer faster with
  // more free quota. The bigger one stands in when they can't. (Bag scans keep the Settings model.)
  const models = GEMINI_MODELS.map((m) => m.id).sort((a, b) => Number(b.includes('lite')) - Number(a.includes('lite')))
  const reasons: string[] = []
  try {
    const { placeFromLink } = await import('./gemini')
    for (const model of models) {
      let reason = ''
      for (let attempt = 0; ; attempt++) {
        const ac = new AbortController()
        const timer = setTimeout(() => ac.abort(new Error('timed out')), ATTEMPT_TIMEOUT_MS)
        try {
          const found = await Promise.race([
            placeFromLink(href, model, ac.signal),
            // Settles even if the request ignores the abort.
            new Promise<never>((_, reject) => ac.signal.addEventListener('abort', () => reject(ac.signal.reason), { once: true })),
          ])
          if (found.name) {
            remember(href, { name: found.name, at: Date.now() })
            return found.name
          }
          reason = found.reason ?? 'unknown'
          if (reason.startsWith('no place') || reason.startsWith('no Gemini')) {
            remember(href, { reason: `${model}: ${reason}`, at: Date.now() })
            return null
          }
        } catch (e) {
          reason = (e as Error)?.message?.slice(0, 160) || 'request failed'
          // Refused, or no answer at all: waiting on this model again won't help, try the other.
          if (refused(reason) || ac.signal.aborted) break
        } finally {
          clearTimeout(timer)
        }
        if (attempt >= RETRY_DELAYS_MS.length) break
        await wait(RETRY_DELAYS_MS[attempt])
      }
      reasons.push(`${model}: ${reason}`)
    }
    remember(href, { reason: reasons.join('; '), at: Date.now() })
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
      if (pending.has(href) || recentFailure(href)) continue
      lookUp(href).then(async (name) => {
        if (!name || c.id == null) return
        const fresh = await db.coffees.get(c.id)
        if (fresh?.comment.includes(raw)) await db.coffees.update(c.id, { comment: withPlaceName(fresh.comment, raw, name) })
      })
    }
  }
}
