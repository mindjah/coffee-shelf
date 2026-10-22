// Turns label text (from on-device OCR or typed notes) into a CoffeeDraft with plain rules and
// the lexicon — no AI. Results are a starting point the user reviews in the editor.
import {
  ALTITUDE_WORDS, AREA_WORDS, COUNTRIES, DESCRIPTOR_LIST, NOTES_HEADERS, PROCESS_TERMS, PRODUCER_WORDS,
  ROASTER_WORDS, ROAST_WORDS, VARIETIES, VARIETY_WORDS, normalize, type Country, type Descriptor,
} from './lexicon'
import { sameWord } from './fuzzy'
import { GENERIC_WORDS as GENERIC_ROASTER_WORDS } from './roaster'
import { FLAVORS, type CoffeeDraft, type Flavor, type Lang, type Process, type Region, type Roast, type RoastFor, type Structure } from './types'

const L = '\\p{L}\\p{N}'

/** Regex for one alias against normalized text; "word*" also matches inflected endings. */
function aliasRegex(alias: string): RegExp {
  const a = normalize(alias)
  const parts = a.split(/\s+/).map((w) => {
    const prefix = w.endsWith('*')
    const body = (prefix ? w.slice(0, -1) : w).replace(/[.*+?^${}()|[\]\\-]/g, (c) => (c === '-' ? '[-\\s]?' : `\\${c}`))
    return prefix ? `${body}[${L}]*` : body
  })
  return new RegExp(`(?<![${L}])${parts.join('\\s+')}(?![${L}])`, 'gu')
}

const cache = new Map<string, RegExp>()
function find(text: string, alias: string): RegExpExecArray | null {
  let re = cache.get(alias)
  if (!re) cache.set(alias, (re = aliasRegex(alias)))
  re.lastIndex = 0
  return re.exec(text)
}
const hasAny = (text: string, aliases: string[]) => aliases.some((a) => find(text, a))

// --- descriptors -------------------------------------------------------------

export interface FoundNote {
  descriptor: Descriptor
  /** Wording as it appears in the source text. */
  original: string
  index: number
}

/** Finds tasting descriptors in order of appearance; longer phrases win over words inside them. */
export function findNotes(raw: string): FoundNote[] {
  let text = normalize(raw)
  const found: FoundNote[] = []
  const candidates = DESCRIPTOR_LIST.flatMap((d) => d.aliases.map((alias) => ({ d, alias })))
    .sort((a, b) => b.alias.length - a.alias.length)
  for (const { d, alias } of candidates) {
    if (found.some((f) => f.descriptor === d)) continue
    const m = find(text, alias)
    if (!m) continue
    // normalize() keeps string length, so indices map back onto the original text.
    found.push({ descriptor: d, original: raw.slice(m.index, m.index + m[0].length), index: m.index })
    text = text.slice(0, m.index) + ' '.repeat(m[0].length) + text.slice(m.index + m[0].length)
  }
  return found.sort((a, b) => a.index - b.index)
}

/**
 * A tasting note in another language when the whole note is one dictionary note ("Земляника" →
 * "Fresa"); undefined for anything more ("Абрикосовый джем" would lose the jam).
 */
export function translateNote(note: string, lang: Lang): string | undefined {
  const text = note.trim()
  const found = findNotes(text)
  return found.length === 1 && found[0].original.length === text.length ? found[0].descriptor[lang] : undefined
}

const emptyFlavors = () => Object.fromEntries(FLAVORS.map((f) => [f, 0])) as Record<Flavor, number>

/** Flavor profile (0–1) from descriptors; earlier notes count more, as on the label. */
export function flavorsFromNotes(notes: FoundNote[]): Record<Flavor, number> {
  const out = emptyFlavors()
  notes.forEach((n, i) => {
    const weight = i < 2 ? 3 : i < 4 ? 2 : 1
    n.descriptor.cats.forEach((c, j) => (out[c] = Math.max(out[c], j === 0 ? weight : Math.max(1, weight - 1))))
  })
  for (const f of FLAVORS) out[f] /= 3
  return out
}

