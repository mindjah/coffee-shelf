// Names for short map links, found by Gemini (see placeFromLink) and remembered on this device so
// the same link is never looked up twice.
import { getSettings } from './settings'

const KEY = 'coffee-shelf.placeNames'
/** Link → place name, or '' when the page opened but showed no place. */
let cache: Record<string, string> = load()
const inFlight = new Map<string, Promise<string | null>>()

function load(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

/** Needs a Gemini key: Gemini is what opens the link (also when another provider reads bags). */
export const canFindPlaces = () => !!getSettings().geminiKey

/** The place's name, or null when it can't be found; a network or quota error is tried again next time. */
export function findPlace(link: string): Promise<string | null> {
  if (link in cache) return Promise.resolve(cache[link] || null)
  let pending = inFlight.get(link)
  if (!pending) {
    pending = import('./gemini')
      .then((m) => m.placeFromLink(link))
      .then((name) => {
        cache = { ...cache, [link]: name ?? '' }
        try {
          localStorage.setItem(KEY, JSON.stringify(cache))
        } catch {
          // Looked up again next launch.
        }
        return name
      })
      .catch(() => null)
      .finally(() => inFlight.delete(link))
    inFlight.set(link, pending)
  }
  return pending
}
