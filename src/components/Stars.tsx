import { StarIcon } from './icons'
import { useT } from '../i18n'

interface Props {
  value: number | null
  onChange?: (v: number) => void
  small?: boolean
}

/** Half-star rating; tapping the left half of a star gives x.5. */
export function Stars({ value, onChange, small }: Props) {
  const t = useT()
  const v = value ?? 0
  return (
    <div className={`stars${small ? ' small' : ''}`} role={onChange ? 'slider' : 'img'} aria-label={t.common.rating(v)} aria-valuenow={v} aria-valuemin={0} aria-valuemax={5}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, v - (i - 1)))
        return (
          <button
            key={i}
            type="button"
            className="star"
            disabled={!onChange}
            tabIndex={onChange ? 0 : -1}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              onChange?.(e.clientX - r.left < r.width / 2 ? i - 0.5 : i)
            }}
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
