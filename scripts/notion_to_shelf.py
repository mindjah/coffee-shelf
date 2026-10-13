"""Convert the Notion coffee database export (CSV) into a Coffee Shelf import file."""
import csv, json, re, sys, time

SRC = sys.argv[1]
OUT = sys.argv[2]

FLAVORS = ['berry', 'citrus', 'stoneFruit', 'driedFruit', 'floral', 'tea', 'sweet', 'chocolate', 'nutty', 'spice', 'fermented', 'roasty', 'green']

# Russian descriptor -> (English, categories; first category carries the full weight)
D = {
    'абрикос': ('Apricot', ['stoneFruit']), 'абрикосовый джем': ('Apricot jam', ['stoneFruit', 'sweet']),
    'акациевый мед': ('Acacia honey', ['sweet', 'floral']), 'акация': ('Acacia', ['floral']),
    'амаретто': ('Amaretto', ['nutty', 'fermented']), 'ананас': ('Pineapple', ['stoneFruit']),
    'апельсин': ('Orange', ['citrus']), 'барбарис': ('Barberry', ['berry', 'citrus']),
    'белый виноград': ('White grape', ['stoneFruit']), 'бергамот': ('Bergamot', ['citrus', 'tea']),
    'брауни': ('Brownie', ['chocolate', 'sweet']), 'ваниль': ('Vanilla', ['sweet']),
    'виноград': ('Grape', ['stoneFruit']), 'вишня': ('Cherry', ['berry']),
    'гибискус': ('Hibiscus', ['floral', 'berry']), 'голубика': ('Blueberry', ['berry']),
    'грейпфрут': ('Grapefruit', ['citrus']), 'ежевика': ('Blackberry', ['berry']),
    'жасмин': ('Jasmine', ['floral']), 'желтый персик': ('Yellow peach', ['stoneFruit']),
    'земляника': ('Wild strawberry', ['berry']), 'изюм': ('Raisin', ['driedFruit']),
    'инжир': ('Fig', ['driedFruit']), 'карамель': ('Caramel', ['sweet']),
    'киви': ('Kiwi', ['stoneFruit', 'citrus']), 'клубника': ('Strawberry', ['berry']),
    'клубника со сливками': ('Strawberries and cream', ['berry', 'sweet']),
    'клубничный джем': ('Strawberry jam', ['berry', 'sweet']), 'клюква': ('Cranberry', ['berry']),
    'корица': ('Cinnamon', ['spice']), 'коричневый сахар': ('Brown sugar', ['sweet']),
    'красная роза': ('Red rose', ['floral']), 'красное яблоко': ('Red apple', ['stoneFruit']),
    'крыжовник': ('Gooseberry', ['berry', 'citrus']), 'курага': ('Dried apricot', ['driedFruit']),
    'лайм': ('Lime', ['citrus']), 'лемонграсс': ('Lemongrass', ['green', 'citrus']),
    'лесные ягоды': ('Forest berries', ['berry']), 'лимон': ('Lemon', ['citrus']),
    'личи': ('Lychee', ['stoneFruit', 'floral']), 'мандарин': ('Mandarin', ['citrus']),
    'маракуйя': ('Passion fruit', ['stoneFruit']), 'мед': ('Honey', ['sweet', 'floral']),
    'миндаль': ('Almond', ['nutty']), 'молочный шоколад': ('Milk chocolate', ['chocolate', 'sweet']),
    'мята': ('Mint', ['green']), 'наранхилья': ('Naranjilla (lulo)', ['citrus', 'stoneFruit']),
    'нектарин': ('Nectarine', ['stoneFruit']), 'папайя': ('Papaya', ['stoneFruit']),
    'портвейн': ('Port wine', ['fermented', 'driedFruit']), 'ревень': ('Rhubarb', ['citrus', 'green']),
    'роза': ('Rose', ['floral']), 'сладкий узвар': ('Dried fruit compote', ['driedFruit', 'sweet']),
    'слива': ('Plum', ['stoneFruit']), 'смородина': ('Currant', ['berry']),
    'сушеный банан': ('Dried banana', ['driedFruit', 'sweet']), 'текила': ('Tequila', ['fermented']),
    'темный шоколад': ('Dark chocolate', ['chocolate', 'roasty']), 'томат': ('Tomato', ['green', 'citrus']),
    'тростник': ('Sugar cane', ['sweet']), 'тростниковый сахар': ('Cane sugar', ['sweet']),
    'фундук': ('Hazelnut', ['nutty']), 'цветочная пыльца': ('Bee pollen', ['floral', 'sweet']),
    'цветочный мед': ('Blossom honey', ['sweet', 'floral']), 'цветы': ('Flowers', ['floral']),
    'цитрус': ('Citrus', ['citrus']), 'цитрусы': ('Citrus', ['citrus']),
    'черешня': ('Sweet cherry', ['berry']), 'черная смородина': ('Blackcurrant', ['berry']),
    'черная шелковица': ('Black mulberry', ['berry']), 'черный чай': ('Black tea', ['tea']),
    'черный чай с жасмином': ('Jasmine black tea', ['tea', 'floral']), 'шоколад': ('Chocolate', ['chocolate']),
    'яблоко': ('Apple', ['stoneFruit']), 'ягоды': ('Berries', ['berry']),
}

