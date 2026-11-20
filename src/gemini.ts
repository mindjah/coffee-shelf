import { ApiError, FinishReason, GoogleGenAI, UrlRetrievalStatus } from '@google/genai'
import { z } from 'zod'
import type { CoffeeDraft } from './types'
import { blobToBase64 } from './image'
import { getSettings } from './settings'
import { ScanError } from './errors'
import { BagSchema, SYSTEM, USER_PROMPT, siteOf, toDraft } from './extract'
import { linkInfo } from './links'
import { LOOKUP_SYSTEM, lookupJsonSchema, notFound, parseLookup, type Lookup } from './lookup'

// Gemini takes plain JSON Schema; drop the $schema marker it doesn't accept.
const { $schema: _, ...responseJsonSchema } = z.toJSONSchema(BagSchema) as Record<string, unknown>

function toScanError(e: unknown): unknown {
  if (e instanceof ApiError) {
    if (e.status === 429) return new ScanError('rateLimit')
    if (e.status === 401 || e.status === 403 || /api key/i.test(e.message)) return new ScanError('badKey')
    if (e.status === 404) return new ScanError('noModel')
    return new ScanError('api', `${e.status} ${e.message}`.slice(0, 200))
  }
  if (e instanceof TypeError) return new ScanError('offline')
  return e
}

/** Checks the key and model with a model lookup, which spends no generation quota. */
export async function testKey(apiKey: string, model: string): Promise<void> {
  try {
    await new GoogleGenAI({ apiKey }).models.get({ model })
  } catch (e) {
    throw toScanError(e)
  }
}

/** `model` overrides the one picked in Settings (a lighter fallback when it's busy). */
export async function readBag(images: Blob[], signal?: AbortSignal, model?: string): Promise<CoffeeDraft> {
  const { geminiKey, geminiModel: picked } = getSettings()
  const geminiModel = model ?? picked
  if (!geminiKey) throw new ScanError('noKey')

  const ai = new GoogleGenAI({ apiKey: geminiKey })
  const parts = [
    ...(await Promise.all(images.map(async (img) => ({ inlineData: { mimeType: 'image/jpeg', data: await blobToBase64(img) } })))),
    { text: USER_PROMPT },
  ]

  let response
  try {
    response = await ai.models.generateContent({
      model: geminiModel,
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: SYSTEM,
        responseMimeType: 'application/json',
        responseJsonSchema,
        maxOutputTokens: 16000,
        abortSignal: signal,
      },
    })
  } catch (e) {
    throw toScanError(e)
  }

  if (response.promptFeedback?.blockReason) throw new ScanError('refusal')
  const finish = response.candidates?.[0]?.finishReason
  if (finish === FinishReason.MAX_TOKENS) throw new ScanError('truncated')
  if (finish === FinishReason.SAFETY || finish === FinishReason.PROHIBITED_CONTENT) throw new ScanError('refusal')

  let parsed
  try {
    parsed = BagSchema.safeParse(JSON.parse(response.text ?? ''))
  } catch {
    throw new ScanError('unreadable')
  }
  if (!parsed.success) throw new ScanError('unreadable')
  return toDraft(parsed.data)
}

/**
 * The place a short map link points to ("maps.app.goo.gl/…" carries no name). The browser can't
 * open other sites' pages, but Gemini's URL context tool opens it on Google's side. Answers only
 * count when the page was really retrieved, so a name is never guessed.
 */
