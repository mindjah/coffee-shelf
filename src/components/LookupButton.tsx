import { useEffect, useRef, useState } from 'react'
import { ScanError } from '../errors'
import type { WebField } from '../lookup'
import { lookupProvider, useSettings } from '../settings'
import { statusText, useT, type Dict } from '../i18n'
import type { CoffeeDraft } from '../types'
import { GlobeIcon } from './icons'
import { Linkify } from './Linkify'

/** Field names as the editor labels them, shortened ("Varieties (comma separated)" → "varieties"). */
export function webFieldNames(t: Dict, fields: string[]) {
  const label: Record<WebField, string> = {
    country: t.editor.country, area: t.editor.area, producer: t.editor.producer, varieties: t.editor.varieties,
    process: t.editor.process, altitude: t.editor.altitude, roast: t.editor.roast, notes: t.editor.notes,
    sca: t.editor.sca, series: t.editor.series,
  }
  return fields.map((f) => (label[f as WebField] ?? f).replace(/\s*\(.*\)|,\s*\S+$/g, '').toLowerCase()).join(', ')
}

/**
 * Looks the coffee up online and fills what the bag didn't say (never what it did), remembering
 * which fields came from the web and the page they came from.
 */
export function LookupButton({ coffee, onFilled }: { coffee: CoffeeDraft; onFilled: (next: CoffeeDraft) => void }) {
  const t = useT()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string>()
  // What's happening while the usual model is busy: retrying, or another one standing in.
  const [status, setStatus] = useState<string>()
  const running = useRef<AbortController>(undefined)
  useEffect(() => () => running.current?.abort(), [])
  const settings = useSettings()
  if (!lookupProvider(settings)) return <p className="muted small" style={{ margin: '8px 4px 0' }}>{t.editor.lookupNeedsAI}</p>

  async function run() {
    setBusy(true)
    setMessage(undefined)
    setStatus(undefined)
    const ac = new AbortController()
    running.current = ac
    try {
      // Loaded on first use: it brings the schema library along.
      const { fillGaps, lookupCoffee } = await import('../lookup')
      const found = await lookupCoffee(coffee, ac.signal, (s) => setStatus(statusText(t, s)))
      const via = found.via ? ` ${t.editor.lookupVia(found.via)}` : ''
      if (!found.draft) return setMessage(t.editor.lookupNone + via)
      const { next, fields } = fillGaps(coffee, found.draft)
      if (!fields.length) return setMessage(t.editor.lookupNothingNew + via)
      onFilled({ ...next, webFields: [...new Set([...(coffee.webFields ?? []), ...fields])], webSource: found.source || coffee.webSource })
      setMessage(t.editor.lookupFilled(webFieldNames(t, fields)) + via)
    } catch (e) {
      if (ac.signal.aborted) return
      const text = e instanceof ScanError && e.code === 'unreadable' ? t.editor.lookupUnreadable : e instanceof ScanError ? t.errors[e.code] : String(e)
      setMessage([text, e instanceof ScanError && e.detail].filter(Boolean).join(' '))
    } finally {
      setBusy(false)
      setStatus(undefined)
    }
  }

  return (
    <div className="lookup">
      <button type="button" className="btn ghost block" onClick={run} disabled={busy}>
        <GlobeIcon /> {busy ? t.editor.lookingUp : t.editor.lookup}
      </button>
      {busy && status && <p className="muted small" style={{ margin: '8px 4px 0' }}>{status}</p>}
      {message && <p className="muted small" style={{ margin: '8px 4px 0' }}><Linkify text={message} /></p>}
    </div>
  )
}
