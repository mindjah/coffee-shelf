import { useSyncExternalStore } from 'react'
import type { Lang } from './types'

export const MODELS = [
  { id: 'claude-opus-5', label: 'Claude Opus 5' },
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
] as const

/** Both are on the Gemini API free tier. */
export const GEMINI_MODELS = [
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite' },
] as const

/** Sol is the default: plenty for reading a label at a fraction of Astra's price. */
export const OPENAI_MODELS = [
  { id: 'gpt-6.1-sol', label: 'GPT-6.1 Sol' },
  { id: 'gpt-6-astra', label: 'GPT-6 Astra' },
  { id: 'gpt-6-luna', label: 'GPT-6 Luna' },
] as const

/** How a bag photo is read: AI (Gemini, Claude, ChatGPT) or on-device text recognition. Manual entry is a switch on the Scan screen. */
export type Provider = 'gemini' | 'claude' | 'openai' | 'ocr'
export const PROVIDERS: Provider[] = ['gemini', 'claude', 'openai', 'ocr']
export type AIProvider = Exclude<Provider, 'ocr'>

export interface Settings {
  /** Gemini is the free default. */
  provider: Provider
  geminiKey: string
  geminiModel: string
  /** Anthropic API key. */
  apiKey: string
  model: string
  /** OpenAI API key (ChatGPT). */
  openaiKey: string
  openaiModel: string
  /** 'auto' (until the user picks) follows the iPhone: Russian or Spanish if it's in one, else English. */
  lang: 'auto' | Lang
}

const KEY = 'coffee-shelf.settings'
const DEFAULTS: Settings = {
  provider: 'gemini',
  geminiKey: '',
  geminiModel: GEMINI_MODELS[0].id,
  apiKey: '',
  model: MODELS[0].id,
  openaiKey: '',
  openaiModel: OPENAI_MODELS[0].id,
  lang: 'auto',
}

export const usesAI = (p: Provider): p is AIProvider => p !== 'ocr'

/** Where each AI provider keeps its key and model in Settings. */
export const AI_FIELDS = {
  gemini: { key: 'geminiKey', model: 'geminiModel', models: GEMINI_MODELS },
  claude: { key: 'apiKey', model: 'model', models: MODELS },
  openai: { key: 'openaiKey', model: 'openaiModel', models: OPENAI_MODELS },
} as const

export function activeKey(s: Settings): string {
  return usesAI(s.provider) ? s[AI_FIELDS[s.provider].key] : ''
}

/** True when the chosen way of adding coffee can't work until a key is entered. */
export const needsKey = (s: Settings) => usesAI(s.provider) && !activeKey(s)
const listeners = new Set<() => void>()

function read(): Settings {
  try {
    const saved = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
    // "manual" used to be a provider; it now lives on the Scan screen.
    if (!PROVIDERS.includes(saved.provider)) saved.provider = DEFAULTS.provider
    return saved
  } catch {
    return DEFAULTS
  }
}

let current = read()

export function getSettings(): Settings {
  return current
}

export function saveSettings(patch: Partial<Settings>) {
  current = { ...current, ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    // Private mode etc. — settings still apply for this session.
  }
  listeners.forEach((l) => l())
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => current,
  )
}
