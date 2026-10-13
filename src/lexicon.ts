// Coffee vocabulary in English, Spanish and Russian for reading labels without an AI model.
// Aliases are matched after normalize(): lowercase, no accents, ё→е. A trailing * matches any
// word ending, which covers Russian inflection ("черника", "черники", "черничный" → "черни*").
import type { Flavor, Process, Region } from './types'

export function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/ё/g, 'е')
}

export interface Country {
  code: string
  region: Region
  aliases: string[]
}

export const COUNTRIES: Country[] = [
  { code: 'ET', region: 'east-africa', aliases: ['ethiopia*', 'etiopia', 'эфиопи*', 'yirgacheffe', 'sidama', 'guji', 'иргачеф*'] },
  { code: 'KE', region: 'east-africa', aliases: ['kenya*', 'kenia', 'кени*'] },
  { code: 'RW', region: 'east-africa', aliases: ['rwanda*', 'ruanda', 'руанд*'] },
  { code: 'BI', region: 'east-africa', aliases: ['burundi', 'бурунди'] },
  { code: 'UG', region: 'east-africa', aliases: ['uganda*', 'уганд*'] },
  { code: 'TZ', region: 'east-africa', aliases: ['tanzania*', 'танзани*'] },
  { code: 'MW', region: 'east-africa', aliases: ['malawi', 'малави'] },
  { code: 'CD', region: 'other-africa', aliases: ['congo', 'конго'] },
  { code: 'ZM', region: 'other-africa', aliases: ['zambia', 'замби*'] },
  { code: 'CM', region: 'other-africa', aliases: ['cameroon', 'camerun', 'камерун*'] },
  { code: 'GT', region: 'central-america', aliases: ['guatemala*', 'гватемал*'] },
  { code: 'HN', region: 'central-america', aliases: ['honduras', 'гондурас*'] },
  { code: 'SV', region: 'central-america', aliases: ['el salvador', 'сальвадор*'] },
  { code: 'NI', region: 'central-america', aliases: ['nicaragua*', 'никарагу*'] },
  { code: 'CR', region: 'central-america', aliases: ['costa rica*', 'коста-рик*', 'коста рик*', 'tarrazu'] },
  { code: 'PA', region: 'central-america', aliases: ['panama*', 'панам*', 'boquete'] },
  { code: 'MX', region: 'central-america', aliases: ['mexico', 'мексик*', 'chiapas', 'oaxaca'] },
  { code: 'DO', region: 'central-america', aliases: ['dominican republic', 'republica dominicana', 'доминиканск*'] },
  { code: 'JM', region: 'central-america', aliases: ['blue mountain'] },
  { code: 'CO', region: 'south-america', aliases: ['colombia*', 'колумби*', 'huila', 'nariño', 'narino', 'cauca', 'antioquia', 'tolima'] },
  { code: 'BR', region: 'south-america', aliases: ['brazil*', 'brasil*', 'бразили*', 'minas gerais', 'cerrado', 'mogiana'] },
  { code: 'PE', region: 'south-america', aliases: ['peru*', 'перу', 'cajamarca'] },
  { code: 'EC', region: 'south-america', aliases: ['ecuador*', 'эквадор*'] },
  { code: 'BO', region: 'south-america', aliases: ['bolivia*', 'боливи*'] },
  { code: 'VE', region: 'south-america', aliases: ['venezuela*', 'венесуэл*'] },
  { code: 'ID', region: 'asia-pacific', aliases: ['indonesia*', 'индонези*', 'sumatra', 'суматр*', 'sulawesi', 'сулавеси', 'flores'] },
  { code: 'IN', region: 'asia-pacific', aliases: ['india', 'инди*', 'karnataka', 'malabar'] },
  { code: 'VN', region: 'asia-pacific', aliases: ['vietnam', 'viet nam', 'вьетнам*'] },
  { code: 'PG', region: 'asia-pacific', aliases: ['papua new guinea', 'papua nueva guinea', 'папуа*'] },
  { code: 'CN', region: 'asia-pacific', aliases: ['yunnan', 'юньнан*', 'китай*'] },
  { code: 'TH', region: 'asia-pacific', aliases: ['thailand', 'tailandia', 'таиланд*'] },
  { code: 'MM', region: 'asia-pacific', aliases: ['myanmar', 'мьянм*'] },
  { code: 'LA', region: 'asia-pacific', aliases: ['laos', 'лаос*'] },
  { code: 'TL', region: 'asia-pacific', aliases: ['timor*', 'тимор*'] },
  { code: 'TW', region: 'asia-pacific', aliases: ['taiwan', 'тайван*'] },
  { code: 'YE', region: 'asia-pacific', aliases: ['yemen*', 'йемен*'] },
  { code: 'US', region: 'asia-pacific', aliases: ['hawaii*', 'kona', 'гава*'] },
]

