import { getSettings, type AIProvider } from './settings'
import type { CoffeeDraft } from './types'
import { ScanError } from './errors'
import { parseLabel } from './parse'
import type { OcrProgress } from './ocr'

/** Each provider's SDK loads only when first used. */
const load = (p: AIProvider) => (p === 'claude' ? import('./claude') : p === 'openai' ? import('./chatgpt') : import('./gemini'))

/** Reads a bag with the AI provider chosen in Settings. */
export async function readBag(images: Blob[], signal?: AbortSignal): Promise<CoffeeDraft> {
  const provider = getSettings().provider
  const { readBag } = await load(provider === 'ocr' ? 'gemini' : provider)
  return readBag(images, signal)
}

export async function testKey(provider: AIProvider, apiKey: string, model: string): Promise<void> {
  const { testKey } = await load(provider)
  return testKey(apiKey, model)
}

const READ_TIMEOUT_MS = 90_000

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
  /** Text recognised on the phone, when read without AI. */
  ocrText?: string
}

/**
 * Reads bag photos with the method chosen in Settings: on-device recognition plus the parser, or
 * an AI provider limited to 90 seconds (on-device has no limit, its first run downloads files).
 * Aborting `signal` stops at once; a timeout rejects with ScanError('timeout').
 */
export async function readLabel(shots: Blob[], signal: AbortSignal, onOcrProgress?: (p: OcrProgress) => void): Promise<LabelReading> {
  const local = new AbortController()
  const stop = () => local.abort(signal.reason)
  signal.addEventListener('abort', stop, { once: true })
  const ocr = getSettings().provider === 'ocr'
  const timer = ocr ? undefined : setTimeout(() => local.abort(new ScanError('timeout')), READ_TIMEOUT_MS)
  try {
    if (ocr) {
      const { recognize } = await import('./ocr')
      const text = await untilAborted(recognize(shots, onOcrProgress ?? (() => {}), local.signal), local.signal)
      return { draft: parseLabel(text), ocrText: text }
    }
    return { draft: await untilAborted(readBag(shots, local.signal), local.signal) }
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', stop)
  }
}
