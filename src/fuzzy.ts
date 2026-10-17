// Tolerant word comparison for text read off a label, where a letter can come out wrong, go
// missing or be doubled ("Ramirez" / "Ramires", "Martines" / "Martinez").

/** Edits (insert, delete, replace) to turn a into b, giving up once it exceeds `max`. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    let best = i
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      best = Math.min(best, row[j])
    }
    if (best > max) return max + 1
    prev = row
  }
  return prev[b.length]
}

/** Allowed misreadings: none for short words or numbers (lot 74110 ≠ 74112), one or two for longer words. */
function tolerance(a: string, b: string): number {
  const len = Math.min(a.length, b.length)
  if (len < 4 || /\d/.test(a + b)) return 0
  return len >= 8 ? 2 : 1
}

/** Same word, allowing for a misread letter or two. Expects normalize()d words. */
export function sameWord(a: string, b: string): boolean {
  return a === b || distance(a, b, tolerance(a, b)) <= tolerance(a, b)
}

/** Every word of `few` has its own match in `many` (each word of `many` used once). */
export function wordsWithin(few: string[], many: string[]): boolean {
  const left = [...many]
  return few.every((w) => {
    const i = left.findIndex((m) => sameWord(w, m))
    return i >= 0 && !!left.splice(i, 1)
  })
}

/** Same words in the same order, allowing misread letters and words run together or split apart. */
export function samePhrase(a: string[], b: string[]): boolean {
  if (a.length === b.length && a.every((w, i) => sameWord(w, b[i]))) return true
  return sameWord(a.join(''), b.join(''))
}
