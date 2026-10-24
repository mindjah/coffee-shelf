import { useRef, useState, type PointerEvent } from 'react'
import { StarIcon } from './icons'
import { useT } from '../i18n'

interface Props {
  value: number | null
  onChange?: (v: number) => void
  small?: boolean
}

/** The half-star value under a finger at `x`: left half of a star gives x.5, past the ends 0.5 or 5. */
function valueAt(row: HTMLElement, x: number): number {
  const stars = [...row.querySelectorAll<HTMLElement>('.star')].map((s) => s.getBoundingClientRect())
  if (x <= stars[0].left) return 0.5
  for (const [i, r] of stars.entries()) {
    if (x < r.right) return x - r.left < r.width / 2 ? i + 0.5 : i + 1
    // In the gap before the next star: the star just passed, full.
    if (stars[i + 1] && x < stars[i + 1].left) return i + 1
  }
  return 5
}

/**
 * Half-star rating. Tap a star, or slide a finger along the row: the stars follow the finger and
 * the rating is set when it lifts. Vertical swipes still scroll the page.
 */
export function Stars({ value, onChange, small }: Props) {
  const t = useT()
  const [sliding, setSliding] = useState<number | null>(null)
  const row = useRef<HTMLDivElement>(null)
  const v = sliding ?? value ?? 0

  // The value under the finger, kept in a ref too: a quick tap lifts before React re-renders.
  const live = useRef<number | null>(null)
  const move = (e: PointerEvent) => {
    if (!row.current) return
    live.current = valueAt(row.current, e.clientX)
    setSliding(live.current)
  }
  const end = (commit: boolean) => {
    if (commit && live.current != null) onChange?.(live.current)
    live.current = null
    setSliding(null)
  }
  const pointer = onChange && {
    onPointerDown: (e: PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      move(e)
    },
    onPointerMove: (e: PointerEvent) => live.current != null && move(e),
    onPointerUp: () => end(true),
    // The page took the gesture to scroll: leave the rating as it was.
    onPointerCancel: () => end(false),
  }

  return (
    <div
      ref={row}
      className={`stars${small ? ' small' : ''}${onChange ? ' rateable' : ''}`}
      role={onChange ? 'slider' : 'img'}
      aria-label={t.common.rating(v)}
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={5}
      {...pointer}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, v - (i - 1)))
        return (
          <button
            key={i}
            type="button"
            className="star"
            disabled={!onChange}
            tabIndex={onChange ? 0 : -1}
            // Pointer taps are handled by the row; this is for the keyboard (detail 0).
            onClick={(e) => e.detail === 0 && onChange?.(i)}
          >
            <StarIcon />
            <span className="fill" style={{ width: `${fill * 100}%` }}>
              <StarIcon />
            </span>
          </button>
        )
      })}
    </div>
  )
}