/** Typical profile when a bag lists no notes: rough origin, process and roast tendencies. */
export function estimateFlavors(region: Region, process: Process, roast: Roast): Record<Flavor, number> {
  const f = emptyFlavors()
  const add = (k: Flavor, n: number) => (f[k] += n)
  switch (region) {
    case 'east-africa': add('citrus', 2); add('floral', 2); add('tea', 1); add('berry', 1); break
    case 'other-africa': add('berry', 1); add('citrus', 1); add('sweet', 1); break
    case 'central-america': add('sweet', 2); add('chocolate', 1); add('citrus', 1); add('stoneFruit', 1); break
    case 'south-america': add('chocolate', 2); add('nutty', 2); add('sweet', 1); break
    case 'asia-pacific': add('spice', 1); add('roasty', 1); add('green', 1); add('chocolate', 1); break
    default: add('chocolate', 1); add('sweet', 1); add('nutty', 1)
  }
  if (process === 'natural') { add('berry', 2); add('driedFruit', 1); add('fermented', 1) }
  if (process === 'honey') { add('sweet', 1); add('stoneFruit', 1) }
  if (process === 'anaerobic') { add('fermented', 2); add('berry', 1); add('stoneFruit', 1) }
  if (roast === 'medium-dark' || roast === 'dark') {
    add('roasty', 2); add('chocolate', 1)
    for (const k of ['berry', 'citrus', 'floral', 'stoneFruit'] as Flavor[]) f[k] = Math.max(0, f[k] - 1)
  }
  for (const k of FLAVORS) f[k] = Math.min(3, f[k]) / 3
  return f
}

// --- countries ---------------------------------------------------------------

export function findCountries(raw: string): Country[] {
  const text = normalize(raw)
  return COUNTRIES.map((c) => ({ c, at: Math.min(...c.aliases.map((a) => find(text, a)?.index ?? Infinity)) }))
    .filter((x) => x.at !== Infinity)
    .sort((a, b) => a.at - b.at)
    .map((x) => x.c)
}

// --- the label ---------------------------------------------------------------

const lines = (raw: string) => raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

/** Value after "Label:" on the first line that starts with one of the label words. */
function labelled(all: string[], words: string[]): string {
  for (const line of all) {
    const n = normalize(line)
    for (const w of words) {
      const m = find(n, w)
      if (m && m.index < 4) {
        const rest = line.slice(m.index + m[0].length).replace(/^[\s:–—-]+/, '').trim()
        const own = segments(rest).filter((seg) => !otherField(seg))[0]
        if (own) return own.slice(0, 60)
      }
    }
  }
  return ''
}

/** Labels often pack several facts on one line ("Natural | SCA 87 pts"); split them apart. */
function segments(s: string): string[] {
  return s.split(/\s*[|·•;/]\s*|\s+[-–—]\s+|\s{3,}/).map((x) => x.trim()).filter(Boolean)
}

/** A piece of a line that belongs to another field and must not leak into this one. */
function otherField(seg: string): boolean {
  const n = normalize(seg)
  return findScore(seg) != null || findAltitude(seg) != null || SCA_WORD.test(seg)
    || hasAny(n, ROAST_WORDS) || hasAny(n, VARIETY_WORDS) || hasAny(n, ALTITUDE_WORDS)
}

// OCR reading Latin and Cyrillic at once can mix look-alike letters inside one word ("SСА"),
// so words are mapped to whichever alphabet most of their letters are in.
const LAT_TO_CYR: Record<string, string> = { a: 'а', c: 'с', e: 'е', o: 'о', p: 'р', x: 'х', y: 'у', k: 'к', m: 'м', t: 'т', h: 'н', b: 'в', A: 'А', C: 'С', E: 'Е', O: 'О', P: 'Р', X: 'Х', Y: 'У', K: 'К', M: 'М', T: 'Т', H: 'Н', B: 'В' }
const CYR_TO_LAT: Record<string, string> = Object.fromEntries(Object.entries(LAT_TO_CYR).map(([l, c]) => [c, l]))

