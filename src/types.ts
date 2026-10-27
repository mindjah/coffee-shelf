export const FLAVORS = [
  'berry', 'citrus', 'stoneFruit', 'driedFruit', 'floral', 'tea',
  'sweet', 'chocolate', 'nutty', 'spice', 'fermented', 'roasty', 'green',
] as const
export type Flavor = (typeof FLAVORS)[number]


export const PROCESSES = ['washed', 'natural', 'honey', 'anaerobic', 'other', 'unknown'] as const
export type Process = (typeof PROCESSES)[number]

export const ROASTS = ['light', 'medium-light', 'medium', 'medium-dark', 'dark', 'unknown'] as const
export type Roast = (typeof ROASTS)[number]

export const ROAST_FOR = ['filter', 'espresso', 'omni', 'unknown'] as const
export type RoastFor = (typeof ROAST_FOR)[number]

/** How a coffee was brewed when it was rated. */
export const BREWS = ['v60', 'aeropress'] as const
export type Brew = (typeof BREWS)[number]

export const REGIONS = ['east-africa', 'other-africa', 'central-america', 'south-america', 'asia-pacific', 'blend', 'unknown'] as const
export type Region = (typeof REGIONS)[number]


/** 1–5 scale, null when the bag doesn't say. */
export interface Structure {
  acidity: number | null
  body: number | null
  sweetness: number | null
}

export interface Coffee {
  id?: number
  createdAt: number
  /** JPEG bytes. Stored as ArrayBuffer because WebKit can refuse Blobs in IndexedDB. */
  photo?: ArrayBuffer
  /** A second picture, just for looks (e.g. the bag's front); `photo` stays the one the label is read from. */
  cover?: ArrayBuffer
  /** Which picture stands for the bag on the shelf and in lists; the cover one when there is one, unless 'label'. */
  coverFrom?: 'label' | 'cover'
  roaster: string
  name: string
  country: string
  /** ISO 3166-1 alpha-2, so country names can be shown in the app language. Missing on early scans. */
  countryCodes?: string[]
  area: string
  producer: string
  varieties: string[]
  process: Process
  processDetail: string
  altitude: number | null
  roast: Roast
  roastFor: RoastFor
  region: Region
  /** As printed on the bag, in the bag's language. */
  notes: string[]
  translations?: Partial<Record<Lang, Localized>>
  flavors: Record<Flavor, number>
  /** True when the bag had no tasting notes and the profile was estimated from origin, process and roast. */
  flavorsEstimated: boolean
  structure: Structure
  scaScore: number | null
  /** Net weight of the bag in grams, when printed or entered. */
  weight?: number | null
  /** What you paid for the bag, in `currency` (ISO 4217, e.g. "EUR"). */
  price?: number | null
  currency?: string
  rating: number | null
  ratedAt: number | null
  comment: string
  /** Rating per brew method; `rating` is the best of them. Missing on coffees rated before this. */
  ratings?: Partial<Record<Brew, number>>
  /** Method of the latest rating; on old single ratings, the method they were given with (if set). */
  brewedWith?: Brew | null
  /** Set when moved to the archive: kept, but off the shelf and out of the taste profile. */
  archivedAt?: number | null
}

export const LANGS = ['en', 'ru', 'es'] as const
export type Lang = (typeof LANGS)[number]

/** Text that Claude translates at scan time; the as-printed original stays in the main fields. */
export interface Localized {
  notes: string[]
  processDetail: string
}

export type CoffeeDraft = Omit<Coffee, 'id' | 'createdAt' | 'rating' | 'ratedAt' | 'comment'>
