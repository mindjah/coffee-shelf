import { getSettings, type Provider } from './settings'
import type { CoffeeDraft } from './types'

/** Reads a bag with the provider chosen in Settings; each SDK loads only when first used. */
export async function readBag(images: Blob[]): Promise<CoffeeDraft> {
  const { readBag } = getSettings().provider === 'claude' ? await import('./claude') : await import('./gemini')
  return readBag(images)
}

export async function testKey(provider: Provider, apiKey: string, model: string): Promise<void> {
  const { testKey } = provider === 'claude' ? await import('./claude') : await import('./gemini')
  return testKey(apiKey, model)
}