/** [English, Russian, categories, ...aliases]; the first category gets the full weight. */
type Entry = [en: string, ru: string, cats: Flavor[], ...aliases: string[]]

const DESCRIPTORS: Entry[] = [
  // berry
  ['Strawberry', 'Клубника', ['berry'], 'strawberr*', 'fresa*', 'frutilla*', 'клубни*', 'земляни*'],
  ['Raspberry', 'Малина', ['berry'], 'raspberr*', 'frambuesa*', 'малин*'],
  ['Blueberry', 'Черника', ['berry'], 'blueberr*', 'arandano', 'arandanos', 'mora azul', 'черни*', 'голуби*'],
  ['Blackberry', 'Ежевика', ['berry'], 'blackberr*', 'zarzamora*', 'mora', 'moras', 'ежеви*'],
  ['Blackcurrant', 'Чёрная смородина', ['berry'], 'blackcurrant*', 'black currant*', 'cassis', 'grosella negra', 'черн* смородин*'],
  ['Redcurrant', 'Красная смородина', ['berry'], 'redcurrant*', 'red currant*', 'grosella*', 'красн* смородин*', 'смородин*'],
  ['Cherry', 'Вишня', ['berry'], 'cherr*', 'cereza*', 'guinda*', 'вишн*', 'черешн*'],
  ['Cranberry', 'Клюква', ['berry'], 'cranberr*', 'arandano rojo', 'клюкв*'],
  ['Red berries', 'Красные ягоды', ['berry'], 'red fruit*', 'red berr*', 'berries', 'frutos rojos', 'frutos del bosque', 'frutas rojas', 'ягод*'],
  // citrus
  ['Lemon', 'Лимон', ['citrus'], 'lemon', 'lemons', 'limon', 'limones', 'лимон*'],
  ['Lime', 'Лайм', ['citrus'], 'lime', 'limes', 'lima', 'лайм*'],
  ['Orange', 'Апельсин', ['citrus'], 'orange', 'oranges', 'naranja', 'naranjas', 'апельсин*'],
  ['Grapefruit', 'Грейпфрут', ['citrus'], 'grapefruit*', 'toronja*', 'pomelo*', 'грейпфрут*'],
  ['Mandarin', 'Мандарин', ['citrus'], 'mandarin*', 'tangerine*', 'clementine*', 'мандарин*', 'клементин*'],
  ['Bergamot', 'Бергамот', ['citrus', 'tea'], 'bergamot*', 'бергамот*'],
  ['Yuzu', 'Юдзу', ['citrus'], 'yuzu', 'юдзу'],
  ['Kumquat', 'Кумкват', ['citrus'], 'kumquat*', 'кумкват*'],
  ['Citrus', 'Цитрусы', ['citrus'], 'citrus', 'citric*', 'citrico*', 'цитрус*'],
  // stone & tropical fruit
  ['Peach', 'Персик', ['stoneFruit'], 'peach*', 'durazno*', 'melocoton*', 'перси*'],
  ['Apricot', 'Абрикос', ['stoneFruit'], 'apricot*', 'albaricoque*', 'damasco*', 'chabacano*', 'абрикос*'],
  ['Nectarine', 'Нектарин', ['stoneFruit'], 'nectarine*', 'nectarina*', 'нектарин*'],
  ['Plum', 'Слива', ['stoneFruit'], 'plum', 'plums', 'ciruela', 'ciruelas', 'слива', 'сливы', 'сливу', 'сливой', 'сливов*'],
  ['Mango', 'Манго', ['stoneFruit'], 'mango*', 'манго'],
  ['Passion fruit', 'Маракуйя', ['stoneFruit'], 'passion fruit*', 'passionfruit*', 'maracuya', 'parchita', 'chinola', 'маракуй*'],
  ['Pineapple', 'Ананас', ['stoneFruit'], 'pineapple*', 'pina', 'ананас*'],
  ['Apple', 'Яблоко', ['stoneFruit'], 'apple', 'apples', 'manzana', 'manzanas', 'яблок*', 'яблоч*'],
  ['Pear', 'Груша', ['stoneFruit'], 'pear', 'pears', 'pera', 'peras', 'груш*'],
  ['Grape', 'Виноград', ['stoneFruit'], 'grape', 'grapes', 'uva', 'uvas', 'виноград*'],
  ['Lychee', 'Личи', ['stoneFruit', 'floral'], 'lychee*', 'litchi*', 'lichi*', 'личи'],
  ['Guava', 'Гуава', ['stoneFruit'], 'guava*', 'guayaba*', 'гуав*'],
  ['Papaya', 'Папайя', ['stoneFruit'], 'papaya*', 'папай*'],
  ['Melon', 'Дыня', ['stoneFruit'], 'melon*', 'дын*'],
  ['Watermelon', 'Арбуз', ['stoneFruit'], 'watermelon*', 'sandia*', 'арбуз*'],
  ['Kiwi', 'Киви', ['stoneFruit', 'citrus'], 'kiwi*', 'киви'],
  ['Tropical fruit', 'Тропические фрукты', ['stoneFruit'], 'tropical*', 'tropicales', 'тропическ*'],
  ['Stone fruit', 'Косточковые фрукты', ['stoneFruit'], 'stone fruit*', 'frutas de hueso', 'косточков*'],
  // dried fruit
  ['Raisin', 'Изюм', ['driedFruit'], 'raisin*', 'uva pasa', 'pasas', 'изюм*'],
  ['Prune', 'Чернослив', ['driedFruit'], 'prune*', 'ciruela pasa', 'чернослив*'],
  ['Fig', 'Инжир', ['driedFruit'], 'fig', 'figs', 'higo', 'higos', 'инжир*'],
  ['Date', 'Финик', ['driedFruit', 'sweet'], 'dates', 'datil*', 'финик*'],
  ['Dried apricot', 'Курага', ['driedFruit'], 'dried apricot*', 'orejones', 'кураг*'],
  ['Dried fruit', 'Сухофрукты', ['driedFruit'], 'dried fruit*', 'fruta deshidratada', 'frutas secas', 'сухофрукт*'],
  // floral
  ['Jasmine', 'Жасмин', ['floral'], 'jasmin*', 'jazmin*', 'жасмин*'],
  ['Rose', 'Роза', ['floral'], 'rose', 'roses', 'rosa', 'rosas', 'роза', 'розы', 'розу', 'розой'],
  ['Orange blossom', 'Цветы апельсина', ['floral', 'citrus'], 'orange blossom*', 'flor de azahar', 'azahar', 'flor de naranjo', 'флердоранж*', 'цвет* апельсин*'],
  ['Chamomile', 'Ромашка', ['floral', 'tea'], 'chamomile', 'camomile', 'manzanilla', 'ромашк*'],
  ['Lavender', 'Лаванда', ['floral'], 'lavender', 'lavanda', 'лаванд*'],
  ['Hibiscus', 'Гибискус', ['floral', 'berry'], 'hibiscus', 'hibisco', 'гибискус*', 'каркаде'],
  ['Honeysuckle', 'Жимолость', ['floral'], 'honeysuckle', 'madreselva', 'жимолост*'],
  ['Elderflower', 'Бузина', ['floral'], 'elderflower*', 'sauco', 'бузин*'],
  ['Violet', 'Фиалка', ['floral'], 'violet', 'violeta', 'фиалк*'],
  ['Floral', 'Цветочные', ['floral'], 'floral*', 'flowers', 'flores', 'цветоч*', 'цветы'],
  // tea
  ['Black tea', 'Чёрный чай', ['tea'], 'black tea', 'te negro', 'черн* ча*'],
  ['Green tea', 'Зелёный чай', ['tea', 'green'], 'green tea', 'te verde', 'зелен* ча*'],
  ['Earl Grey', 'Эрл Грей', ['tea', 'citrus'], 'earl grey', 'эрл грей'],
  ['Oolong', 'Улун', ['tea'], 'oolong', 'улун*'],
  ['Tea-like', 'Чайные', ['tea'], 'tea-like', 'tea like', 'tea', 'чайн*', 'чай'],
  // sweet
  ['Caramel', 'Карамель', ['sweet'], 'caramel*', 'dulce de leche', 'карамел*'],
  ['Honey', 'Мёд', ['sweet', 'floral'], 'honey', 'miel', 'мед', 'меда', 'медов*'],
  ['Brown sugar', 'Тростниковый сахар', ['sweet'], 'brown sugar', 'azucar morena', 'panela', 'piloncillo', 'rapadura', 'тростников*', 'коричнев* сахар*'],
  ['Molasses', 'Патока', ['sweet', 'roasty'], 'molasses', 'melaza', 'паток*', 'меласс*'],
  ['Maple syrup', 'Кленовый сироп', ['sweet'], 'maple*', 'jarabe de arce', 'кленов*'],
  ['Vanilla', 'Ваниль', ['sweet'], 'vanilla', 'vainilla', 'ванил*'],
  ['Toffee', 'Тоффи', ['sweet'], 'toffee', 'butterscotch', 'тоффи', 'ирис*'],
  ['Sugar cane', 'Сахарный тростник', ['sweet'], 'sugar cane', 'sugarcane', 'cana de azucar', 'сахарн* тростник*'],
  ['Marshmallow', 'Маршмеллоу', ['sweet'], 'marshmallow*', 'malvavisco*', 'маршмел*', 'зефир*'],
  ['Nougat', 'Нуга', ['sweet', 'nutty'], 'nougat', 'turron', 'нуга', 'нуги'],
  ['Cola', 'Кола', ['sweet', 'spice'], 'cola', 'кола', 'колы'],
  ['Condensed milk', 'Сгущёнка', ['sweet'], 'condensed milk', 'leche condensada', 'сгущ*'],
  // chocolate
  ['Dark chocolate', 'Тёмный шоколад', ['chocolate', 'roasty'], 'dark chocolate', 'chocolate oscuro', 'chocolate amargo', 'темн* шоколад*', 'горьк* шоколад*'],
  ['Milk chocolate', 'Молочный шоколад', ['chocolate', 'sweet'], 'milk chocolate', 'chocolate con leche', 'молочн* шоколад*'],
  ['Cocoa nibs', 'Какао-бобы', ['chocolate'], 'cocoa nib*', 'cacao nib*', 'nibs de cacao', 'какао-боб*', 'какао боб*'],
  ['Chocolate', 'Шоколад', ['chocolate'], 'chocolat*', 'шоколад*'],
  ['Cocoa', 'Какао', ['chocolate'], 'cocoa', 'cacao', 'какао'],
  ['Brownie', 'Брауни', ['chocolate', 'sweet'], 'brownie*', 'брауни'],
  // nutty
  ['Almond', 'Миндаль', ['nutty'], 'almond*', 'almendra*', 'миндал*'],
  ['Hazelnut', 'Фундук', ['nutty'], 'hazelnut*', 'avellana*', 'фундук*', 'лесн* орех*'],
  ['Peanut', 'Арахис', ['nutty'], 'peanut*', 'mani', 'cacahuate*', 'cacahuete*', 'арахис*'],
  ['Walnut', 'Грецкий орех', ['nutty'], 'walnut*', 'nuez', 'nueces', 'грецк* орех*'],
  ['Pecan', 'Пекан', ['nutty'], 'pecan*', 'nuez pecana', 'пекан*'],
  ['Macadamia', 'Макадамия', ['nutty'], 'macadamia*', 'макадами*'],
  ['Pistachio', 'Фисташка', ['nutty'], 'pistachio*', 'pistacho*', 'фисташ*'],
  ['Praline', 'Пралине', ['nutty', 'sweet'], 'praline*', 'пралине'],
  ['Marzipan', 'Марципан', ['nutty', 'sweet'], 'marzipan', 'mazapan', 'марципан*'],
  ['Nutty', 'Ореховые', ['nutty'], 'nutty', 'nuts', 'frutos secos', 'орех*'],
  // spice
  ['Cinnamon', 'Корица', ['spice'], 'cinnamon', 'canela', 'кориц*'],
  ['Clove', 'Гвоздика', ['spice'], 'clove*', 'clavo*', 'гвоздик*'],
  ['Cardamom', 'Кардамон', ['spice'], 'cardamom*', 'cardamomo', 'кардамон*'],
  ['Nutmeg', 'Мускатный орех', ['spice'], 'nutmeg', 'nuez moscada', 'мускатн* орех*'],
  ['Black pepper', 'Чёрный перец', ['spice'], 'pepper*', 'pimienta', 'перец', 'перца', 'перечн*'],
  ['Ginger', 'Имбирь', ['spice'], 'ginger*', 'jengibre', 'имбир*'],
  ['Anise', 'Анис', ['spice'], 'anise', 'star anise', 'anis', 'анис*', 'бадьян*'],
  ['Licorice', 'Лакрица', ['spice', 'sweet'], 'licorice', 'liquorice', 'regaliz', 'лакриц*'],
  ['Spices', 'Специи', ['spice'], 'spice*', 'spicy', 'especias', 'especiado*', 'специ*', 'пряност*', 'пряны*'],
  // winey & fermented
  ['Red wine', 'Красное вино', ['fermented', 'berry'], 'red wine', 'vino tinto', 'красн* вин*'],
  ['Winey', 'Винные', ['fermented'], 'wine*', 'winey', 'vino', 'vinoso', 'вин*'],
  ['Rum', 'Ром', ['fermented', 'sweet'], 'rum', 'ron', 'ром', 'рома'],
  ['Whiskey', 'Виски', ['fermented', 'roasty'], 'whisk*', 'виски'],
  ['Brandy', 'Коньяк', ['fermented'], 'brandy', 'cognac', 'conac', 'коньяк*', 'бренди'],
  ['Liqueur', 'Ликёр', ['fermented', 'sweet'], 'liqueur*', 'licor*', 'ликер*'],
  ['Cider', 'Сидр', ['fermented', 'stoneFruit'], 'cider', 'сидр*'],
  ['Champagne', 'Шампанское', ['fermented'], 'champagne', 'champan', 'шампанск*'],
  ['Yogurt', 'Йогурт', ['fermented'], 'yogurt*', 'yoghurt*', 'yogur*', 'йогурт*'],
  ['Kombucha', 'Комбуча', ['fermented', 'tea'], 'kombucha', 'комбуч*'],
  ['Fermented', 'Ферментированные', ['fermented'], 'ferment*', 'funky', 'boozy', 'ферментир*', 'алкогольн*'],
  // roasty & smoky
  ['Smoky', 'Дымный', ['roasty'], 'smok*', 'ahumado*', 'дым*', 'копчен*'],
  ['Tobacco', 'Табак', ['roasty'], 'tobacco', 'tabaco', 'табак*', 'табач*'],
  ['Toast', 'Тост', ['roasty'], 'toast*', 'тост*'],
  ['Malt', 'Солод', ['roasty', 'sweet'], 'malt*', 'солод*'],
  ['Cereal', 'Злаки', ['roasty'], 'cereal*', 'grain*', 'злак*'],
  ['Cedar', 'Кедр', ['roasty', 'green'], 'cedar*', 'cedro', 'кедр*'],
  ['Woody', 'Древесные', ['roasty'], 'wood*', 'madera', 'amaderado', 'древесн*'],
  ['Leather', 'Кожа', ['roasty'], 'leather', 'cuero', 'кожан*'],
  // herbal & green
  ['Herbal', 'Травяные', ['green'], 'herbal', 'herbs', 'hierbas', 'herbaceo', 'трав*'],
  ['Grassy', 'Трава', ['green'], 'grass*', 'pasto'],
  ['Tomato', 'Томат', ['green', 'citrus'], 'tomato*', 'tomate*', 'томат*', 'помидор*'],
  ['Olive', 'Оливка', ['green'], 'olive*', 'aceituna*', 'олив*', 'маслин*'],
  ['Mint', 'Мята', ['green'], 'mint', 'menta', 'hierbabuena', 'мят*'],
  ['Basil', 'Базилик', ['green'], 'basil', 'albahaca', 'базилик*'],
  ['Sage', 'Шалфей', ['green'], 'sage', 'salvia', 'шалфе*'],
  ['Lemongrass', 'Лемонграсс', ['green', 'citrus'], 'lemongrass', 'hierba limon', 'лемонграсс*'],
  ['Earthy', 'Землистые', ['green', 'roasty'], 'earthy', 'terroso', 'землист*'],
  ['Vegetal', 'Овощные', ['green'], 'vegetal', 'vegetable*', 'овощ*'],
]