export function fixMixedScript(text: string): string {
  return text.replace(/[\p{L}]+/gu, (w) => {
    const lat = (w.match(/[A-Za-z]/g) ?? []).length
    const cyr = (w.match(/[\u0400-\u04FF]/g) ?? []).length
    if (!lat || !cyr) return w
    const map = lat >= cyr ? CYR_TO_LAT : LAT_TO_CYR
    return [...w].map((ch) => map[ch] ?? ch).join('')
  })
}

function findProcess(all: string[]): { process: Process; detail: string } {
  for (const [process, terms] of PROCESS_TERMS) {
    const line = all.find((l) => hasAny(normalize(l), terms))
    if (!line) continue
    // Keep only the processing part of the line, not a score or altitude printed beside it.
    const detail = segments(line.replace(/^[^:]{0,20}:\s*/, ''))
      .filter((seg) => !otherField(seg))
      .join(', ')
      .slice(0, 60)
    // A bare "Lavado"/"Washed" adds nothing over the translated process name, so drop it.
    return { process, detail: detail.split(/\s+/).length <= 2 ? '' : detail }
  }
  return { process: 'unknown', detail: '' }
}

function findRoast(all: string[], text: string): { roast: Roast; roastFor: RoastFor } {
  // Only read levels on roast lines, so "dark chocolate" doesn't count as a dark roast.
  const roastLines = all.map(normalize).filter((l) => hasAny(l, ROAST_WORDS)).join(' ')
  const level = (): Roast => {
    if (!roastLines) return 'unknown'
    if (hasAny(roastLines, ['medium light', 'medium-light', 'light medium', 'medio claro', 'средне-светл*', 'светло-средн*'])) return 'medium-light'
    if (hasAny(roastLines, ['medium dark', 'medium-dark', 'medio oscuro', 'средне-темн*'])) return 'medium-dark'
    if (hasAny(roastLines, ['light', 'claro', 'clara', 'светл*', 'nordic', 'filter roast'])) return 'light'
    if (hasAny(roastLines, ['dark', 'oscuro', 'oscura', 'темн*'])) return 'dark'
    if (hasAny(roastLines, ['medium', 'medio', 'media', 'средн*'])) return 'medium'
    return 'unknown'
  }
  const n = normalize(text)
  const espresso = hasAny(n, ['espresso', 'эспрессо'])
  const filter = hasAny(n, ['filter', 'filtro', 'фильтр*', 'pour over', 'v60', 'аэропресс*', 'aeropress'])
  const omni = hasAny(n, ['omni*', 'омни*'])
  return { roast: level(), roastFor: omni || (espresso && filter) ? 'omni' : espresso ? 'espresso' : filter ? 'filter' : 'unknown' }
}

function findAltitude(text: string): number | null {
  const unit = String.raw`(?:m\.?\s?a\.?\s?s\.?\s?l\.?|masl|m\.?\s?s\.?\s?n\.?\s?m\.?|msnm|meters?|metres?|metros|м(?:етр[а-я]*)?|m)`
  const num = String.raw`(\d{1,2}[.,\s]?\d{3})`
  const range = new RegExp(String.raw`${num}(?:\s*(?:-|–|—|to|a|до)\s*${num})?\s*${unit}(?![\p{L}])`, 'iu')
  const keyword = new RegExp(String.raw`(?:altitude|elevation|altura|altitud|высота)\D{0,15}${num}(?:\s*(?:-|–|—|to|a|до)\s*${num})?`, 'iu')
  const m = text.match(range) ?? text.match(keyword)
  if (!m) return null
  const vals = [m[1], m[2]].filter(Boolean).map((v) => Number(v.replace(/[.,\s]/g, ''))).filter((v) => v >= 500 && v <= 3000)
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null
}

/** "SCA" as OCR may return it: "S.C.A.", Cyrillic look-alikes ("SСА"), or 5/$ for S. */
const SCA_WORD = /(?<![\p{L}])[sѕ5$]\.?\s?[cс]\.?\s?[aа]{1,2}\.?(?![\p{L}])/iu

