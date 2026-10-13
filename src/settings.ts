import { useSyncExternalStore } from 'react'

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

export type Provider = 'gemini' | 'claude'

export interface Settings {
  /** Gemini is the free default; Claude is the paid alternative. */
  provider: Provider
  geminiKey: string
  geminiModel: string
  /** Anthropic API key. */
  apiKey: string
  model: string
  /** 'auto' follows the iPhone's language. */
  lang: 'auto' | 'en' | 'ru'
}

const KEY = 'coffee-shelf.settings'
const DEFAULTS: Settings = {
  provider: 'gemini',
  geminiKey: '',
  geminiModel: GEMINI_MODELS[0].id,
  apiKey: '',
  model: MODELS[0].id,
  lang: 'auto',
}

export function activeKey(s: Settings): string {
  return s.provider === 'claude' ? s.apiKey : s.geminiKey
}
const listeners = new Set<() => void>()

function read(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
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
