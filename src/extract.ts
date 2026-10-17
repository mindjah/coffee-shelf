// Provider-neutral part of label reading: what to extract, how to ask for it, and how to
// turn the model's answer into a CoffeeDraft. claude.ts and gemini.ts only handle transport.
import { z } from 'zod'
import { FLAVORS, PROCESSES, REGIONS, ROASTS, ROAST_FOR, type CoffeeDraft, type Flavor } from './types'
import { ScanError } from './errors'

const level = z.number().int().describe('0 = absent, 1 = hint, 2 = clear, 3 = dominant')
const scale = z.number().int().nullable().describe('1 (low) to 5 (high); null if the bag gives no indication')

const Translation = z.object({
  notes: z.array(z.string()).describe('The tasting notes translated, same order; natural wording a coffee taster would use'),
  process_detail: z.string().describe('process_detail translated; empty if none'),
})

export const BagSchema = z.object({
  is_coffee_bag: z.boolean().describe('False if the photos do not show a coffee package or its label'),
  roaster: z.string(),
  name: z.string().describe('Coffee name as printed, e.g. farm, lot or blend name'),
  country: z.string().describe('Origin country in English; for blends list countries joined by " / "'),
  country_codes: z.array(z.string()).describe('ISO 3166-1 alpha-2 code for each origin country, e.g. ["CO"]'),
  area: z.string().describe('Region, washing station or municipality; empty if not printed'),
  producer: z.string().describe('Farm, producer or cooperative; empty if not printed'),
  varieties: z.array(z.string()),
  process: z.enum(PROCESSES),
  process_detail: z.string().describe('Exact process wording, e.g. "anaerobic natural 72h"; empty if none'),
  altitude_masl: z.number().int().nullable().describe('Midpoint if a range is printed'),
  roast: z.enum(ROASTS),
  roast_for: z.enum(ROAST_FOR),
  region: z.enum(REGIONS),
  notes: z.array(z.string()).describe('Tasting notes exactly as printed, in the original language'),
  translations: z.object({ en: Translation, ru: Translation, es: Translation }),
  flavors: z.object(Object.fromEntries(FLAVORS.map((f) => [f, level])) as Record<Flavor, typeof level>),
  flavors_estimated: z.boolean().describe('True if no tasting notes were printed and flavors were estimated'),
  acidity: scale,
  body: scale,
  sweetness: scale,
  sca_score: z.number().nullable(),
})