# Your +/- marks → stars (the conversion table you gave). "?" and blank stay unrated.
RATING = {'+++': 5.0, '++': 4.5, '++-': 4.0, '+': 3.5, '+-': 3.0, '-+': 2.5, '-++': 2.5, '-': 2.0}

COUNTRY = {'Kenya': ('KE', 'east-africa'), 'Ethiopia': ('ET', 'east-africa'), 'Rwanda': ('RW', 'east-africa'),
           'Papua New Guinea': ('PG', 'asia-pacific'), 'Colombia': ('CO', 'south-america'),
           'El Salvador': ('SV', 'central-america'), 'Guatemala': ('GT', 'central-america'), 'Honduras': ('HN', 'central-america')}

def process_of(row):
    p = row['Process'].strip().lower()
    roast_col = row['Roast'].strip().lower()
    name = row['Sort'].strip().lower()
    if 'ферментация: анаэробная' in roast_col:  # Worka Chelichele: process notes ended up in the Roast column
        return 'anaerobic', 'Мытая, анаэробная ферментация 24 ч в дрожжах', 'Washed, anaerobic fermentation 24 h with yeast'
    if 'black honey' in name:
        return 'honey', 'Black Honey', 'Black honey'
    table = [
        ('анаэробная, медово-винные дрожжи', 'anaerobic', 'Анаэробная, медово-винные дрожжи', 'Anaerobic, honey-wine yeast'),
        ('анаэробная, мытая', 'anaerobic', 'Анаэробная, мытая', 'Anaerobic washed'),
        ('полуанаэробная', 'anaerobic', 'Полуанаэробная', 'Semi-anaerobic'),
        ('аэробная, мытая', 'washed', 'Аэробная ферментация, мытая', 'Aerobic fermentation, washed'),
        ('мытая, ферментация', 'washed', 'Мытая, ферментация', 'Washed, fermented'),
        ('мытая', 'washed', '', ''), ('натуральная', 'natural', '', ''), ('хани', 'honey', '', ''),
    ]
    for key, proc, ru, en in table:
        if p == key or (key in p and p != '-'):
            return proc, ru, en
    return 'unknown', '', ''

def roast_of(row):
    r = row['Roast'].strip().lower()
    roast_for = 'filter' if 'фильтр' in r else 'unknown'
    if 'medium-light' in r or 'lig-med' in r or 'light - medium' in r: return 'medium-light', roast_for
    if r == 'light': return 'light', roast_for
    if r == 'medium': return 'medium', roast_for
    return 'unknown', roast_for

def area_producer(row):
    reg = row['Region'].strip()
    if not reg:
        return '', ''
    area, producer = reg, ''
    m = re.match(r'^(.*?);\s*(?:Farmer|Producer)\s*[-:]\s*(.*)$', reg)
    if m:
        area, producer = m.group(1), m.group(2)
    area = re.sub(r'^Production area:\s*', '', area).strip()
    area = {'Armenia - Quindio': 'Armenia, Quindío', 'Huila Acevedo': 'Huila, Acevedo'}.get(area, area)
    producer = producer.replace(', Veci project', ' (Veci project)').strip()
    return area, producer

def name_of(row, area):
    s = row['Sort'].strip()
    m = re.match(r'^By Dabov, region (.*)$', s)
    if m:
        return m.group(1)
    return s or area

