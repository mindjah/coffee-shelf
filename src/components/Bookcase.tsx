import type { Coffee } from '../types'
import { useT } from '../i18n'
import { CoffeeThumb } from './CoffeeThumb'

const GENERIC_WORDS = new Set(['coffee', 'coffees', 'roaster', 'roasters', 'roastery', 'roasting', 'roasted', 'roastworks', 'cafe', 'café', 'the', 'co', 'company', 'lab', 'кофе', 'кофейня', 'обжарщик', 'обжарка'])

/** One word for the label above a bag: the first distinctive word of the roaster's name. */
function roasterWord(roaster: string): string {
  const words = roaster.replace(/\(.*?\)/g, ' ').split(/[\s&+,.·/-]+/).filter(Boolean)
  return words.find((w) => !GENERIC_WORDS.has(w.toLowerCase())) ?? words[0] ?? ''
}

/**
 * Compact view: bags standing three to a wooden shelf, roaster word above each. `selected` marks
 * bags with a check (Compare's "Add from shelf" uses it for coffees already in the comparison).
 */
export function Bookcase({ coffees, onPick, selected }: { coffees: Coffee[]; onPick: (c: Coffee) => void; selected?: (c: Coffee) => boolean }) {
  const t = useT()
  const shelves: Coffee[][] = []
  for (let i = 0; i < coffees.length; i += 3) shelves.push(coffees.slice(i, i + 3))
  return (
    <div className="bookcase">
      {shelves.map((row, i) => (
        <div className="bookcase-shelf" key={i}>
          <div className="bookcase-row">
            {row.map((c) => (
              <button
                key={c.id}
                className={`bag${selected?.(c) ? ' selected' : ''}`}
                onClick={() => onPick(c)}
                aria-label={`${c.roaster} ${c.name}`.trim()}
                aria-pressed={selected ? selected(c) : undefined}
              >
                <span className="bag-label">{roasterWord(c.roaster) || t.common.unknownRoaster}</span>
                <span className="bag-body">
                  <CoffeeThumb photo={c.photo} className="bag-photo" zoomable={false} />
                  {c.rating != null && <span className="bag-rating">{c.rating.toFixed(1)}</span>}
                  {selected?.(c) && <span className="bag-check" aria-hidden="true">✓</span>}
                </span>
              </button>
            ))}
          </div>
          <div className="plank" />
        </div>
      ))}
    </div>
  )
}