/** Cupping score (80–99) written as "SCA 87", "Q-grade 86", "Каппинг 88" or "87 points / puntos / баллов". */
function findScore(text: string): number | null {
  const score = String.raw`((?:8\d|9\d)(?:[.,]\d{1,2})?)`
  const before = new RegExp(String.raw`(?:${SCA_WORD.source}|(?<![\p{L}])(?:score|q[\s-]?grade|cupping|puntaje|puntuaci[oó]n|каппинг[а-я]*|оценк[а-я]*|балл[а-я]*))\D{0,12}` + score, 'iu')
  const after = new RegExp(score + String.raw`\+?\s*(?:points?|pts\.?|puntos|балл[а-я]*)(?![\p{L}])`, 'iu')
  const m = text.match(before) ?? text.match(after)
  return m ? Number(m[1].replace(',', '.')) : null
}

function findStructure(text: string): Structure {
  const n = normalize(text)
  const level = (subject: string[], high: string[], low: string[]): number | null => {
    const near = n.split(/[\n.;]/).filter((s) => hasAny(s, subject)).join(' ')
    if (!near) return null
    if (hasAny(near, high)) return 4
    if (hasAny(near, low)) return 2
    return 3
  }
  return {
    acidity: level(['acidity', 'acidez', 'кислотност*'], ['high', 'bright', 'vibrant', 'juicy', 'alta', 'brillante', 'высок*', 'ярк*', 'сочн*'], ['low', 'soft', 'mild', 'baja', 'suave', 'низк*', 'мягк*']),
    body: level(['body', 'cuerpo', 'тело', 'плотност*'], ['full', 'heavy', 'rich', 'syrupy', 'completo', 'denso', 'плотн*', 'насыщенн*'], ['light', 'delicate', 'ligero', 'лег*']),
    sweetness: level(['sweetness', 'dulzor', 'сладост*'], ['high', 'alta', 'высок*'], ['low', 'baja', 'низк*']),
  }
}

/** Notes section if the label has one ("Tasting notes: …"), otherwise the whole text. */
function notesText(all: string[]): string {
  const i = all.findIndex((l) => {
    const m = NOTES_HEADERS.map((h) => find(normalize(l), h)).find(Boolean)
    return m && m.index < 4
  })
  return i === -1 ? all.join('\n') : all.slice(i, i + 4).join('\n')
}

function findVarieties(all: string[], text: string): string[] {
  const n = normalize(text)
  const found = VARIETIES.filter((v) => find(n, v)).filter((v, _, arr) => !arr.some((o) => o !== v && o.includes(v)))
  if (found.length) return [...new Set(found)]
  const line = labelled(all, VARIETY_WORDS)
  return line ? line.split(/[,/&+]/).map((s) => s.trim()).filter(Boolean) : []
}

/** What's already on your shelf, to recognise a roaster or a coffee in noisy text. */
export interface ParseHints {
  roasters?: string[]
  coffees?: { roaster: string; name: string }[]
}

/** Product formats and series words, not a coffee's name ("Drip Coffee", "Specialty Coffee"). */
const FORMAT_WORDS = ['drip', 'coffee', 'cafe', 'кофе', 'дрип*', 'specialty', 'speciality', 'arabica', 'арабика', 'whole bean*', 'ground', 'молот*', 'зерн*', 'filter', 'espresso', 'фильтр', 'эспрессо', 'grano', 'molido']
/** Labels that open the details block ("Variety: …", "Process: …"); the coffee's name sits above it. */
const DETAIL_LABELS = [...VARIETY_WORDS, ...ALTITUDE_WORDS, ...NOTES_HEADERS, ...ROAST_WORDS, ...PRODUCER_WORDS, ...AREA_WORDS, 'process', 'proceso', 'обработк*', 'beneficio', 'выдержк*', 'origin', 'origen', 'происхожден*']

/**
 * The readable words of an OCR line, without the scraps around them: pieces of the artwork and QR
 * codes come out as short odd tokens ("| (E yo", "= 5"). Empty when the line is mostly scraps.
 */
