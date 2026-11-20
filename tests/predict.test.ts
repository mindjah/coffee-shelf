// Cases that went wrong once, so they stay fixed. Run with `npm test`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { asTasted, bagFacts, buildModel, kin, predict } from '../src/recommend'
import { estimateFlavors, findNotes, flavorsFromNotes } from '../src/parse'
import { roastDate, toDraft, type Bag } from '../src/extract'
import { fillGaps, parseLookup } from '../src/lookup'
import { FLAVORS, type Coffee, type Flavor, type Process, type Region } from '../src/types'

const none = Object.fromEntries(FLAVORS.map((f) => [f, 0])) as Record<Flavor, number>

let nextId = 1
/** A coffee with nothing stated unless given. */
function coffee(o: Partial<Coffee> = {}): Coffee {
  const region: Region = o.region ?? 'unknown'
  const process: Process = o.process ?? 'unknown'
  return {
    id: nextId++, createdAt: 0, roaster: 'Roaster', name: 'Coffee', country: '', countryCodes: [], area: '', producer: '',
    varieties: [], process, processDetail: '', altitude: null, roast: 'unknown', roastFor: 'unknown', region, notes: [],
    flavors: estimateFlavors(region, process, 'unknown'), flavorsEstimated: true, structure: { acidity: null, body: null, sweetness: null },
    scaScore: null, rating: null, ratedAt: null, comment: '', ...o,
  }
}
const noted = (notes: string, o: Partial<Coffee> = {}) => coffee({ notes: [notes], flavors: flavorsFromNotes(findNotes(notes)), flavorsEstimated: false, ...o })
const ethiopia = { country: 'Ethiopia', countryCodes: ['ET'], region: 'east-africa' as Region }

/** A library with a spread of ratings: fruity coffees rated high, chocolatey ones lower. */
function library(): Coffee[] {
  return [
    noted('strawberry, jasmine', { roaster: 'Alpha', name: 'Hambela', ...ethiopia, process: 'natural', rating: 4.5 }),
    noted('blueberry, bergamot', { roaster: 'Alpha', name: 'Guji', ...ethiopia, process: 'washed', rating: 4 }),
    noted('lemon, black tea', { roaster: 'Beta', name: 'Yirgacheffe', ...ethiopia, process: 'washed', rating: 4 }),
    noted('peach, honey', { roaster: 'Beta', name: 'Nyeri', country: 'Kenya', countryCodes: ['KE'], region: 'east-africa', process: 'washed', rating: 4 }),
    noted('chocolate, hazelnut', { roaster: 'Gamma', name: 'Cerrado', country: 'Brazil', countryCodes: ['BR'], region: 'south-america', process: 'natural', rating: 2.5 }),
    noted('cocoa, caramel', { roaster: 'Gamma', name: 'Huila', country: 'Colombia', countryCodes: ['CO'], region: 'south-america', process: 'washed', rating: 3 }),
    noted('dark chocolate, tobacco', { roaster: 'Delta', name: 'Sumatra', country: 'Indonesia', countryCodes: ['ID'], region: 'asia-pacific', process: 'other', rating: 2 }),
    noted('milk chocolate, almond', { roaster: 'Delta', name: 'Huehuetenango', country: 'Guatemala', countryCodes: ['GT'], region: 'central-america', process: 'washed', rating: 3 }),
    noted('raspberry, rose', { roaster: 'Epsilon', name: 'Nyamasheke', country: 'Rwanda', countryCodes: ['RW'], region: 'east-africa', process: 'washed', rating: 4.5 }),
    noted('plum, brown sugar', { roaster: 'Epsilon', name: 'Kayanza', country: 'Burundi', countryCodes: ['BI'], region: 'east-africa', process: 'natural', rating: 3.5 }),
  ]
}

test('a bag that says nothing about the taste gets no prediction', () => {
  const model = buildModel(library())
  const bag = coffee({ roaster: 'Onsaya Coffee', name: 'Santa Rosa', weight: 200 })
  assert.ok(bagFacts(bag) < 2)
  assert.equal(predict(model, bag), null)
})

