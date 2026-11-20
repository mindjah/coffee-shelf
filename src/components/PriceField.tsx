import { useT } from '../i18n'
import { CURRENCIES } from '../settings'

/** "12,50" → 12.5; empty, zero or unreadable → null. */
export function parsePrice(s: string): number | null {
  const n = Number(s.replace(',', '.'))
  return s.trim() && Number.isFinite(n) && n > 0 ? n : null
}

/** What you paid, with its currency; `text` is the price as typed, so "12," survives while typing. */
export function PriceField({ text, currency, onText, onCurrency }: {
  text: string
  currency: string
  onText: (text: string) => void
  onCurrency: (code: string) => void
}) {
  const t = useT()
  return (
    <label className="field">
      <span>{t.editor.price}</span>
      <div className="price-input">
        <input className="input" inputMode="decimal" placeholder="0" value={text} onChange={(e) => onText(e.target.value.replace(/[^\d.,]/g, ''))} />
        <select className="input" value={currency} onChange={(e) => onCurrency(e.target.value)} aria-label={t.editor.currency}>
          {[...new Set([...CURRENCIES, currency])].map((code) => <option key={code} value={code}>{code}</option>)}
        </select>
      </div>
    </label>
  )
}
