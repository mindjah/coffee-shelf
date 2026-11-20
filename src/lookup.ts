// Looking a coffee up online when its bag says little: the roaster's shop page usually lists the
// origin, process and tasting notes. Each provider searches the web its own way (claude.ts,
// gemini.ts, chatgpt.ts); what to ask and how the answer fills the coffee is here.
import { z } from 'zod'
import { BagSchema, SYSTEM, toDraft } from './extract'
import { ScanError } from './errors'
import { lookupProvider } from './settings'
import { FLAVORS, type CoffeeDraft } from './types'
import type { ReadStatus } from './scan'

export const LookupSchema = BagSchema.extend({
  found: z.boolean().describe('True only if a page about this exact coffee (same roaster, same lot or blend) was found'),
  source_url: z.string().describe('Address of the page the details came from; empty if none'),
})
export type Lookup = z.infer<typeof LookupSchema>

export const LOOKUP_SYSTEM = `${SYSTEM}

This time there is no photo: you are finding this coffee online, on the roaster's own website or shop first, then on shops that sell it. Search the web, open the most relevant pages and fill the same fields from what they say.

Roasters' sites are often in their own language (Japanese, Korean, Spanish…): match names by meaning and transliteration (サンタローザ = Santa Rosa, ウォルカ = Worka) and translate what you find. The bag may print only part of the product's name: "Santa Rosa" can be the shop's "El Salvador Santa Rosa Pacamara". Shops often list products at /collections/all or /products.json (Shopify) and have a site search.

Report only what a page about this exact coffee states (same roaster, same lot, farm or blend). A page about a different coffee from the same roaster, or general knowledge of the origin, does not count: then set found to false and leave the fields empty. Never invent tasting notes. Set is_coffee_bag to true and label_cut_off to false. Put the address of the page you used in source_url.`

/** What the bag already says, for the search to start from. */
export function lookupRequest(c: CoffeeDraft): string {
  const known = Object.fromEntries(Object.entries({
    roaster: c.roaster,
    series: c.series,
    name: c.name,
    country: c.country,
    area: c.area,
    producer: c.producer,
    process: c.process === 'unknown' ? '' : c.process,
    notes: c.notes.join(', '),
    website: c.website,
  }).filter(([, v]) => v))
  return `Find this coffee online and fill in its details:\n${JSON.stringify(known, null, 2)}`
}

/** The answer as JSON text (a model that can't search and use a schema at once writes it out). */
export function parseLookup(text: string): Lookup {
  const json = text.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
  let parsed
  try {
    // Written as text, not held to the schema: a field left out takes its empty value.
    const answer = JSON.parse(json)
    const blank = notFound()
    parsed = LookupSchema.safeParse({ ...blank, ...answer, translations: { ...blank.translations, ...answer?.translations }, flavors: { ...blank.flavors, ...answer?.flavors } })
  } catch {
    throw new ScanError('unreadable')
  }
  if (!parsed.success) throw new ScanError('unreadable')
  return parsed.data
}

/** "Nothing found", for a search that couldn't even find a page to open. */
export const notFound = (): Lookup => {
  const tr = { notes: [], process_detail: '' }
  return {
    is_coffee_bag: true, roaster: '', series: '', name: '', country: '', country_codes: [], area: '', producer: '', varieties: [],
    process: 'unknown', process_detail: '', altitude_masl: null, roast: 'unknown', roast_for: 'unknown', region: 'unknown', notes: [],
    translations: { en: tr, ru: tr, es: tr }, flavors: Object.fromEntries(FLAVORS.map((f) => [f, 0])) as Lookup['flavors'], flavors_estimated: true,
    acidity: null, body: null, sweetness: null, sca_score: null, weight_g: null, roast_date: '', website: '', label_cut_off: false, found: false, source_url: '',
  }
}

/** The schema as JSON Schema text, for prompts that ask for JSON in plain text. */
export const lookupJsonSchema = () => {
  const { $schema: _, ...schema } = z.toJSONSchema(LookupSchema) as Record<string, unknown>
  return JSON.stringify(schema)
}

/** Fields the web can fill, by the key the editor labels them with. */
export type WebField = 'country' | 'area' | 'producer' | 'varieties' | 'process' | 'altitude' | 'roast' | 'notes' | 'sca' | 'series'

/**
 * Fills what the coffee doesn't say yet; nothing the bag or you stated is replaced. Tasting notes
 * from the web replace only a guessed profile.
 */
export function fillGaps<T extends CoffeeDraft>(old: T, web: CoffeeDraft): { next: T; fields: WebField[] } {
  const next = { ...old }
  const fields: WebField[] = []
  const take = <K extends keyof CoffeeDraft>(field: WebField, keys: K[], empty: boolean, has: boolean) => {
    if (!empty || !has) return
    for (const k of keys) (next as CoffeeDraft)[k] = web[k]
    fields.push(field)
  }
  take('country', ['country', 'countryCodes', 'region'], !old.countryCodes?.length && !old.country.trim(), !!web.countryCodes?.length || !!web.country)
  take('area', ['area'], !old.area.trim(), !!web.area)
  take('producer', ['producer'], !old.producer.trim(), !!web.producer)
  take('varieties', ['varieties'], !old.varieties.length, web.varieties.length > 0)
  take('process', ['process', 'processDetail'], old.process === 'unknown', web.process !== 'unknown')
  take('altitude', ['altitude'], old.altitude == null, web.altitude != null)
  take('roast', ['roast'], old.roast === 'unknown', web.roast !== 'unknown')
  take('sca', ['scaScore'], old.scaScore == null, web.scaScore != null)
  take('series', ['series'], !old.series?.trim(), !!web.series)
  take('notes', ['notes', 'translations', 'flavors', 'flavorsEstimated', 'structure'], old.flavorsEstimated || !old.notes.length, web.notes.length > 0 && !web.flavorsEstimated)
  if (old.roastFor === 'unknown' && web.roastFor !== 'unknown') next.roastFor = web.roastFor
  return { next, fields }
}

export interface LookupResult {
  draft: CoffeeDraft | null
  source: string
  /** Found by a stand-in model because the usual one was busy or out of searches. */
  via?: string
}

/** A search runs longer than a label read: several pages may be opened. */
const LOOKUP_ATTEMPT_MS = 60_000

/**
 * Searches the web for the coffee like the scanner reads a label (see withFallback in scan.ts):
 * retries when the model is busy or out of searches, then a lighter model, then the other
 * providers you have a key for. An answer that can't be read is also worth another model's try.
 */
export async function lookupCoffee(c: CoffeeDraft, signal: AbortSignal, onStatus?: (s: ReadStatus) => void): Promise<LookupResult> {
  if (!lookupProvider()) throw new ScanError('noKey')
  const { withFallback } = await import('./scan')
  const request = lookupRequest(c)
  const { result: found, via } = await withFallback((mod, model, sig) => mod.lookup(request, sig, model), signal, {
    onStatus,
    attemptMs: LOOKUP_ATTEMPT_MS,
    keyedOnly: true,
    nextOn: (e) => e instanceof ScanError && ['unreadable', 'truncated', 'refusal', 'api', 'siteClosed'].includes(e.code),
  })
  if (!found.found) return { draft: null, source: '', via }
  return { draft: toDraft(found), source: /^https?:\/\//.test(found.source_url) ? found.source_url : '', via }
}