export async function placeFromLink(link: string, model?: string, signal?: AbortSignal): Promise<{ name?: string; reason?: string }> {
  const { geminiKey, geminiModel } = getSettings()
  if (!geminiKey) return { reason: 'no Gemini key' }
  const response = await new GoogleGenAI({ apiKey: geminiKey }).models.generateContent({
    model: model ?? geminiModel,
    contents: [{
      role: 'user',
      parts: [{ text: `${link}\n\nOpen this map link. Reply with one line: NAME: <the place's name exactly as the page shows it>. If the page doesn't open or doesn't show a place, reply NAME: NONE.` }],
    }],
    config: { tools: [{ urlContext: {} }], maxOutputTokens: 2000, abortSignal: signal },
  })
  const fetched = response.candidates?.[0]?.urlContextMetadata?.urlMetadata ?? []
  // Where the link led often names the place ("…maps?q=Name, address") even when the page, drawn
  // by scripts, only says "Google Maps".
  for (const m of fetched) {
    const led = m.retrievedUrl ? linkInfo(m.retrievedUrl) : null
    if (led?.map && led.named) return { name: led.label.replace(/ · (Google|Apple) Maps$/, '') }
  }
  const name = response.text?.match(/NAME:\s*(.+)/)?.[1]?.trim().replace(/^["«]|["»]$/g, '')
  // Why it didn't work, in plain words, so a failure can be told apart from "no place there".
  if (!fetched.some((m) => m.urlRetrievalStatus === UrlRetrievalStatus.URL_RETRIEVAL_STATUS_SUCCESS)) {
    return { reason: fetched.length ? `page not opened (${fetched.map((m) => m.urlRetrievalStatus?.replace('URL_RETRIEVAL_STATUS_', '')).join(', ')})` : 'the model did not open the link' }
  }
  if (!name || /^none$/i.test(name) || name.length > 80) return { reason: `no place on the page (${(response.text ?? '').slice(0, 60)})` }
  return { name }
}

const LOOKUP_FORMAT = `Answer with one JSON object matching this JSON Schema, in a \`\`\`json block:\n`

/**
 * Finds a coffee online with Google Search and URL context; the answer comes as JSON text.
 * Free keys often get no Google Search at all (or run out of it), while URL context still works:
 * then the model names the pages most likely to have the coffee, and reads those.
 */
export async function lookup(request: string, signal?: AbortSignal, model?: string): Promise<Lookup> {
  const { geminiKey, geminiModel: picked } = getSettings()
  const geminiModel = model ?? picked
  if (!geminiKey) throw new ScanError('noKey')
  const ai = new GoogleGenAI({ apiKey: geminiKey })
  const ask = async (text: string, tools: { googleSearch?: object; urlContext?: object }[]) => {
    let response
    try {
      response = await ai.models.generateContent({
        model: geminiModel,
        contents: [{ role: 'user', parts: [{ text: `${text}\n\n${LOOKUP_FORMAT}${lookupJsonSchema()}` }] }],
        config: { systemInstruction: LOOKUP_SYSTEM, tools, maxOutputTokens: 16000, abortSignal: signal },
      })
    } catch (e) {
      throw toScanError(e)
    }
    if (response.promptFeedback?.blockReason) throw new ScanError('refusal')
    if (response.candidates?.[0]?.finishReason === FinishReason.MAX_TOKENS) throw new ScanError('truncated')
    return parseLookup(response.text ?? '')
  }

  try {
    return await ask(request, [{ googleSearch: {} }, { urlContext: {} }])
  } catch (e) {
    if (!(e instanceof ScanError && e.code === 'rateLimit')) throw e
  }
  // Without Google Search, a product page can't be guessed (/products/el-salvador-santa-rosa-pacamara-202610).
  // Public search engines' result pages stand in for it: they name the page, or at least the
  // roaster's site, whose listings then point to the page. Then the page is read.
  const known = request.match(/"website":\s*"([^"]+)"/)?.[1]
  let found = await findProductPages(ai, geminiModel, request, [
    ...(known ? shopPages(known, request) : []),
    ...searchPages(request),
    ...(await likelyPages(ai, geminiModel, request, signal)),
  ], signal)
  // Only the roaster's site turned up: its catalogue is the next place to look.
  const site = found.sites.find((s) => s !== known)
  if (!found.pages.length && site) found = await findProductPages(ai, geminiModel, request, shopPages(site, request), signal)
  if (!found.pages.length) return notFound()
  const answer = await ask(`${request}\n\nGoogle Search isn't available. Read these pages, which should be about this coffee:\n${found.pages.join('\n')}`, [{ urlContext: {} }])
  // Kept on the coffee, so the next search starts there.
  return { ...answer, website: answer.website || site || '' }
}

const field = (request: string, key: string) => request.match(new RegExp(`"${key}":\\s*"([^"]+)"`))?.[1] ?? ''