export interface Descriptor {
  en: string
  ru: string
  cats: Flavor[]
  aliases: string[]
}

export const DESCRIPTOR_LIST: Descriptor[] = DESCRIPTORS.map(([en, ru, cats, ...aliases]) => ({ en, ru, cats, aliases }))

export const VARIETIES = [
  'Gesha', 'Geisha', 'Pink Bourbon', 'Red Bourbon', 'Yellow Bourbon', 'Bourbon', 'Borbon', 'Caturra', 'Catuai',
  'Castillo', 'Typica', 'Tipica', 'Pacamara', 'Pacas', 'Maragogype', 'SL28', 'SL34', 'Ruiru 11', 'Batian',
  'Heirloom', 'Landrace', '74110', '74112', '74158', 'Kurume', 'Wolisho', 'Dega', 'Sidra', 'Wush Wush', 'Java',
  'Mundo Novo', 'Catimor', 'Sarchimor', 'Parainema', 'Tabi', 'Laurina', 'Mokka', 'Villa Sarchi', 'Marsellesa',
  'Obata', 'Chiroso', 'Sudan Rume', 'Rume Sudan', 'Bourbon Aji', 'Eugenioides', 'Бурбон', 'Типика', 'Гейша',
  'Катурра', 'Катуаи', 'Пакамара', 'Хайрлум',
]

