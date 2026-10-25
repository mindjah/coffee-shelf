export interface Article {
  title: string
  /** One-line gist, shown while the article is folded. */
  lead: string
  /** Key numbers as [label, value]: ratio, grind, time… */
  facts?: [string, string][]
  text?: string[]
  /** Numbered instructions. */
  steps?: string[]
  /**
   * A brew recipe's timer, one entry per step: how many seconds the step lasts before the next one
   * starts on its own, or null for a step you finish yourself (tap Next). Makes the article brewable.
   */
  timer?: (number | null)[]
  /** Term and its explanation, shown stacked. */
  terms?: [string, string][]
  tip?: string
  /** A schematic drawing from figures.tsx, shown above the body. */
  figure?: string
  /** What each numbered callout on the figure points at: [part, what it does]. */
  parts?: [string, string][]
}

export interface Chapter {
  id: string
  title: string
  summary: string
  articles: Article[]
}

export type Book = Chapter[]
