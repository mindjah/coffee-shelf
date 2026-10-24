// Web addresses in your notes, shown by what they are rather than as raw URLs: a Google Maps
// place by its name, an Instagram account by its handle, any other site by its own name.

/**
 * Addresses in free text: with http(s), with www., or a bare domain in a common zone
 * ("friedhats.com", "onyx.coffee/shop"), but not the domain of an e-mail address; a trailing full
 * stop or bracket isn't part of it.
 */
export const URL_IN_TEXT = /\bhttps?:\/\/[^\s<>"]+[^\s<>".,;:!?)»”]|\bwww\.[^\s<>"]+[^\s<>".,;:!?)»”]|(?<![@\w.-])(?:[a-z0-9-]+\.)+(?:com|net|org|coffee|shop|store|cafe|co|io|me|app|gl|rs|ru|ua|by|kz|ge|de|nl|uk|dk|se|no|fi|es|it|fr|pl|cz|eu)(?:\/[^\s<>"]*[^\s<>".,;:!?)»”])?(?![\w@])/gi

export interface LinkInfo {
  href: string
  label: string
  /** A place on a map, shown with a pin. */
  map: boolean
}

/** Second-level domain labels that are really part of the suffix ("co.uk", "com.au"). */
const SUFFIX_LABELS = new Set(['co', 'com', 'org', 'net', 'gov', 'ac', 'edu'])

const words = (s: string) => decodeURIComponent(s.replace(/\+/g, ' ')).replace(/\s+/g, ' ').trim()
const coordinates = (s: string) => /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(s)

/** The site's own name from its address: "friedhats.com" → "Friedhats", "shop.coffee.co.uk" → "Coffee". */
function siteName(host: string): string {
  const parts = host.split('.')
  let i = parts.length - 2
  if (i > 0 && SUFFIX_LABELS.has(parts[i]) && parts[parts.length - 1].length === 2) i--
  const name = parts[Math.max(0, i)] ?? host
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function linkInfo(raw: string): LinkInfo {
  const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return { href, label: raw, map: false }
  }
  const host = url.hostname.toLowerCase().replace(/^(www|m)\./, '')
  const path = url.pathname
  const segments = path.split('/').filter(Boolean)
  const param = (...keys: string[]) => keys.map((k) => url.searchParams.get(k)).find((v) => v && !coordinates(v))

  // Google Maps: a place's name from /maps/place/<name>/ or ?q=, else just "Google Maps".
  const googleMaps = host === 'maps.app.goo.gl' || /^maps\.google\./.test(host) || (host === 'goo.gl' && path.startsWith('/maps'))
    || (/^google\.[a-z.]+$/.test(host) && path.startsWith('/maps'))
  if (googleMaps) {
    const place = path.match(/\/maps\/place\/([^/]+)/)?.[1] ?? path.match(/\/maps\/search\/([^/]+)/)?.[1] ?? param('q', 'query')
    const name = place && !coordinates(words(place)) ? words(place) : ''
    return { href, label: name ? `${name} · Google Maps` : 'Google Maps', map: true }
  }
  if (host === 'maps.apple.com' || host === 'maps.apple') {
    const name = param('q', 'name', 'address')
    return { href, label: name ? `${words(name)} · Apple Maps` : 'Apple Maps', map: true }
  }

  const handle = segments[0] && !['p', 'reel', 'reels', 'stories', 'explore', 'watch', 'share'].includes(segments[0]) ? segments[0].replace(/^@/, '') : ''
  if (host === 'instagram.com') return { href, label: handle ? `Instagram @${handle}` : 'Instagram', map: false }
  if (host === 'tiktok.com') return { href, label: handle ? `TikTok @${handle}` : 'TikTok', map: false }
  if (host === 't.me') return { href, label: handle ? `Telegram @${handle}` : 'Telegram', map: false }
  if (host === 'x.com' || host === 'twitter.com') return { href, label: handle ? `X @${handle}` : 'X', map: false }
  if (host === 'youtube.com' || host === 'youtu.be') return { href, label: 'YouTube', map: false }
  if (host === 'facebook.com') return { href, label: 'Facebook', map: false }
  if (host === 'wa.me') return { href, label: 'WhatsApp', map: false }
  return { href, label: siteName(host), map: false }
}