/** A shop's listing pages: Shopify's catalogue and product feed, and its site search. */
function shopPages(site: string, request: string): string[] {
  const name = field(request, 'name')
  const base = `https://${site}`
  return [`${base}/`, `${base}/collections/all`, `${base}/products.json`, ...(name ? [`${base}/search?q=${encodeURIComponent(name)}`] : [])]
}

/** Result pages of public search engines for the roaster and the coffee. */
function searchPages(request: string): string[] {
  const roaster = field(request, 'roaster')
  const name = field(request, 'name')
  if (!roaster && !name) return []
  const q = (text: string) => encodeURIComponent(text)
  const both = [roaster, name, 'coffee'].filter(Boolean).join(' ')
  return [
    `https://html.duckduckgo.com/html/?q=${q(both)}`,
    `https://www.bing.com/search?q=${q(both)}`,
    ...(roaster ? [`https://html.duckduckgo.com/html/?q=${q(`${roaster} coffee roaster official site`)}`] : []),
  ]
}

/**
 * Opens the pages (listings, search results) and names the product pages about this coffee, and
 * the roaster's own site when a result shows it. Throws siteClosed when none would open.
 */
async function findProductPages(ai: GoogleGenAI, model: string, request: string, listings: string[], signal?: AbortSignal): Promise<{ pages: string[]; sites: string[] }> {
  const urls = [...new Set(listings)].slice(0, 15)
  if (!urls.length) return { pages: [], sites: [] }
  let response
  try {
    response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: `${request}

Open these pages: search results, and the roaster's site and shops. Find the product page about this exact coffee; its name may be in another language or longer than the bag's (Santa Rosa → "El Salvador Santa Rosa Pacamara", "サンタローザ農園"). Search result pages link to the pages they found: give those pages' own addresses, not the search engine's.
Reply with lines like:
PAGE: https://… (the coffee's page, best match first, at most 3; a listing that describes the coffee in full counts)
SITE: example.com (the roaster's own website, if you saw it)
If nothing matches, reply PAGE: NONE.

${urls.join('\n')}` }] }],
      config: { tools: [{ urlContext: {} }], maxOutputTokens: 4000, abortSignal: signal },
    })
  } catch (e) {
    throw toScanError(e)
  }
  const fetched = response.candidates?.[0]?.urlContextMetadata?.urlMetadata ?? []
  if (fetched.length && !fetched.some((m) => m.urlRetrievalStatus === UrlRetrievalStatus.URL_RETRIEVAL_STATUS_SUCCESS)) {
    throw new ScanError('siteClosed')
  }
  const text = response.text ?? ''
  const engines = /(^|\.)(duckduckgo|bing|google)\./
  const pages = [...text.matchAll(/PAGE:\s*(https?:\/\/\S+)/g)].map((m) => m[1].replace(/[)>.,]+$/, '')).filter((u) => !engines.test(siteOf(u))).slice(0, 3)
  const sites = [...text.matchAll(/SITE:\s*(\S+)/g)].map((m) => siteOf(m[1])).filter((h) => h && !engines.test(h))
  return { pages, sites }
}

/** Up to eight addresses where this coffee is likely described, from what the model knows. */
async function likelyPages(ai: GoogleGenAI, model: string, request: string, signal?: AbortSignal): Promise<string[]> {
  let response
  try {
    response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: `${request}\n\nList up to 8 web addresses most likely to describe this exact coffee: the roaster's website (use the website given, if any), its shop or coffee catalogue pages, its site search for the coffee's name (e.g. https://example.com/search?q=name), and shops known to sell this roaster's coffee. Only domains you are confident exist.` }] }],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: { type: 'object', properties: { urls: { type: 'array', items: { type: 'string' } } }, required: ['urls'] },
        maxOutputTokens: 2000,
        abortSignal: signal,
      },
    })
  } catch (e) {
    throw toScanError(e)
  }
  try {
    const urls: unknown = JSON.parse(response.text ?? '{}').urls
    return Array.isArray(urls) ? urls.filter((u): u is string => typeof u === 'string' && /^https?:\/\/[^\s]+$/.test(u)).slice(0, 8) : []
  } catch {
    return []
  }
}