def notes_of(taste):
    """Ordered descriptors (taste before aroma before aftertaste) plus structure hints."""
    sections = {'вкус': [], 'аромат': [], 'послевкусие': [], 'тело': [], '': []}
    for line in taste.split('\n'):
        line = line.strip()
        if not line:
            continue
        m = re.match(r'^(аромат|вкус|послевкусие|тело)\s*:\s*(.*)$', line, re.I)
        key, part = (m.group(1).lower(), m.group(2)) if m else ('', line)
        sections[key] += [d.strip() for d in part.split(',') if d.strip()]
    ordered = sections['вкус'] + sections[''] + sections['аромат'] + sections['послевкусие']
    notes, extra, acidity, body, sweetness = [], [], None, None, None
    for d in ordered:
        k = d.lower()
        if k == 'medium acidity': acidity = 3; continue
        if k == 'сладкое': sweetness = 4; continue
        if k == 'длительный': continue
        if k == 'ягодное': extra.append('berry'); continue
        if k not in D:
            raise SystemExit(f'unknown descriptor: {d!r}')
        if k not in [n.lower() for n in notes]:
            notes.append(d)
    for b in sections['тело']:
        k = b.lower()
        if k == 'чайное': body = 2; extra.append('tea')
        elif k in ('гладкое', 'округлое'): body = body or 3
    return notes, extra, acidity, body, sweetness

def flavors_of(notes, extra):
    out = {f: 0 for f in FLAVORS}
    for i, n in enumerate(notes):
        w = 3 if i < 2 else 2 if i < 4 else 1
        for j, c in enumerate(D[n.lower()][1]):
            out[c] = max(out[c], w if j == 0 else max(1, w - 1))
    for c in extra:
        out[c] = max(out[c], 1)
    return {k: round(v / 3, 4) for k, v in out.items()}

rows = list(csv.DictReader(open(SRC, encoding='utf-8-sig')))
now = int(time.time() * 1000)
coffees, report = [], []
for i, row in enumerate(rows):
    country = row['Country'].strip()
    code, region = COUNTRY[country]
    proc, detail_ru, detail_en = process_of(row)
    roast, roast_for = roast_of(row)
    area, producer = area_producer(row)
    name = name_of(row, area)
    notes, extra, acidity, body, sweetness = notes_of(row['Taste'])
    if (row['Comments'] or '').strip().lower().startswith('кислый'):
        acidity = 4
    mark = re.sub(r'\s+', '', row['Rating'].strip())
    rating = RATING.get(mark)
    comment_parts = [f'Notion: {row["Rating"].strip() or "без оценки"}']
    if row['Comments'].strip():
        comment_parts.append(row['Comments'].strip())
    # Keep Notion order: first row is the oldest entry.
    created = now - (len(rows) - i) * 86_400_000
    cap = lambda s: s[:1].upper() + s[1:]
    coffees.append({
        'createdAt': created,
        'photo': None,
        'roaster': row['Brand'].strip(),
        'name': name,
        'country': country,
        'countryCodes': [code],
        'area': area,
        'producer': producer,
        'varieties': [],
        'process': proc,
        'processDetail': detail_ru,
        'altitude': None,
        'roast': roast,
        'roastFor': roast_for,
        'region': region,
        'notes': [cap(n) for n in notes],
        'translations': {
            'en': {'notes': [D[n.lower()][0] for n in notes], 'processDetail': detail_en},
            'ru': {'notes': [cap(n) for n in notes], 'processDetail': detail_ru},
        },
        'flavors': flavors_of(notes, extra),
        'flavorsEstimated': False,
        'structure': {'acidity': acidity, 'body': body, 'sweetness': sweetness},
        'scaScore': None,
        'rating': rating,
        'ratedAt': created if rating is not None else None,
        'comment': '. '.join(comment_parts),
    })
    report.append((row['Brand'].strip(), name, country, row['Rating'].strip(), rating, proc, roast, len(notes)))

json.dump({'app': 'coffee-shelf', 'version': 1, 'coffees': coffees}, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for r in report:
    print(' | '.join(str(x) for x in r))
print(f'\n{len(coffees)} coffees, {sum(c["rating"] is not None for c in coffees)} rated -> {OUT}')
