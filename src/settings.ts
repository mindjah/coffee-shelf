import { useSyncExternalStore } from 'react'

export const MODELS = [
  { id: 'claude-opus-5', label: 'Claude Opus 5' },
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
] as const

export interface Settings {
  apiKey: string
  model: string
  /** 'auto' follows the iPhone's language. */
  lang: 'auto' | 'en' | 'ru'
}

const KEY = 'coffee-shelf.settings'
const DEFAULTS: Settings = { apiKey: '', model: MODELS[0].id, lang: 'auto' }
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
