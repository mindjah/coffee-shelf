import { useEffect, useRef, useState } from 'react'
import type { Coffee } from '../types'
import { useT } from '../i18n'
import { CoffeeThumb } from './CoffeeThumb'
import { GENERIC_WORDS } from '../roaster'


let canvas: CanvasRenderingContext2D | null | undefined

/** Width of a label as rendered by .bag-label: 11px bold uppercase with 0.08em letter spacing. */
function labelWidth(text: string): number {
  if (canvas === undefined) canvas = document.createElement('canvas').getContext('2d')
  if (!canvas) return text.length * 8
  canvas.font = '700 11px -apple-system, system-ui, sans-serif'
  const upper = text.toUpperCase()
  return canvas.measureText(upper).width + upper.length * 0.88
}

/** Small joining words a label shouldn't end on ("Granja La …"). */
const CONNECTORS = new Set(['la', 'el', 'los', 'las', 'de', 'del', 'da', 'do', 'the', 'of', 'and', 'y', 'e', 'и', 'в', 'на'])
const bare = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')

/**
 * Label above a bag: the whole roaster name when it fits the bag's width; otherwise the run of
 * consecutive words that fits and carries the most text ("Tim Wendelboe" → "Wendelboe", "Square
 * Mile Coffee Roasters" → "Square Mile"), skipping runs made only of generic words or ending on a
 * joining word. Bracketed bits like "(UA)" are dropped. At worst one word, cut with an ellipsis by CSS.
 */
function roasterLabel(roaster: string, maxWidth: number): string {
  const words = roaster.replace(/\(.*?\)/g, ' ').split(/\s+/).filter(Boolean)
  if (!words.length) return ''
  if (!maxWidth || labelWidth(words.join(' ')) <= maxWidth) return words.join(' ')
  let best = ''
  let bestScore = -1
  for (let i = 0; i < words.length; i++) {
    for (let j = i; j < words.length; j++) {
      const run = words.slice(i, j + 1)
      const text = run.join(' ')
      if (labelWidth(text) > maxWidth) break
      if (run.every((w) => GENERIC_WORDS.has(bare(w))) || CONNECTORS.has(bare(run[run.length - 1]))) continue
      const score = run.filter((w) => !GENERIC_WORDS.has(bare(w))).join('').length
      if (score > bestScore) [best, bestScore] = [text, score]
    }
  }
  // Nothing fits whole: the longest distinctive word, which CSS will trim with an ellipsis.
  return best || words.filter((w) => !GENERIC_WORDS.has(bare(w))).sort((x, y) => y.length - x.length)[0] || words[0]
}

/** Width of one bag slot, kept up to date as the screen size changes. */
function useBagWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWidth(el.querySelector('.bag')?.clientWidth ?? 0)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, width }
}

/**
 * Compact view: bags standing three to a wooden shelf, roaster name above each (as much as fits). `selected` marks
 * bags with a check (Compare's "Add from shelf" uses it for coffees already in the comparison).
 */
export function Bookcase({ coffees, onPick, selected }: { coffees: Coffee[]; onPick: (c: Coffee) => void; selected?: (c: Coffee) => boolean }) {
  const t = useT()
  const { ref, width } = useBagWidth()
  const shelves: Coffee[][] = []
  for (let i = 0; i < coffees.length; i += 3) shelves.push(coffees.slice(i, i + 3))
  return (
    <div className="bookcase" ref={ref}>
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
                <span className="bag-label">{roasterLabel(c.roaster, width) || t.common.unknownRoaster}</span>
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
