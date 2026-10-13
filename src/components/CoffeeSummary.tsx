import { useEffect, useState } from 'react'
import { FLAVORS, type CoffeeDraft, type Lang } from '../types'
import { countryName, localized, useLang, useT, type Dict } from '../i18n'

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

export function originLine(c: CoffeeDraft, t: Dict, lang: Lang) {
  return [countryName(c, lang), c.area].filter(Boolean).join(' · ') || t.common.unknownOrigin
}

export function CoffeeSummary({ coffee, showFlavors = true }: { coffee: CoffeeDraft; showFlavors?: boolean }) {
  const t = useT()
  const lang = useLang()
  const photo = usePhotoUrl(coffee.photo)
  const { notes, processDetail } = localized(coffee, lang)
  const translated = notes.join() !== coffee.notes.join()
  const facts = [
    coffee.process !== 'unknown' && (processDetail || t.process[coffee.process]),
    coffee.roast !== 'unknown' && t.coffee.roastChip(t.roast[coffee.roast]),
    coffee.roastFor !== 'unknown' && t.roastFor[coffee.roastFor],
    coffee.varieties.length > 0 && coffee.varieties.join(', '),
    coffee.altitude && `${coffee.altitude.toLocaleString(lang)} m`,
    coffee.producer,
    coffee.scaScore && `SCA ${coffee.scaScore}`,
  ].filter(Boolean) as string[]
  const flavors = FLAVORS.filter((f) => coffee.flavors[f] > 0).sort((a, b) => coffee.flavors[b] - coffee.flavors[a])

  return (
    <div className="card">
      <div className="coffee-head">
        {photo && <img className="thumb" src={photo} alt="" />}
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
