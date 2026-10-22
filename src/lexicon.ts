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

/** [English, Russian, Spanish, categories, ...aliases]; the first category gets the full weight. */
type Entry = [en: string, ru: string, es: string, cats: Flavor[], ...aliases: string[]]

const DESCRIPTORS: Entry[] = [
  // berry
  ['Strawberry', 'Клубника', 'Fresa', ['berry'], 'strawberr*', 'fresa*', 'frutilla*', 'клубни*', 'земляни*'],
  ['Raspberry', 'Малина', 'Frambuesa', ['berry'], 'raspberr*', 'frambuesa*', 'малин*'],
  ['Blueberry', 'Черника', 'Arándano', ['berry'], 'blueberr*', 'arandano', 'arandanos', 'mora azul', 'черни*', 'голуби*'],
  ['Blackberry', 'Ежевика', 'Mora', ['berry'], 'blackberr*', 'zarzamora*', 'mora', 'moras', 'ежеви*'],
  ['Blackcurrant', 'Чёрная смородина', 'Grosella negra', ['berry'], 'blackcurrant*', 'black currant*', 'cassis', 'grosella negra', 'черн* смородин*'],
  ['Redcurrant', 'Красная смородина', 'Grosella roja', ['berry'], 'redcurrant*', 'red currant*', 'grosella*', 'красн* смородин*', 'смородин*'],
  ['Cherry', 'Вишня', 'Cereza', ['berry'], 'cherr*', 'cereza*', 'guinda*', 'вишн*', 'черешн*'],
  ['Cranberry', 'Клюква', 'Arándano rojo', ['berry'], 'cranberr*', 'arandano rojo', 'клюкв*'],
  ['Red berries', 'Красные ягоды', 'Frutos rojos', ['berry'], 'red fruit*', 'red berr*', 'berries', 'frutos rojos', 'frutos del bosque', 'frutas rojas', 'ягод*'],
  // citrus
  ['Lemon', 'Лимон', 'Limón', ['citrus'], 'lemon', 'lemons', 'limon', 'limones', 'лимон*'],
  ['Lime', 'Лайм', 'Lima', ['citrus'], 'lime', 'limes', 'lima', 'лайм*'],
  ['Orange', 'Апельсин', 'Naranja', ['citrus'], 'orange', 'oranges', 'naranja', 'naranjas', 'апельсин*'],
  ['Grapefruit', 'Грейпфрут', 'Pomelo', ['citrus'], 'grapefruit*', 'toronja*', 'pomelo*', 'грейпфрут*'],
  ['Mandarin', 'Мандарин', 'Mandarina', ['citrus'], 'mandarin*', 'tangerine*', 'clementine*', 'мандарин*', 'клементин*'],
  ['Bergamot', 'Бергамот', 'Bergamota', ['citrus', 'tea'], 'bergamot*', 'бергамот*'],
  ['Yuzu', 'Юдзу', 'Yuzu', ['citrus'], 'yuzu', 'юдзу'],
  ['Kumquat', 'Кумкват', 'Kumquat', ['citrus'], 'kumquat*', 'кумкват*'],
  ['Citrus', 'Цитрусы', 'Cítricos', ['citrus'], 'citrus', 'citric*', 'citrico*', 'цитрус*'],
  // stone & tropical fruit
  ['Peach', 'Персик', 'Melocotón', ['stoneFruit'], 'peach*', 'durazno*', 'melocoton*', 'перси*'],
  ['Apricot', 'Абрикос', 'Albaricoque', ['stoneFruit'], 'apricot*', 'albaricoque*', 'damasco*', 'chabacano*', 'абрикос*'],
  ['Nectarine', 'Нектарин', 'Nectarina', ['stoneFruit'], 'nectarine*', 'nectarina*', 'нектарин*'],
  ['Plum', 'Слива', 'Ciruela', ['stoneFruit'], 'plum', 'plums', 'ciruela', 'ciruelas', 'слива', 'сливы', 'сливу', 'сливой', 'сливов*'],
  ['Mango', 'Манго', 'Mango', ['stoneFruit'], 'mango*', 'манго'],
  ['Passion fruit', 'Маракуйя', 'Maracuyá', ['stoneFruit'], 'passion fruit*', 'passionfruit*', 'maracuya', 'parchita', 'chinola', 'маракуй*'],
  ['Pineapple', 'Ананас', 'Piña', ['stoneFruit'], 'pineapple*', 'pina', 'ананас*'],
  ['Apple', 'Яблоко', 'Manzana', ['stoneFruit'], 'apple', 'apples', 'manzana', 'manzanas', 'яблок*', 'яблоч*'],
  ['Pear', 'Груша', 'Pera', ['stoneFruit'], 'pear', 'pears', 'pera', 'peras', 'груш*'],
  ['Grape', 'Виноград', 'Uva', ['stoneFruit'], 'grape', 'grapes', 'uva', 'uvas', 'виноград*'],
  ['Lychee', 'Личи', 'Lichi', ['stoneFruit', 'floral'], 'lychee*', 'litchi*', 'lichi*', 'личи'],
  ['Guava', 'Гуава', 'Guayaba', ['stoneFruit'], 'guava*', 'guayaba*', 'гуав*'],
  ['Papaya', 'Папайя', 'Papaya', ['stoneFruit'], 'papaya*', 'папай*'],
  ['Melon', 'Дыня', 'Melón', ['stoneFruit'], 'melon*', 'дын*'],
  ['Watermelon', 'Арбуз', 'Sandía', ['stoneFruit'], 'watermelon*', 'sandia*', 'арбуз*'],
  ['Kiwi', 'Киви', 'Kiwi', ['stoneFruit', 'citrus'], 'kiwi*', 'киви'],
  ['Tropical fruit', 'Тропические фрукты', 'Fruta tropical', ['stoneFruit'], 'tropical*', 'tropicales', 'тропическ*'],
  ['Stone fruit', 'Косточковые фрукты', 'Fruta de hueso', ['stoneFruit'], 'stone fruit*', 'frutas de hueso', 'косточков*'],
  // dried fruit
  ['Raisin', 'Изюм', 'Pasas', ['driedFruit'], 'raisin*', 'uva pasa', 'pasas', 'изюм*'],
  ['Prune', 'Чернослив', 'Ciruela pasa', ['driedFruit'], 'prune*', 'ciruela pasa', 'чернослив*'],
  ['Fig', 'Инжир', 'Higo', ['driedFruit'], 'fig', 'figs', 'higo', 'higos', 'инжир*'],
  ['Date', 'Финик', 'Dátil', ['driedFruit', 'sweet'], 'dates', 'datil*', 'финик*'],
  ['Dried apricot', 'Курага', 'Orejones', ['driedFruit'], 'dried apricot*', 'orejones', 'кураг*'],
  ['Dried fruit', 'Сухофрукты', 'Fruta deshidratada', ['driedFruit'], 'dried fruit*', 'fruta deshidratada', 'frutas secas', 'сухофрукт*'],
  // floral
  ['Jasmine', 'Жасмин', 'Jazmín', ['floral'], 'jasmin*', 'jazmin*', 'жасмин*'],
  ['Rose', 'Роза', 'Rosa', ['floral'], 'rose', 'roses', 'rosa', 'rosas', 'роза', 'розы', 'розу', 'розой'],
  ['Orange blossom', 'Цветы апельсина', 'Azahar', ['floral', 'citrus'], 'orange blossom*', 'flor de azahar', 'azahar', 'flor de naranjo', 'флердоранж*', 'цвет* апельсин*'],
  ['Chamomile', 'Ромашка', 'Manzanilla', ['floral', 'tea'], 'chamomile', 'camomile', 'manzanilla', 'ромашк*'],
  ['Lavender', 'Лаванда', 'Lavanda', ['floral'], 'lavender', 'lavanda', 'лаванд*'],
  ['Hibiscus', 'Гибискус', 'Hibisco', ['floral', 'berry'], 'hibiscus', 'hibisco', 'гибискус*', 'каркаде'],
  ['Honeysuckle', 'Жимолость', 'Madreselva', ['floral'], 'honeysuckle', 'madreselva', 'жимолост*'],
  ['Elderflower', 'Бузина', 'Flor de saúco', ['floral'], 'elderflower*', 'sauco', 'бузин*'],
  ['Violet', 'Фиалка', 'Violeta', ['floral'], 'violet', 'violeta', 'фиалк*'],
  ['Floral', 'Цветочные', 'Floral', ['floral'], 'floral*', 'flowers', 'flores', 'цветоч*', 'цветы'],
  // tea
  ['Black tea', 'Чёрный чай', 'Té negro', ['tea'], 'black tea', 'te negro', 'черн* ча*'],
  ['Green tea', 'Зелёный чай', 'Té verde', ['tea', 'green'], 'green tea', 'te verde', 'зелен* ча*'],
  ['Earl Grey', 'Эрл Грей', 'Earl Grey', ['tea', 'citrus'], 'earl grey', 'эрл грей'],
  ['Oolong', 'Улун', 'Oolong', ['tea'], 'oolong', 'улун*'],
  ['Tea-like', 'Чайные', 'Tipo té', ['tea'], 'tea-like', 'tea like', 'tea', 'чайн*', 'чай'],
  // sweet
  ['Caramel', 'Карамель', 'Caramelo', ['sweet'], 'caramel*', 'dulce de leche', 'карамел*'],
  ['Honey', 'Мёд', 'Miel', ['sweet', 'floral'], 'honey', 'miel', 'мед', 'меда', 'медов*'],
  ['Brown sugar', 'Тростниковый сахар', 'Panela', ['sweet'], 'brown sugar', 'azucar morena', 'panela', 'piloncillo', 'rapadura', 'тростников*', 'коричнев* сахар*'],
  ['Molasses', 'Патока', 'Melaza', ['sweet', 'roasty'], 'molasses', 'melaza', 'паток*', 'меласс*'],
  ['Maple syrup', 'Кленовый сироп', 'Sirope de arce', ['sweet'], 'maple*', 'jarabe de arce', 'кленов*'],
  ['Vanilla', 'Ваниль', 'Vainilla', ['sweet'], 'vanilla', 'vainilla', 'ванил*'],
  ['Toffee', 'Тоффи', 'Toffee', ['sweet'], 'toffee', 'butterscotch', 'тоффи', 'ирис*'],
  ['Sugar cane', 'Сахарный тростник', 'Caña de azúcar', ['sweet'], 'sugar cane', 'sugarcane', 'cana de azucar', 'сахарн* тростник*'],
  ['Marshmallow', 'Маршмеллоу', 'Malvavisco', ['sweet'], 'marshmallow*', 'malvavisco*', 'маршмел*', 'зефир*'],
  ['Nougat', 'Нуга', 'Turrón', ['sweet', 'nutty'], 'nougat', 'turron', 'нуга', 'нуги'],
  ['Cola', 'Кола', 'Cola', ['sweet', 'spice'], 'cola', 'кола', 'колы'],
  ['Condensed milk', 'Сгущёнка', 'Leche condensada', ['sweet'], 'condensed milk', 'leche condensada', 'сгущ*'],
  // chocolate
  ['Dark chocolate', 'Тёмный шоколад', 'Chocolate negro', ['chocolate', 'roasty'], 'dark chocolate', 'chocolate oscuro', 'chocolate amargo', 'темн* шоколад*', 'горьк* шоколад*'],
  ['Milk chocolate', 'Молочный шоколад', 'Chocolate con leche', ['chocolate', 'sweet'], 'milk chocolate', 'chocolate con leche', 'молочн* шоколад*'],
  ['Cocoa nibs', 'Какао-бобы', 'Nibs de cacao', ['chocolate'], 'cocoa nib*', 'cacao nib*', 'nibs de cacao', 'какао-боб*', 'какао боб*'],
  ['Chocolate', 'Шоколад', 'Chocolate', ['chocolate'], 'chocolat*', 'шоколад*'],
  ['Cocoa', 'Какао', 'Cacao', ['chocolate'], 'cocoa', 'cacao', 'какао'],
  ['Brownie', 'Брауни', 'Brownie', ['chocolate', 'sweet'], 'brownie*', 'брауни'],
  // nutty
  ['Almond', 'Миндаль', 'Almendra', ['nutty'], 'almond*', 'almendra*', 'миндал*'],
  ['Hazelnut', 'Фундук', 'Avellana', ['nutty'], 'hazelnut*', 'avellana*', 'фундук*', 'лесн* орех*'],
  ['Peanut', 'Арахис', 'Cacahuete', ['nutty'], 'peanut*', 'mani', 'cacahuate*', 'cacahuete*', 'арахис*'],
  ['Walnut', 'Грецкий орех', 'Nuez', ['nutty'], 'walnut*', 'nuez', 'nueces', 'грецк* орех*'],
  ['Pecan', 'Пекан', 'Nuez pecana', ['nutty'], 'pecan*', 'nuez pecana', 'пекан*'],
  ['Macadamia', 'Макадамия', 'Macadamia', ['nutty'], 'macadamia*', 'макадами*'],
  ['Pistachio', 'Фисташка', 'Pistacho', ['nutty'], 'pistachio*', 'pistacho*', 'фисташ*'],
  ['Praline', 'Пралине', 'Praliné', ['nutty', 'sweet'], 'praline*', 'пралине'],
  ['Marzipan', 'Марципан', 'Mazapán', ['nutty', 'sweet'], 'marzipan', 'mazapan', 'марципан*'],
  ['Nutty', 'Ореховые', 'Frutos secos', ['nutty'], 'nutty', 'nuts', 'frutos secos', 'орех*'],
  // spice
  ['Cinnamon', 'Корица', 'Canela', ['spice'], 'cinnamon', 'canela', 'кориц*'],
  ['Clove', 'Гвоздика', 'Clavo', ['spice'], 'clove*', 'clavo*', 'гвоздик*'],
  ['Cardamom', 'Кардамон', 'Cardamomo', ['spice'], 'cardamom*', 'cardamomo', 'кардамон*'],
  ['Nutmeg', 'Мускатный орех', 'Nuez moscada', ['spice'], 'nutmeg', 'nuez moscada', 'мускатн* орех*'],
  ['Black pepper', 'Чёрный перец', 'Pimienta negra', ['spice'], 'pepper*', 'pimienta', 'перец', 'перца', 'перечн*'],
  ['Ginger', 'Имбирь', 'Jengibre', ['spice'], 'ginger*', 'jengibre', 'имбир*'],
  ['Anise', 'Анис', 'Anís', ['spice'], 'anise', 'star anise', 'anis', 'анис*', 'бадьян*'],
  ['Licorice', 'Лакрица', 'Regaliz', ['spice', 'sweet'], 'licorice', 'liquorice', 'regaliz', 'лакриц*'],
  ['Spices', 'Специи', 'Especias', ['spice'], 'spice*', 'spicy', 'especias', 'especiado*', 'специ*', 'пряност*', 'пряны*'],
  // winey & fermented
  ['Red wine', 'Красное вино', 'Vino tinto', ['fermented', 'berry'], 'red wine', 'vino tinto', 'красн* вин*'],
  ['Winey', 'Винные', 'Vinoso', ['fermented'], 'wine*', 'winey', 'vino', 'vinoso', 'вин*'],
  ['Rum', 'Ром', 'Ron', ['fermented', 'sweet'], 'rum', 'ron', 'ром', 'рома'],
  ['Whiskey', 'Виски', 'Whisky', ['fermented', 'roasty'], 'whisk*', 'виски'],
  ['Brandy', 'Коньяк', 'Coñac', ['fermented'], 'brandy', 'cognac', 'conac', 'коньяк*', 'бренди'],
  ['Liqueur', 'Ликёр', 'Licor', ['fermented', 'sweet'], 'liqueur*', 'licor*', 'ликер*'],
  ['Cider', 'Сидр', 'Sidra', ['fermented', 'stoneFruit'], 'cider', 'сидр*'],
  ['Champagne', 'Шампанское', 'Champán', ['fermented'], 'champagne', 'champan', 'шампанск*'],
  ['Yogurt', 'Йогурт', 'Yogur', ['fermented'], 'yogurt*', 'yoghurt*', 'yogur*', 'йогурт*'],
  ['Kombucha', 'Комбуча', 'Kombucha', ['fermented', 'tea'], 'kombucha', 'комбуч*'],
  // drinks named as associations rather than flavors (see ASSOCIATIONS)
  ['Stout', 'Стаут', 'Stout', ['chocolate', 'roasty'], 'stout*', 'porter*', 'стаут*', 'портер*'],
  ['IPA', 'IPA', 'IPA', ['citrus', 'green'], 'ipa', 'ипа', 'pale ale', 'пейл эль'],
  ['Lager', 'Лагер', 'Lager', ['sweet', 'roasty'], 'lager*', 'лагер*'],
  ['Beer', 'Пиво', 'Cerveza', ['fermented', 'roasty'], 'beer*', 'cerveza*', 'пив*', 'ale', 'эль'],
  ['Kvass', 'Квас', 'Kvas', ['fermented', 'roasty'], 'kvass', 'квас', 'кваса', 'квасн*'],
  ['Gin', 'Джин', 'Ginebra', ['green', 'spice'], 'gin', 'джин', 'ginebra'],
  ['Vermouth', 'Вермут', 'Vermú', ['fermented', 'spice'], 'vermouth', 'vermut', 'vermu', 'вермут*'],
  ['Negroni', 'Негрони', 'Negroni', ['citrus', 'spice'], 'negroni', 'негрони'],
  ['Mojito', 'Мохито', 'Mojito', ['green', 'citrus'], 'mojito', 'мохито'],
  ['Mulled wine', 'Глинтвейн', 'Vino caliente', ['fermented', 'spice'], 'mulled wine', 'глинтвейн*', 'vino caliente'],
  ['Sangria', 'Сангрия', 'Sangría', ['fermented', 'berry'], 'sangria', 'сангри*'],
  ['Piña colada', 'Пина колада', 'Piña colada', ['stoneFruit', 'sweet'], 'pina colada', 'пина колад*'],
  ['Fermented', 'Ферментированные', 'Fermentado', ['fermented'], 'ferment*', 'funky', 'boozy', 'ферментир*', 'алкогольн*'],
  // roasty & smoky
  ['Smoky', 'Дымный', 'Ahumado', ['roasty'], 'smok*', 'ahumado*', 'дым*', 'копчен*'],
  ['Tobacco', 'Табак', 'Tabaco', ['roasty'], 'tobacco', 'tabaco', 'табак*', 'табач*'],
  ['Toast', 'Тост', 'Tostada', ['roasty'], 'toast*', 'тост*'],
  ['Malt', 'Солод', 'Malta', ['roasty', 'sweet'], 'malt*', 'солод*'],
  ['Cereal', 'Злаки', 'Cereal', ['roasty'], 'cereal*', 'grain*', 'злак*'],
  ['Cedar', 'Кедр', 'Cedro', ['roasty', 'green'], 'cedar*', 'cedro', 'кедр*'],
  ['Woody', 'Древесные', 'Amaderado', ['roasty'], 'wood*', 'madera', 'amaderado', 'древесн*'],
  ['Leather', 'Кожа', 'Cuero', ['roasty'], 'leather', 'cuero', 'кожан*'],
  // herbal & green
  ['Herbal', 'Травяные', 'Herbal', ['green'], 'herbal', 'herbs', 'hierbas', 'herbaceo', 'трав*'],
  ['Grassy', 'Трава', 'Hierba', ['green'], 'grass*', 'pasto'],
  ['Tomato', 'Томат', 'Tomate', ['green', 'citrus'], 'tomato*', 'tomate*', 'томат*', 'помидор*'],
  ['Olive', 'Оливка', 'Aceituna', ['green'], 'olive*', 'aceituna*', 'олив*', 'маслин*'],
  ['Mint', 'Мята', 'Menta', ['green'], 'mint', 'menta', 'hierbabuena', 'мят*'],
  ['Basil', 'Базилик', 'Albahaca', ['green'], 'basil', 'albahaca', 'базилик*'],
  ['Sage', 'Шалфей', 'Salvia', ['green'], 'sage', 'salvia', 'шалфе*'],
  ['Lemongrass', 'Лемонграсс', 'Hierba limón', ['green', 'citrus'], 'lemongrass', 'hierba limon', 'лемонграсс*'],
  ['Earthy', 'Землистые', 'Terroso', ['green', 'roasty'], 'earthy', 'terroso', 'землист*'],
  ['Vegetal', 'Овощные', 'Vegetal', ['green'], 'vegetal', 'vegetable*', 'овощ*'],
]

export interface Descriptor {
  en: string
  ru: string
  es: string
  cats: Flavor[]
  aliases: string[]
}

/** Drinks that describe a coffee by association: a weak hint, so a profile built only from them counts as estimated. */
export const ASSOCIATIONS = new Set(['Stout', 'IPA', 'Lager', 'Beer', 'Kvass', 'Gin', 'Vermouth', 'Negroni', 'Mojito', 'Mulled wine', 'Sangria', 'Piña colada', 'Whiskey', 'Brandy', 'Champagne'])

export const DESCRIPTOR_LIST: Descriptor[] = DESCRIPTORS.map(([en, ru, es, cats, ...aliases]) => ({ en, ru, es, cats, aliases }))

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