export const SYSTEM = `You read photos of specialty coffee packaging (front and/or back) and extract structured data for a personal tasting journal.

Transcribe what is printed; do not guess names, producers or altitudes that are not visible. Use empty strings, empty arrays, null or "unknown" for anything missing.

Labels can be in any language — often English, Spanish or Russian, sometimes several on one bag. Keep roaster, coffee name, region, producer and varieties as printed. Fill the translations block with the tasting notes and process wording in English, Russian and Spanish (copy them unchanged when already in that language).

Common Spanish label terms:
- Origen / País = country; Región, Departamento, Municipio, Vereda = area; Finca = farm; Productor, Caficultor, Cooperativa = producer
- Variedad / Varietal = variety (Borbón = Bourbon, Caturra, Castillo, Geisha/Gesha, Pacamara, Típica)
- Altura / Altitud, "msnm" = metres above sea level
- Proceso / Beneficio: Lavado = washed; Natural / Seco = natural; Honey / Miel / Enmielado = honey; Anaeróbico, Fermentación prolongada, Maceración carbónica = anaerobic; Semilavado = other
- Tueste / Tostado: claro = light, medio-claro = medium-light, medio = medium, medio-oscuro = medium-dark, oscuro = dark; "para filtro" = filter, "para espresso" = espresso
- Notas de cata, Perfil de taza, Notas = tasting notes; Acidez = acidity; Cuerpo = body; Dulzor = sweetness; Puntaje / Puntuación SCA = SCA score
Spanish note vocabulary: durazno/melocotón = peach, frutos rojos/frutos del bosque = berries, mora = blackberry, fresa = strawberry, arándano = blueberry, maracuyá = passion fruit, guayaba = guava, mandarina = mandarin, naranja = orange, limón = lemon, panela/piloncillo = raw cane sugar, miel = honey, cacao = cocoa, nuez = walnut, avellana = hazelnut, almendra = almond, ciruela = plum, uva = grape, flor de azahar = orange blossom, té negro = black tea.
Common Russian label terms: мытая = washed, натуральная/сухая = natural, хани = honey, анаэробная = anaerobic, обжарка светлая/средняя/тёмная = light/medium/dark, под фильтр = filter, под эспрессо = espresso, дескрипторы = tasting notes.

Map tasting notes onto the flavor categories, following the SCA Coffee Taster's Flavor Wheel:
- berry: strawberry, raspberry, blueberry, blackcurrant, cherry-like red berries
- citrus: lemon, lime, orange, grapefruit, bergamot
- stoneFruit: peach, apricot, plum, nectarine, mango, passion fruit, pineapple, apple, pear, grape
- driedFruit: raisin, prune, fig, date
- floral: jasmine, rose, orange blossom, chamomile, lavender
- tea: black tea, earl grey, green tea, rooibos, "tea-like body"
- sweet: caramel, honey, brown sugar, molasses, maple, vanilla, toffee, panela
- chocolate: milk/dark chocolate, cocoa, cacao nibs
- nutty: almond, hazelnut, peanut, walnut
- spice: cinnamon, clove, cardamom, pepper, nutmeg
- fermented: winey, boozy, rum, whiskey, yogurt, overripe fruit, funky
- roasty: smoky, toasty, tobacco, cereal, malt
- green: herbal, grassy, vegetal, tomato, olive
A descriptor can feed several categories (e.g. "cherry cola" -> berry and sweet). Weight the first-listed notes higher.

If no tasting notes are printed, estimate a typical profile from origin, process and roast, set flavors_estimated to true, and leave notes empty.

Set acidity, body and sweetness only when the bag shows a scale, words like "bright" or "heavy body", or when notes make it obvious; otherwise null.
roast_for: filter, espresso or omni only when the bag says so — in words, or with a printed brew recipe (V60, Chemex, pour-over, AeroPress → filter; "18 g in, 36 g out", moka → espresso; both → omni). Otherwise "unknown": the app estimates it from roast, origin and notes.
region: east-africa = Ethiopia, Kenya, Rwanda, Burundi, Uganda, Tanzania; blend = more than one origin country.`

export const USER_PROMPT = 'Extract this coffee.'

export type Bag = z.infer<typeof BagSchema>

export function toDraft(bag: Bag): CoffeeDraft {
  if (!bag.is_coffee_bag) throw new ScanError('notCoffee')
  const clamp = (n: number | null, lo: number, hi: number) => (n == null ? null : Math.min(hi, Math.max(lo, n)))
  return {
    roaster: bag.roaster.trim(),
    name: bag.name.trim(),
    country: bag.country.trim(),
    countryCodes: bag.country_codes.map((c) => c.trim().toUpperCase()).filter((c) => /^[A-Z]{2}$/.test(c)),
    area: bag.area.trim(),
    producer: bag.producer.trim(),
    varieties: bag.varieties,
    process: bag.process,
    processDetail: bag.process_detail.trim(),
    altitude: bag.altitude_masl,
    roast: bag.roast,
    roastFor: bag.roast_for,
    region: bag.region,
    notes: bag.notes,
    translations: {
      en: { notes: bag.translations.en.notes, processDetail: bag.translations.en.process_detail.trim() },
      ru: { notes: bag.translations.ru.notes, processDetail: bag.translations.ru.process_detail.trim() },
      es: { notes: bag.translations.es.notes, processDetail: bag.translations.es.process_detail.trim() },
    },
    flavors: Object.fromEntries(FLAVORS.map((f) => [f, (clamp(bag.flavors[f], 0, 3) ?? 0) / 3])) as Record<Flavor, number>,
    flavorsEstimated: bag.flavors_estimated,
    structure: {
      acidity: clamp(bag.acidity, 1, 5),
      body: clamp(bag.body, 1, 5),
      sweetness: clamp(bag.sweetness, 1, 5),
    },
    scaScore: bag.sca_score,
  }
}