test('a rated bag that says nothing is nobody\'s "similar"', () => {
  const spicy = coffee({ roaster: 'Underdog', name: 'Spicy Mix', process: 'other', rating: 5, ratedAt: 1 })
  const model = buildModel([...library(), spicy])
  const p = predict(model, noted('pomegranate, plum compote', { roaster: 'Olisipo', name: 'Asman Gayo', country: 'Indonesia', countryCodes: ['ID'], region: 'asia-pacific', process: 'natural' }))!
  assert.ok(!p.similar.some((s) => s.coffee.id === spicy.id))
})

test('origin and process alone: two matching guesses are not "100% similar", and confidence is low', () => {
  const twin = coffee({ roaster: 'Cannaregio', name: 'Gemechu Shonora', ...ethiopia, process: 'washed', rating: 3.5 })
  const model = buildModel([...library(), twin])
  const p = predict(model, coffee({ roaster: 'Onsaya', name: 'Worka Sakaro', ...ethiopia, process: 'washed' }))!
  assert.equal(p.confidence, 'low')
  const s = p.similar.find((x) => x.coffee.id === twin.id)
  assert.ok(!s || s.similarity <= 0.45, `similarity ${s?.similarity}`)
})

test('another lot of the same coffee you rated 5 pulls the guess up and leads the reasons', () => {
  const wicho = coffee({ roaster: 'The Welder Catherine Underdog', name: 'Ethiopia Wicho BBQ Underdog', ...ethiopia, process: 'washed', rating: 5 })
  const model = buildModel([...library(), wicho])
  const worka = noted('smoky', { roaster: 'The Welder Catherine', name: 'Ethiopia Worka Smoky BBQ', ...ethiopia, process: 'washed' })
  assert.ok(kin(worka, wicho))
  const p = predict(model, worka)!
  assert.ok(p.score >= 4, `score ${p.score}`)
  assert.match(p.reasons[0].id, /^kin:5:/)
})

test('same roaster and country with different names are not the same coffee', () => {
  const a = coffee({ roaster: '25 Coffee Roasters', name: 'Guji G2', ...ethiopia, process: 'washed' })
  const b = coffee({ roaster: '25 Coffee Roasters', name: 'Hanbella', ...ethiopia, process: 'washed' })
  assert.equal(kin(a, b), false)
})

test('a shared named series makes kin; a generic one does not', () => {
  const a = coffee({ roaster: 'Welder', series: 'Unholy Water', name: 'Worka', ...ethiopia })
  const b = coffee({ roaster: 'Welder', series: 'Unholy Water', name: 'Wicho', ...ethiopia })
  assert.ok(kin(a, b))
  assert.equal(kin({ ...a, series: 'Drip Coffee' }, { ...b, series: 'Drip Coffee' }), false)
})

test('no "not Colombia" reasons', () => {
  const lib = [...library(), noted('cherry, cocoa', { roaster: 'Gamma', name: 'Nariño', country: 'Colombia', countryCodes: ['CO'], region: 'south-america', process: 'washed', rating: 5 })]
  const p = predict(buildModel(lib), noted('lemon, jasmine', { name: 'Gesha', country: 'Panama', countryCodes: ['PA'], region: 'central-america', process: 'washed' }))!
  assert.ok(!p.reasons.some((r) => !r.up && r.id.startsWith('country:')))
})

test('a prediction comes with a likely range around it', () => {
  const p = predict(buildModel(library()), noted('blueberry, jasmine', { ...ethiopia, process: 'natural' }))!
  assert.ok(p.range && p.range[0] <= p.score && p.score <= p.range[1])
})

