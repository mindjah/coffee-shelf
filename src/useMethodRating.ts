// Rating a coffee per brew method, shared by the coffee page and the scan screen: pick V60 or
// AeroPress, and the stars are that method's rating (see ratings.ts for how they're stored).
import { useState } from 'react'
import { methodRatings, ratingFor, unassignedRating, withMethodRating } from './ratings'
import { saveSettings } from './settings'
import type { Brew, Coffee } from './types'

export type Rated = Pick<Coffee, 'rating' | 'ratings' | 'brewedWith'>

/** `apply` saves a patch of the rating fields (to the database, or to a scan not saved yet). */
export function useMethodRating(c: Rated, apply: (patch: Partial<Coffee>) => void) {
  const byMethod = methodRatings(c).filter((m) => m.brew)
  const unassigned = unassignedRating(c)
  // Starts on the method of the latest rating, or on nothing for an unrated coffee or an old
  // rating that was never given a method.
  const [selected, setSelected] = useState<Brew | null>(() => (byMethod.length ? (c.brewedWith ?? byMethod[0].brew) : null))
  /** The stars: the chosen method's rating, or with none chosen the best (or only) rating. */
  const shown = selected ? (ratingFor(c, selected) ?? unassigned) : c.rating

  function pick(b: Brew | null) {
    if (!b) {
      // Tapped the chosen method again: none chosen. A rating given only with that method stays,
      // just without a method (as if it had never been picked).
      const only = byMethod.length === 1 ? byMethod[0].brew : null
      setSelected(null)
      if (only && only === selected) apply({ ratings: undefined, brewedWith: null })
      return
    }
    setSelected(b)
    saveSettings({ brew: b })
    // A rating without a method was given with the method picked now.
    if (unassigned != null) apply(withMethodRating(c, b, unassigned))
  }

  function rate(value: number) {
    if (selected) return apply(withMethodRating(c, selected, value))
    // None chosen on a coffee rated with both: the stars show the best rating, so change that one.
    const best = [...byMethod].sort((a, b) => b.rating - a.rating)[0]?.brew
    if (best) return apply(withMethodRating(c, best, value))
    // No method yet: kept as a rating without one until a method is chosen.
    apply({ rating: value, ratedAt: Date.now(), ratings: undefined, brewedWith: null })
  }

  function clear() {
    if (selected && ratingFor(c, selected) != null) return apply(withMethodRating(c, selected, null))
    apply({ rating: null, ratedAt: null, ratings: undefined, brewedWith: null })
  }

  /** Back to no method chosen, for the next bag on the scan screen. */
  const reset = () => setSelected(null)

  return { selected, shown, byMethod, unassigned, pick, rate, clear, reset }
}
