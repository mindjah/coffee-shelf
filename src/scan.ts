import { AI_FIELDS, getSettings, PROVIDERS, usesAI, type AIProvider, type Settings } from './settings'
import type { CoffeeDraft } from './types'
import { ScanError } from './errors'
import { parseLabel } from './parse'
import type { OcrProgress } from './ocr'

/** Each provider's SDK loads only when first used. */
const load = (p: AIProvider) => (p === 'claude' ? import('./claude') : p === 'openai' ? import('./chatgpt') : import('./gemini'))

/** One model to try reading with. */
interface Target {
  provider: AIProvider
  model: string
}

/** A lighter model of the same provider: often still answering when the bigger one is overloaded. */
const LIGHTER: Record<string, string> = {
  'gemini-3.8-flash': 'gemini-3.5-flash-lite',
  'claude-opus-5': 'claude-sonnet-5',
  'claude-sonnet-5': 'claude-haiku-4-5',
  'gpt-6-astra': 'gpt-6.1-sol',
  'gpt-6.1-sol': 'gpt-6-luna',
}

/** The model picked in Settings, then its lighter sibling, then the other providers you have a key for. */
function targets(s: Settings): Target[] {
  const own = (p: AIProvider): Target => ({ provider: p, model: s[AI_FIELDS[p].model] })
  const first = usesAI(s.provider) ? own(s.provider) : own('gemini')
  const list = [first]
  if (LIGHTER[first.model]) list.push({ provider: first.provider, model: LIGHTER[first.model] })
  for (const p of PROVIDERS) if (usesAI(p) && p !== first.provider && s[AI_FIELDS[p].key]) list.push(own(p))
  return list
}

/** Name of a model as shown in Settings, e.g. "Gemini 3.5 Flash-Lite". */
export function modelLabel(t: Target): string {
  return AI_FIELDS[t.provider].models.find((m) => m.id === t.model)?.label ?? t.model
}

/** Busy or briefly unreachable: worth asking again in a moment. */
function busy(e: unknown): boolean {
  if (!(e instanceof ScanError)) return false
  if (e.code === 'rateLimit' || e.code === 'offline') return true
  return e.code === 'api' && /^(5\d\d|429)\b|overload|unavailable|high demand|try again/i.test(e.detail ?? '')
}

/** Problems with your key or account: show them rather than hide them behind another model. */
const setupError = (e: unknown) => e instanceof ScanError && ['noKey', 'badKey', 'noModel', 'noCredit'].includes(e.code)

/** What the reader is doing when the first answer doesn't come, for the reading screen. */
export type ReadStatus = { kind: 'retry'; model: string } | { kind: 'fallback'; from: string; to: string }

const ATTEMPT_TIMEOUT_MS = 30_000
const RETRY_DELAYS_MS = [2_000, 5_000]

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => (clearTimeout(timer), reject(signal.reason)), { once: true })
  })

/**
 * Reads a bag with AI, riding out busy servers: each model gets 30 seconds and two quick retries
 * when it says it's busy, then the next model in targets() takes over. Setup problems (a bad key)
 * and answers about the photo (not a coffee bag, unreadable) end the attempt at once.
 */
export async function readBag(images: Blob[], signal: AbortSignal, onStatus?: (s: ReadStatus) => void): Promise<{ draft: CoffeeDraft; via?: string }> {
  const list = targets(getSettings())
  let lastError: unknown
  for (const [i, target] of list.entries()) {
    if (i > 0) onStatus?.({ kind: 'fallback', from: modelLabel(list[i - 1]), to: modelLabel(target) })
    const { readBag: read } = await load(target.provider)
    for (let attempt = 0; ; attempt++) {
      const ac = new AbortController()
      const stop = () => ac.abort(signal.reason)
      signal.addEventListener('abort', stop, { once: true })
      const timer = setTimeout(() => ac.abort(new ScanError('timeout')), ATTEMPT_TIMEOUT_MS)
      try {
        const draft = await untilAborted(read(images, ac.signal, target.model), ac.signal)
        return { draft, via: i > 0 ? modelLabel(target) : undefined }
      } catch (e) {
        if (signal.aborted) throw e // cancelled, or out of time altogether
        const err = ac.signal.aborted ? new ScanError('timeout') : e
        lastError = err
        if (setupError(err)) {
          if (i === 0) throw err
          break // a fallback that isn't set up right: just skip it
        }
        const slow = err instanceof ScanError && err.code === 'timeout'
        if (!slow && busy(err) && attempt < RETRY_DELAYS_MS.length) {
          onStatus?.({ kind: 'retry', model: modelLabel(target) })
          await sleep(RETRY_DELAYS_MS[attempt], signal)
          continue
        }
        if (slow || busy(err)) break // next model
        throw err // about the photo itself; another model won't do better
      } finally {
        clearTimeout(timer)
        signal.removeEventListener('abort', stop)
      }
    }
  }
  throw lastError
}

export async function testKey(provider: AIProvider, apiKey: string, model: string): Promise<void> {
  const { testKey } = await load(provider)
  return testKey(apiKey, model)
}

/** Room for the first model plus a fallback or two (see readBag). */
const READ_TIMEOUT_MS = 120_000

/** Settles as soon as the signal aborts, so the UI never waits on a request that won't stop. */
function untilAborted<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason)
    signal.addEventListener('abort', () => reject(signal.reason), { once: true })
    work.then(resolve, reject)
  })
}

export interface LabelReading {
  draft: CoffeeDraft
  /** Read by a fallback model because the usual one was busy. */
  via?: string
  /** Text recognised on the phone, when read without AI. */
  ocrText?: string
}

/**
 * Reads bag photos with the method chosen in Settings: on-device recognition plus the parser, or
 * AI with retries and fallback models (see readBag), two minutes at most (on-device has no limit,
 * its first run downloads files).
 * Aborting `signal` stops at once; a timeout rejects with ScanError('timeout').
 */
export async function readLabel(
  shots: Blob[],
  signal: AbortSignal,
  onOcrProgress?: (p: OcrProgress) => void,
  onStatus?: (s: ReadStatus) => void,
): Promise<LabelReading> {
  const local = new AbortController()
  const stop = () => local.abort(signal.reason)
  signal.addEventListener('abort', stop, { once: true })
  const ocr = getSettings().provider === 'ocr'
  const timer = ocr ? undefined : setTimeout(() => local.abort(new ScanError('timeout')), READ_TIMEOUT_MS)
  try {
    if (ocr) {
      const { recognize } = await import('./ocr')
      const text = await untilAborted(recognize(shots, onOcrProgress ?? (() => {}), local.signal), local.signal)
      // Roasters and coffees already on the shelf help pick the right lines out of noisy text.
      const { db } = await import('./db')
      const shelf = await db.coffees.toArray()
      const hints = { roasters: [...new Set(shelf.map((c) => c.roaster.trim()).filter(Boolean))], coffees: shelf.map(({ roaster, name }) => ({ roaster, name })) }
      return { draft: parseLabel(text, hints), ocrText: text }
    }
    return await untilAborted(readBag(shots, local.signal, onStatus), local.signal)
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', stop)
  }
}
