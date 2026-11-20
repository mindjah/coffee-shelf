import { useEffect, useState } from 'react'
import { FLAVORS, type CoffeeDraft, type Lang } from '../types'
import { countryName, formatPrice, localized, pricePer100g, useLang, useT, type Dict } from '../i18n'
import { BagThumb } from './CoffeeThumb'
import { hasProfile } from '../recommend'
import { webFieldNames } from './LookupButton'
import { brewMethod, type BrewGuess } from '../brew'

export function usePhotoUrl(photo?: Blob | ArrayBuffer) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!photo) return setUrl(undefined)
    const u = URL.createObjectURL(photo instanceof Blob ? photo : new Blob([photo], { type: 'image/jpeg' }))
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [photo])
  return url
}

/** "Roasted for filter" when stated, "Probably roasted for filter" when guessed; the method in bold. */
export function brewTitle(brew: BrewGuess, t: Dict) {
  const text = (brew.stated ? t.coffee.brewStated : t.coffee.brewGuess)[brew.method]
  return text.split('**').map((part, i) => (i % 2 ? <b key={i} className="brew-method">{part}</b> : part))
}

/** Where the brew method comes from, e.g. "light roast, floral or tea-like notes". */
export function brewWhy(brew: BrewGuess, t: Dict) {
  return brew.stated ? t.coffee.brewStatedWhy : brew.clues.map((c) => t.coffee.brewClue(c, (r) => t.roast[r])).join(', ')
}

export function originLine(c: CoffeeDraft, t: Dict, lang: Lang) {
  return [countryName(c, lang), c.area].filter(Boolean).join(' · ') || t.common.unknownOrigin
}

/** `showBrewWhy` adds the brew method line (the scan screen shows it in its own card). */
export function CoffeeSummary({ coffee, showFlavors = true, showBrewWhy = true }: { coffee: CoffeeDraft; showFlavors?: boolean; showBrewWhy?: boolean }) {
  const t = useT()
  const lang = useLang()
  const { notes, processDetail } = localized(coffee, lang)
  const translated = notes.join() !== coffee.notes.join()
  // Not printed on the bag: shown as a likely method, with what it's based on.
  const brew = brewMethod(coffee)
  // Labelled like the editor's fields, without their hints ("Varieties (comma separated)", "Altitude, m").
  const label = (text: string) => text.replace(/\s*\(.*\)|,\s*\S+$/g, '')
  const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1)
  const price = formatPrice(coffee, lang)
  const facts = ([
    // A mark like "W" or "N" (washed, natural) reads better as the process's name.
    coffee.process !== 'unknown' && [t.editor.process, cap(processDetail.trim().length > 2 ? processDetail : t.process[coffee.process])],
    coffee.roast !== 'unknown' && [t.editor.roast, t.roast[coffee.roast]],
    brew && [t.editor.roastFor, brew.stated ? t.roastFor[brew.method] : t.coffee.brewChip(t.roastFor[brew.method])],
    coffee.varieties.length > 0 && [label(t.editor.varieties), coffee.varieties.join(', ')],
    coffee.altitude && [label(t.editor.altitude), `${coffee.altitude.toLocaleString(lang)} m`],
    coffee.producer && [t.editor.producer, coffee.producer],
    coffee.scaScore && [t.editor.sca, String(coffee.scaScore)],
    coffee.weight && [label(t.editor.weight), t.coffee.grams(coffee.weight)],
    coffee.roastedAt && [t.editor.roastedAt, t.coffee.roasted(
      new Date(coffee.roastedAt).toLocaleDateString(lang, { day: 'numeric', month: 'short', ...(new Date(coffee.roastedAt).getFullYear() !== new Date().getFullYear() && { year: 'numeric' }) }),
      Math.floor((Date.now() - coffee.roastedAt) / 864e5),
    )],
    // What you paid, and per 100 g so bags of different sizes compare.
    price && [t.editor.price, [price, pricePer100g(coffee, lang) && coffee.weight !== 100 && t.coffee.per100g(pricePer100g(coffee, lang))].filter(Boolean).join(' · ')],
  ].filter(Boolean) as [string, string][])
  // Notes found online came from the roaster's page, not the bag.
  const notesFromWeb = coffee.webFields?.includes('notes')
  const flavors = FLAVORS.filter((f) => coffee.flavors[f] > 0).sort((a, b) => coffee.flavors[b] - coffee.flavors[a])

  return (
    <div className="card">
      <div className="coffee-head">
        <BagThumb coffee={coffee} />
        <div>
          <div className="roaster">{coffee.roaster || t.common.unknownRoaster}{coffee.series && <span className="series"> · {coffee.series}</span>}</div>
          <div className="coffee-name">{coffee.name || t.common.untitled}</div>
          <div className="muted small">{originLine(coffee, t, lang)}</div>
        </div>
      </div>
      {notes.length > 0 && (
        <div className="chips">
          {notes.map((n) => <span key={n} className="chip note">{n}</span>)}
        </div>
      )}
      {facts.length > 0 && (
        <dl className="coffee-facts">
          {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      )}
      {/* An "estimate" from nothing (no origin, process or roast) would be made up: not shown. */}
      {showFlavors && flavors.length > 0 && hasProfile(coffee) && (
        <div className="flavors">
          {flavors.map((f) => (
            <div className="flavor" key={f}>
              <span>{t.flavor[f]}</span>
              <span className="bar"><i style={{ width: `${coffee.flavors[f] * 100}%` }} /></span>
            </div>
          ))}
          {coffee.flavorsEstimated && <div className="muted small">{t.coffee.estimated}</div>}
        </div>
      )}
      {((brew && showBrewWhy) || !!coffee.webFields?.length || translated) && (
        <div className="coffee-notes muted small">
          {brew && showBrewWhy && <p>{brewTitle(brew, t)}: {brewWhy(brew, t)}.</p>}
          {!!coffee.webFields?.length && (
            <p>
              {t.editor.fromWeb(webFieldNames(t, coffee.webFields))}
              {coffee.webSource && <> · <a className="hint-link" href={coffee.webSource} target="_blank" rel="noopener noreferrer">{t.editor.webSource}</a></>}
            </p>
          )}
          {translated && <p>{notesFromWeb ? t.coffee.original : t.coffee.onBag}: {coffee.notes.join(', ')}</p>}
        </div>
      )}
    </div>
  )
}
