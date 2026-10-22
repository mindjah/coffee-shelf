// A coffee can be rated once per brew method (V60 and AeroPress taste different). `rating` stays
// the best of them, so lists, sorting, filters and comparisons keep working with one number.
import { BREWS, type Brew, type Coffee } from './types'

type Rated = Pick<Coffee, 'rating' | 'ratings' | 'brewedWith'>

export interface MethodRating {
  /** Null for a rating given before brew methods were asked, not yet assigned to one. */
  brew: Brew | null
  rating: number
}

export function methodRatings(c: Rated): MethodRating[] {
  const entries = BREWS.filter((b) => c.ratings?.[b] != null).map((brew) => ({ brew, rating: c.ratings![brew]! }))
  if (entries.length) return entries
  return c.rating != null ? [{ brew: c.brewedWith ?? null, rating: c.rating }] : []
}

/** The rating given with this method, if any. */
export const ratingFor = (c: Rated, brew: Brew): number | null => methodRatings(c).find((m) => m.brew === brew)?.rating ?? null

/** An old rating not tied to a method yet. */
export const unassignedRating = (c: Rated): number | null => methodRatings(c).find((m) => m.brew == null)?.rating ?? null

/**
 * The fields to save after rating with `brew` (null `value` clears that method's rating). An old
 * rating without a method is replaced: it was the first rating, now given a method.
 */
export function withMethodRating(c: Rated, brew: Brew, value: number | null): Pick<Coffee, 'ratings' | 'rating' | 'ratedAt' | 'brewedWith'> {
  const ratings: Partial<Record<Brew, number>> = {}
  for (const m of methodRatings(c)) if (m.brew) ratings[m.brew] = m.rating
  if (value == null) delete ratings[brew]
  else ratings[brew] = value
  const values = Object.values(ratings)
  return { ratings, rating: values.length ? Math.max(...values) : null, ratedAt: values.length ? Date.now() : null, brewedWith: brew }
}
