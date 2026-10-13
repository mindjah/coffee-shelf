import { getSettings, type AIProvider } from './settings'
import type { CoffeeDraft } from './types'

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