function cleanLine(line: string): string {
  const tokens = line.split(/\s+/).filter(Boolean)
  const isWord = (t: string) => /^\p{L}([\p{L}'’&-]*\p{L})?$/u.test(t)
  const strong = (t: string) => isWord(t) && t.replace(/[^\p{L}]/gu, '').length >= 3
  // Scraps go; short words stay between real ones ("Кофейня на паях"), not at the edges.
  const first = tokens.findIndex(strong)
  const last = tokens.findLastIndex(strong)
  const words = first < 0 ? [] : tokens.slice(first, last + 1).filter(isWord)
  const letters = words.join('').length
  const all = tokens.join('').length
  return words.length && letters >= 4 && letters / all >= 0.6 ? words.join(' ') : ''
}

/** Look-alike letters folded together, so an OCR "BOPKA" (Latin) still matches "ВОРКА" (Cyrillic). */
const skeleton = (w: string) => [...normalize(w)].map((ch) => CYR_TO_LAT[ch] ?? ch).join('')

const textWords = (text: string) => normalize(text).split(/[^\p{L}\p{N}]+/u).filter((w) => w.length >= 3).map(skeleton)

/** Words that identify a name: no generic, format or origin words. */
function keyWords(name: string): string[] {
  return normalize(name).split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length >= 3 && !GENERIC_ROASTER_WORDS.has(w) && !hasAny(w, FORMAT_WORDS) && !findCountries(w).length)
    .map(skeleton)
}

/**
 * The known name most of whose words are in the text: all of them, or all but one of 3+. With
 * `oneLongWord`, a single distinctive word of 5+ letters is enough (roaster names, where a logo
 * often hides the rest: "CATHERINE" of "The Welder Catherine").
 */
function recognise(names: string[], words: string[], oneLongWord = false): string | undefined {
  let best: { name: string; hits: number } | undefined
  for (const name of names) {
    const key = keyWords(name)
    if (!key.length || key.join('').length < 4) continue
    const found = key.filter((k) => words.some((w) => sameWord(k, w)))
    const hits = found.length
    const enough = hits === key.length || (key.length >= 3 && hits >= key.length - 1) || (oneLongWord && found.some((k) => k.length >= 5))
    if (enough && hits > (best?.hits ?? 0)) best = { name, hits }
  }
  return best?.name
}

/**
 * Best guess at roaster and coffee name. A roaster or coffee already on your shelf is recognised
 * first. Otherwise: a labelled roaster line, and for the name the line that looks most like one —
 * just above the details block, naming an origin plus more, or right under a series title such as
 * "Drip Coffee" — falling back to the first plain lines as printed.
 */
function findNames(all: string[], skip: (l: string) => boolean, hints: ParseHints): { roaster: string; name: string } {
  const words = textWords(all.join(' '))
  let knownRoaster = recognise(hints.roasters ?? [], words, true)
  const coffees = hints.coffees ?? []
  const ownCoffees = coffees.filter((c) => !knownRoaster || c.roaster.trim() === knownRoaster)
  const knownName = recognise(ownCoffees.map((c) => c.name), words)
  // A coffee recognised from the shelf brings its roaster along when the logo didn't read.
  knownRoaster ??= knownName ? coffees.find((c) => c.name === knownName)?.roaster.trim() || undefined : undefined

  const roaster = knownRoaster ?? labelled(all, ROASTER_WORDS)
  const plain = all.filter((l) => /\p{L}{3}/u.test(l) && l.length <= 40 && !/[:\d]{2,}/.test(l) && !skip(l))
  const rest = plain.map(cleanLine).filter((l) => l && l !== roaster
    && !l.split(' ').every((w) => hasAny(normalize(w), FORMAT_WORDS)) // "Drip Coffee" names neither
    && !(knownRoaster && recognise([knownRoaster], textWords(l), true)))
  // Many bags are simply named after the origin ("Brazil Cerrado"), which the filter above skips.
  const originLine = all.find((l) => l.length <= 40 && findCountries(l).length > 0 && !/:/.test(l)) ?? ''
  if (knownName) return { roaster: roaster || rest[0] || '', name: knownName }

  const firstDetail = all.findIndex((l) => DETAIL_LABELS.some((w) => (find(normalize(l), w)?.index ?? 99) < 6))
  let best: { name: string; score: number } | undefined
  all.forEach((line, i) => {
    const clean = cleanLine(line)
    if (!clean || /:/.test(line) || clean === roaster || hasAny(normalize(clean), DETAIL_LABELS)) return
    const n = normalize(clean)
    const named = clean.split(' ').filter((w) => !findCountries(w).length && !hasAny(normalize(w), FORMAT_WORDS))
    if (!named.length) return // only format or origin words
    let score = 0
    if (firstDetail > 0 && i < firstDetail && firstDetail - i <= 2) score += 3
    if (findCountries(n).length && named.length) score += 2
    const prev = all.slice(Math.max(0, i - 2), i).map(cleanLine).filter(Boolean).pop()
    if (prev && hasAny(normalize(prev), FORMAT_WORDS)) score += 1
    if (score > (best?.score ?? 0)) best = { name: clean, score }
  })
  const fallback = (roaster ? rest[0] : rest[1]) || originLine
  return { roaster: roaster || rest[0] || '', name: best?.name ?? fallback }
}

export function parseLabel(raw: string, hints: ParseHints = {}): CoffeeDraft {
  const all = lines(fixMixedScript(raw))
  const text = all.join('\n')
  const countries = findCountries(text)
  const { process, detail } = findProcess(all)
  const { roast, roastFor } = findRoast(all, text)
  const region: Region = countries.length > 1 ? 'blend' : countries[0]?.region ?? 'unknown'

  let notes = findNotes(notesText(all))
  // "Miel" on a honey-process bag is the process, not a tasting note.
  if (process === 'honey') notes = notes.filter((n) => n.descriptor.en !== 'Honey' || hasAny(normalize(notesText(all)), ['notas', 'notes', 'дескриптор*']))
  const flavorsEstimated = notes.length === 0

  const fieldLine = (l: string) => {
    const n = normalize(l)
    return [...PROCESS_TERMS.flatMap(([, t]) => t), ...ROAST_WORDS, ...ALTITUDE_WORDS, ...AREA_WORDS, ...PRODUCER_WORDS, ...VARIETY_WORDS, ...NOTES_HEADERS].some((w) => find(n, w))
      || findCountries(l).length > 0 || findNotes(l).length > 0
  }
  const { roaster, name } = findNames(all, fieldLine, hints)
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  return {
    roaster,
    name,
    country: countries.map((c) => new Intl.DisplayNames(['en'], { type: 'region' }).of(c.code) ?? c.code).join(' / '),
    countryCodes: countries.map((c) => c.code),
    area: labelled(all, AREA_WORDS),
    producer: labelled(all, PRODUCER_WORDS),
    varieties: findVarieties(all, text),
    process,
    processDetail: detail,
    altitude: findAltitude(text),
    roast,
    roastFor,
    region,
    notes: notes.map((n) => cap(n.original)),
    translations: {
      en: { notes: notes.map((n) => n.descriptor.en), processDetail: '' },
      ru: { notes: notes.map((n) => n.descriptor.ru), processDetail: '' },
      es: { notes: notes.map((n) => n.descriptor.es), processDetail: '' },
    },
    flavors: flavorsEstimated ? estimateFlavors(region, process, roast) : flavorsFromNotes(notes),
    flavorsEstimated,
    structure: findStructure(text),
    scaScore: findScore(text),
  }
}

/** Country codes and origin group for a typed country name, if recognised. */
export function lookupCountry(name: string): { codes: string[]; region: Region } | null {
  const found = findCountries(name)
  if (!found.length) return null
  return { codes: found.map((c) => c.code), region: found.length > 1 ? 'blend' : found[0].region }
}

/** Starting point for a coffee entered by hand. */
export function emptyDraft(): CoffeeDraft {
  return {
    roaster: '', name: '', country: '', countryCodes: [], area: '', producer: '', varieties: [],
    process: 'unknown', processDetail: '', altitude: null, roast: 'unknown', roastFor: 'unknown', region: 'unknown',
    notes: [], flavors: Object.fromEntries(FLAVORS.map((f) => [f, 0])) as Record<Flavor, number>, flavorsEstimated: false,
    structure: { acidity: null, body: null, sweetness: null }, scaScore: null,
  }
}

/** Nothing entered yet — e.g. a manual entry cancelled straight away. */
export const isBlankDraft = (d: CoffeeDraft) =>
  !d.roaster && !d.name && !d.country && !d.notes.length && FLAVORS.every((f) => !d.flavors[f]) && !d.photo