/** Checked in order: the first matching process wins, so specific wording beats generic. */
export const PROCESS_TERMS: [Process, string[]][] = [
  ['anaerobic', ['anaerob*', 'анаэроб*', 'carbonic*', 'maceracion carbonica', 'карбонов* мацерац*', 'thermal shock', 'choque termico', 'co-ferment*', 'coferment*', 'double ferment*', 'doble fermentacion', 'extended ferment*', 'fermentacion prolongada', 'infused', 'experimental']],
  ['honey', ['honey', 'red honey', 'black honey', 'yellow honey', 'white honey', 'miel', 'enmielado', 'хани', 'pulped natural', 'semi-seco']],
  ['other', ['wet hulled', 'wet-hulled', 'giling basah', 'semi-washed', 'semilavado', 'monsooned']],
  ['natural', ['natural', 'naturals', 'dry process*', 'sun dried', 'sun-dried', 'secado al sol', 'seco', 'натурал*', 'сух* обработк*']],
  ['washed', ['washed', 'fully washed', 'wet process*', 'lavado', 'мыт*']],
]

/** Section labels that usually precede the tasting notes. */
export const NOTES_HEADERS = ['tasting notes', 'notes', 'taste', 'flavor*', 'flavour*', 'cup profile', 'notas de cata', 'notas', 'perfil de taza', 'sabor*', 'дескриптор*', 'вкус*', 'ноты', 'в чашке', 'профиль']
// Not "roast*"/"обжар*": those would also match roaster names ("… Roasters", "обжарщик").
export const ROAST_WORDS = ['roast', 'roasted', 'roasting', 'roast level', 'tueste', 'tostado', 'tostion', 'обжарка', 'обжарки', 'обжарку', 'обжаркой', 'обжарен*']
export const ALTITUDE_WORDS = ['altitude', 'elevation', 'altura', 'altitud', 'высот*']
export const AREA_WORDS = ['region', 'area', 'departamento', 'municipio', 'zona', 'регион', 'район', 'провинци*']
export const PRODUCER_WORDS = ['producer', 'farmer', 'farm', 'finca', 'productor', 'caficultor', 'cooperativ*', 'washing station', 'estacion de lavado', 'производител*', 'ферма', 'станци*']
export const ROASTER_WORDS = ['roaster', 'roasted by', 'tostador', 'tostado por', 'обжарщик', 'обжарено']
export const VARIETY_WORDS = ['variet*', 'variedad*', 'cultivar', 'разновидност*', 'сорт*']
