import { useEffect, useState } from 'react'
import { FLAVORS, type CoffeeDraft, type Lang } from '../types'
import { countryName, localized, useLang, useT, type Dict } from '../i18n'
import { CoffeeThumb } from './CoffeeThumb'
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

/** "Roasted for filter" when stated, "Probably roasted for filter" when guessed. */
export function brewTitle(brew: BrewGuess, t: Dict) {
  return (brew.stated ? t.coffee.brewStated : t.coffee.brewGuess)[brew.method]
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
  const facts = [
    coffee.process !== 'unknown' && (processDetail || t.process[coffee.process]),
    coffee.roast !== 'unknown' && t.coffee.roastChip(t.roast[coffee.roast]),
    brew && (brew.stated ? t.roastFor[brew.method] : t.coffee.brewChip(t.roastFor[brew.method])),
    coffee.varieties.length > 0 && coffee.varieties.join(', '),
    coffee.altitude && `${coffee.altitude.toLocaleString(lang)} m`,
    coffee.producer,
    coffee.scaScore && `SCA ${coffee.scaScore}`,
  ].filter(Boolean) as string[]
  const flavors = FLAVORS.filter((f) => coffee.flavors[f] > 0).sort((a, b) => coffee.flavors[b] - coffee.flavors[a])

  return (
    <div className="card">
      <div className="coffee-head">
        <CoffeeThumb photo={coffee.photo} name={[coffee.roaster, coffee.name].filter(Boolean).join(' – ')} />
        <div>
          <div className="roaster">{coffee.roaster || t.common.unknownRoaster}</div>
          <div className="coffee-name">{coffee.name || t.common.untitled}</div>
          <div className="muted small">{originLine(coffee, t, lang)}</div>
        </div>
      </div>
      {(notes.length > 0 || facts.length > 0) && (
        <div className="chips">
          {notes.map((n) => <span key={`n-${n}`} className="chip note">{n}</span>)}
          {facts.map((f) => <span key={`f-${f}`} className="chip">{f}</span>)}
        </div>
      )}
      {brew && showBrewWhy && (
        <div className="muted small" style={{ marginTop: 8 }}>
          {brewTitle(brew, t)}: {brewWhy(brew, t)}.
        </div>
      )}
      {translated && (
        <div className="muted small" style={{ marginTop: 8 }}>{t.coffee.onBag}: {coffee.notes.join(', ')}</div>
      )}
      {showFlavors && flavors.length > 0 && (
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
    </div>
  )
}
