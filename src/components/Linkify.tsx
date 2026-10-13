import type { ReactNode } from 'react'

/** Known sites in hint text open the exact page needed rather than the home page. */
const DEEP_LINKS: Record<string, string> = {
  'aistudio.google.com': 'https://aistudio.google.com/apikey',
  'console.anthropic.com': 'https://console.anthropic.com/settings/keys',
  'console.cloud.google.com': 'https://console.cloud.google.com/apis/library/drive.googleapis.com',
  'platform.openai.com': 'https://platform.openai.com/api-keys',
}

// Bare domains like "aistudio.google.com" or full URLs; a trailing full stop isn't part of the link.
const LINK = /\b(https?:\/\/[^\s]+[^\s.,;:)»”]|(?:[a-z0-9-]+\.)+(?:com|dev|io|org)(?:\/[^\s,;)»”]*[^\s.,;:)»”])?)/gi

/** Plain text with web addresses turned into links that open outside the app. */
export function Linkify({ text }: { text: string }) {
  const parts: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(LINK)) {
    const raw = m[0]
    const start = m.index ?? 0
    parts.push(text.slice(last, start))
    const href = DEEP_LINKS[raw.toLowerCase()] ?? (raw.startsWith('http') ? raw : `https://${raw}`)
    parts.push(
      <a key={start} href={href} target="_blank" rel="noopener noreferrer" className="hint-link">
        {raw}
      </a>,
    )
    last = start + raw.length
  }
  parts.push(text.slice(last))
  return <>{parts}</>
}