test('flavors you tasted stand in for a bag without notes', () => {
  const plain = coffee({ rating: 4 })
  assert.ok(bagFacts(plain) < 2)
  const tasted = asTasted({ ...plain, tasted: ['berry', 'floral'] as Flavor[] })
  assert.equal(tasted.flavorsEstimated, false)
  assert.ok(tasted.flavors.berry > 0 && tasted.flavors.chocolate === 0)
  assert.ok(bagFacts(tasted) >= 2)
})

/** A model's answer for a bag, with nothing on it unless given. */
function bag(o: Partial<Bag> = {}): Bag {
  const tr = { notes: [], process_detail: '' }
  return {
    is_coffee_bag: true, roaster: 'Onsaya Coffee', series: '', name: 'Santa Rosa', country: '', country_codes: [], area: '', producer: '',
    varieties: [], process: 'unknown', process_detail: '', altitude_masl: null, roast: 'unknown', roast_for: 'unknown', region: 'unknown',
    notes: [], translations: { en: tr, ru: tr, es: tr }, flavors: none, flavors_estimated: true, acidity: null, body: null, sweetness: null,
    sca_score: null, weight_g: 200, roast_date: '', website: '', label_cut_off: false, ...o,
  }
}

test('scan placeholders stay empty: "unknown" country, "(W)" process mark, area repeating the name', () => {
  const d = toDraft(bag({ country: 'unknown', process: 'washed', process_detail: '(W)', area: 'Santa Rosa' }))
  assert.equal(d.country, '')
  assert.equal(d.processDetail, '')
  assert.equal(d.area, '')
})

test('roast dates: no year means the latest such day not in the future', () => {
  const now = new Date(2026, 10, 20)
  assert.equal(roastDate('--10-23', now), new Date(2026, 9, 23).getTime())
  assert.equal(roastDate('--12-01', now), new Date(2025, 11, 1).getTime())
  assert.equal(roastDate('2026-02-30', now), null)
  assert.equal(roastDate('', now), null)
})

test('the web fills only what the bag left out', () => {
  const old = coffee({ ...ethiopia, process: 'washed' })
  const web = { ...coffee({ country: 'Kenya', countryCodes: ['KE'], process: 'natural', altitude: 1900 }), notes: ['peach'], flavors: flavorsFromNotes(findNotes('peach')), flavorsEstimated: false }
  const { next, fields } = fillGaps(old, web)
  assert.deepEqual(next.countryCodes, ['ET'])
  assert.equal(next.process, 'washed')
  assert.equal(next.altitude, 1900)
  assert.deepEqual(next.notes, ['peach'])
  assert.deepEqual(fields.sort(), ['altitude', 'notes'])
})

test('a web answer is read from a JSON block', () => {
  const answer = { ...bag(), found: true, source_url: 'https://onsaya.com/santa-rosa' }
  const parsed = parseLookup(`Here it is:\n\`\`\`json\n${JSON.stringify(answer)}\n\`\`\``)
  assert.equal(parsed.found, true)
  assert.equal(parsed.source_url, 'https://onsaya.com/santa-rosa')
})

test('a web answer missing some fields still counts', () => {
  const parsed = parseLookup('```json\n{"found": true, "source_url": "https://onsaya.com/x", "roaster": "Onsaya", "name": "Santa Rosa", "country": "Colombia", "country_codes": ["CO"], "notes": ["apple"]}\n```')
  assert.equal(parsed.found, true)
  assert.deepEqual(parsed.country_codes, ['CO'])
  assert.equal(parsed.process, 'unknown')
})

test('a recipe counts as its brew method, not the recipe', async () => {
  const { brewOfRecipe } = await import('../src/brew')
  assert.equal(brewOfRecipe('V60 — Tetsu Kasuya’s 4:6 method'), 'v60')
  assert.equal(brewOfRecipe('V60: la receta clásica'), 'v60')
  assert.equal(brewOfRecipe('AeroPress — перевёрнутый способ'), 'aeropress')
  assert.equal(brewOfRecipe('Мой утренний Аэропресс'), 'aeropress')
  assert.equal(brewOfRecipe('Chemex'), null)
})
