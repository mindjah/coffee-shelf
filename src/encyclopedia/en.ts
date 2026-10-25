import type { Book } from './types'

const book: Book = [
  {
    id: 'basics',
    title: 'Basics',
    summary: 'What specialty means, arabica and robusta, the road from farm to cup',
    articles: [
      {
        title: 'What specialty coffee is',
        lead: 'Coffee that scores 80+ out of 100 on the SCA scale and can be traced back to the farm.',
        text: [
          'Specialty isn’t a bean type or a roast style — it’s a quality level. Trained tasters (Q graders) assess the green coffee: almost no defects, a clean cup, clear sweetness and acidity. Lots from 80 points up count as specialty; everything below is commercial coffee.',
          'The second sign is transparency: you know where the coffee grew, who grew it, how it was processed and when it was roasted. The more a bag tells you, the more likely there’s a specific lot behind it rather than a mix from “somewhere in Brazil”.',
        ],
        facts: [
          ['80–84.99', 'very good'],
          ['85–89.99', 'excellent'],
          ['90+', 'outstanding, rare'],
        ],
      },
      {
        title: 'Arabica, robusta and other species',
        lead: 'Nearly all specialty is arabica; robusta is more bitter, stronger and cheaper.',
        text: [
          'Coffea arabica is a natural hybrid of two species, native to the forests of south-western Ethiopia. It grows high in the mountains, is fussy about climate and disease and yields less — but tastes more complex: fruity acidity, sweetness, florals.',
          'Coffea canephora (robusta) grows lower and resists disease. In the cup: bitterness, woody and earthy notes, heavy body and thick espresso crema. Specialty “fine robusta” exists, but it’s rare.',
          'There are rarities too: liberica and excelsa — big beans with an unusual smoky-fruity taste, mostly from South-East Asia.',
        ],
        facts: [
          ['World share', 'arabica ~60%, robusta ~40%'],
          ['Caffeine', 'arabica 1.2–1.5%, robusta 2.2–2.7%'],
          ['Altitude', 'arabica 1000–2300 m, robusta 0–800 m'],
        ],
      },
      {
        title: 'The coffee cherry',
        lead: 'A coffee bean is the seed of a cherry-like fruit; usually there are two per cherry.',
        text: [
          'Outside is the skin, then sweet pulp, then a sticky layer of mucilage, a hard shell (parchment) and a thin silver skin. Inside are two seeds, flat sides facing each other.',
          'Sometimes only one seed develops, and it’s round. That’s a peaberry; it’s sorted out separately and often tastes more concentrated.',
          'How those layers come off is what processing means — and it shapes the flavor a lot.',
        ],
        tip: 'The dried skin and pulp are brewed like tea — that’s cascara.',
      },
      {
        title: 'From farm to cup',
        lead: 'Picking → processing → drying → resting → milling and sorting → export → roasting → brewing.',
        steps: [
          'Picking: for specialty, cherries are hand-picked, ripe only, in several passes.',
          'Processing: skin and pulp come off (or the whole cherry is dried) — see “Processing”.',
          'Drying to 10–12% moisture on patios or raised beds — 1 to 4 weeks.',
          'Resting (reposo) in parchment for 1–3 months so moisture evens out.',
          'Dry mill: parchment comes off; beans are sorted by size, density and color, and defects are removed.',
          'Export in bags with liners (GrainPro); the sea voyage takes weeks.',
          'Roasting: the roaster designs a profile for the lot.',
          'Brewing — the last and quickest step, and still easy to get wrong.',
        ],
      },
      {
        title: 'The waves of coffee',
        lead: 'From a tin of instant to coffee with the farmer’s name on it.',
        terms: [
          ['First wave', 'Coffee as a mass product: instant, tins of ground coffee, availability first.'],
          ['Second wave', 'Coffee chains and espresso drinks: latte, cappuccino, coffee as an experience. Usually dark roasts.'],
          ['Third wave', 'Coffee with an origin: light roasts, manual brewing, attention to farm and processing.'],
          ['What’s next', 'Brewing science, fermentation experiments, direct relationships with farmers.'],
        ],
      },
      {
        title: 'Scores, competitions and auctions',
        lead: 'How coffee gets its points and why some lots cost hundreds of euros a kilo.',
        text: [
          'Professional evaluation is called cupping: tasters follow one protocol, taste the same lot and score aroma, flavor, acidity, body, balance and aftertaste. Since 2024 the SCA has been moving to its new CVA system, which separates describing a coffee from scoring its quality.',
          'Cup of Excellence runs national competitions where a country’s best lots go through several rounds of blind tasting and are sold at online auction. Best of Panama winners (usually Gesha) fetch record prices.',
          'Barista (WBC), Brewers Cup and AeroPress championships set trends — many popular recipes come from them.',
        ],
      },
      {
        title: 'Price and fairness',
        lead: 'Why specialty costs more and where the money goes.',
        text: [
          'Commercial coffee trades on the exchange (the C-market), and the price is often below what it costs a farmer to grow it. Specialty is bought on quality, with a premium that lets the farmer invest in picking ripe cherries and careful processing.',
          'Direct trade isn’t a certificate but a practice: the roaster knows the farm and pays directly or through an importer. Many roasters publish what they paid — a good sign.',
        ],
        tip: 'Compare bags by price per 100 g — Coffee Shelf works it out when you enter the price and weight.',
      },
    ],
  },
  {
    id: 'sca',
    title: 'SCA & standards',
    summary: 'What the SCA is, how beans and cups are graded, the Golden Cup, water, education and championships',
    articles: [
      {
        title: 'What the SCA is',
        lead: 'The Specialty Coffee Association — a non-profit that sets the standards for specialty coffee.',
        text: [
          'The SCA was formed in 2017 when the American SCAA (founded 1982) and the European SCAE (1998) merged. Its members are farmers, importers, roasters, baristas, equipment makers and researchers.',
          'It writes standards (green grading, cupping, brewing, water), funds research, runs education and holds trade shows: Specialty Coffee Expo in the US and World of Coffee in Europe. Championships are run by its World Coffee Events arm.',
        ],
        tip: '“85 SCA points” on a bag means a score on the SCA protocol, not that the association itself tasted the coffee.',
      },
      {
        title: 'Specialty-grade green coffee',
        lead: 'Before tasting, beans are checked for defects — specialty has almost none.',
        facts: [
          ['Sample', '350 g of green coffee'],
          ['Primary defects', '0'],
          ['Total defects', '5 at most'],
          ['Moisture', '9–13%'],
          ['Quakers', '0 in 100 g roasted'],
          ['Cupping', '80 points or more'],
        ],
        terms: [
          ['Primary defects', 'fully black or sour beans, whole dried cherries, mold, stones, severe insect damage — one of these spoils a cup badly.'],
          ['Secondary defects', 'partly black or sour, unripe, broken, withered beans, parchment — counted in groups (for example, 5 broken = 1 defect).'],
        ],
      },
      {
        title: 'The SCA cupping form (2004)',
        lead: 'The classic 100-point scale: ten attributes worth 10 points each, minus defects.',
        facts: [
          ['6–6.75', 'good'],
          ['7–7.75', 'very good'],
          ['8–8.75', 'excellent'],
          ['9–9.75', 'outstanding'],
        ],
        text: [
          'Quality attributes are scored from 6 to 9.75 in steps of 0.25, so in practice the scale doesn’t start at zero: ordinary commercial coffee lands at 70–79, specialty at 80+.',
        ],
        terms: [
          ['Fragrance/aroma', 'the smell of the dry grounds and the brew.'],
          ['Flavor', 'the main impression in the mouth and nose.'],
          ['Aftertaste', 'how long and how pleasant it lasts after swallowing.'],
          ['Acidity', 'brightness; quality is scored, not quantity.'],
          ['Body', 'richness and texture.'],
          ['Balance', 'how the attributes work together.'],
          ['Uniformity, clean cup, sweetness', '2 points for each of the sample’s five cups.'],
          ['Overall', 'the cupper’s personal judgement.'],
          ['Defects', '−2 for a taint and −4 for a fault in each affected cup.'],
        ],
      },
      {
        title: 'CVA — the new assessment',
        lead: 'Since 2024 the SCA separates “what this coffee is” from “how good it is”.',
        text: [
          'The Coffee Value Assessment replaces the 2004 cupping form. On the old form one number described intensity, quality and the cupper’s taste all at once — body “8” could mean “a lot” or “good”.',
          'Now the assessment has separate parts that don’t mix. The familiar 100-point number stays, but a description of the taste comes with it.',
        ],
        terms: [
          ['Physical', 'inspecting the green coffee: defects, moisture, size.'],
          ['Descriptive', 'intensity of aroma, flavor, acidity, sweetness and body, plus the notes ticked — no good or bad.'],
          ['Affective', 'an impression of quality on a 1–9 scale; the final score is calculated from it.'],
          ['Extrinsic', 'everything outside the cup: origin, certifications, the farm’s story — things that also shape value.'],
        ],
      },
      {
        title: 'The Golden Cup',
        lead: 'The SCA standard for filter coffee: how much coffee to use and what strength to aim for.',
        facts: [
          ['Ratio', '55 g per 1 L of water (±10%)'],
          ['Extraction', '18–22%'],
          ['Strength (TDS)', '1.15–1.35%'],
          ['Water', '92–96 °C'],
        ],
        text: [
          'It’s built on the Brewing Control Chart: strength on one axis, extraction on the other. The center is the “ideal” zone; left is under-extracted (sour), right over-extracted (bitter), above too strong, below watery.',
          '55 g/L is about 1:18. Many people now brew a little stronger (1:15–1:17) — the standard is a reference, not a rule.',
        ],
        tip: 'Without a refractometer, go by taste: sour — finer, bitter — coarser (see “Brewing basics”).',
      },
      {
        title: 'The water standard',
        lead: 'What water lets coffee shine: clean, odorless, with a moderate amount of minerals.',
        facts: [
          ['Total dissolved solids', '150 mg/L (75–250)'],
          ['Calcium hardness', '68 mg/L as CaCO₃ (17–85)'],
          ['Alkalinity', 'about 40 mg/L'],
          ['pH', '7.0 (6.5–7.5)'],
          ['Sodium', 'about 10 mg/L'],
          ['Chlorine', '0'],
        ],
        text: [
          'Calcium and magnesium help extract flavor; alkalinity (bicarbonates) buffers acidity — too little and coffee is sharp and sour, too much and it’s flat and chalky. The SCA Water Quality Handbook (2018) gives wider ranges: total hardness 50–175 mg/L, alkalinity 40–75 mg/L.',
        ],
      },
      {
        title: 'Education and certificates',
        lead: 'SCA courses for baristas, roasters and tasters — and how a Q grader differs.',
        terms: [
          ['Coffee Skills Program', 'modules: Introduction to Coffee, Barista Skills, Brewing, Sensory Skills, Green Coffee, Roasting. Levels: Foundation, Intermediate, Professional.'],
          ['Coffee Diploma', 'awarded for a set of modules and points.'],
          ['Q grader', 'a certificate from another organization, the Coffee Quality Institute (CQI). Q graders score coffee to the SCA protocol and recalibrate every three years.'],
        ],
      },
      {
        title: 'Championships and shows',
        lead: 'Where new recipes, processing methods and trends appear.',
        terms: [
          ['World Barista Championship', 'espresso, a milk drink and a signature drink in 15 minutes.'],
          ['World Brewers Cup', 'manual brewing: a compulsory and an open round.'],
          ['Cup Tasters', 'find the odd cup out in each set of three, against the clock.'],
          ['Latte Art, Coffee Roasting, Coffee in Good Spirits, Cezve/Ibrik', 'more World Coffee Events championships.'],
          ['World AeroPress Championship', 'independent of the SCA, held since 2008.'],
          ['Trade shows', 'Specialty Coffee Expo (US) and World of Coffee (Europe).'],
        ],
      },
      {
        title: 'The SCA flavor wheel',
        lead: 'A shared vocabulary of flavors, made with World Coffee Research.',
        text: [
          'The 2016 wheel is built on the WCR Sensory Lexicon — each word has a reference (a specific jam or spice, say) so tasters in different countries mean the same thing. General categories sit in the middle, specific notes at the edge. More in “Tasting”.',
        ],
      },
    ],
  },
  {
    id: 'origins',
    title: 'Origins',
    summary: 'What to expect from Ethiopia, Kenya, Colombia and other countries',
    articles: [
      {
        title: 'Altitude and terroir',
        lead: 'The higher coffee grows, the slower it ripens — and the brighter and more complex it tastes.',
        text: [
          'The coffee belt lies between the Tropics of Cancer and Capricorn. Up high it’s cooler, cherries ripen longer, and beans grow denser, with more sugars and acids.',
          'Soil (volcanic is often a plus), rainfall, shade trees, variety and, most of all, processing shape the taste too. So a country is a hint, not a guarantee.',
        ],
        facts: [
          ['Below 1200 m', 'mild, nutty, chocolatey'],
          ['1200–1800 m', 'balanced, sweet, fruity'],
          ['Above 1800 m', 'bright acidity, florals, berries'],
        ],
      },
      {
        title: 'Ethiopia',
        lead: 'The birthplace of arabica: florals, bergamot, citrus — and blueberry in naturals.',
        text: [
          'Ethiopia grows thousands of local varieties (landraces), so bags often just say “heirloom” or list selections like 74110 and 74112. Smallholders deliver cherries to washing stations.',
          'Washed lots are tea-like and floral, with jasmine, lemon and bergamot. Naturals are juicy, with strawberry, blueberry and tropical fruit.',
        ],
        terms: [
          ['Yirgacheffe', 'jasmine, lemon, bergamot, tea-like body'],
          ['Sidamo (Sidama)', 'berries, citrus, sweetness'],
          ['Guji', 'peach, berries, florals, vivid naturals'],
          ['Harrar', 'natural, winey, spicy, blueberry'],
          ['Limu, Jimma', 'softer, more balanced, spice'],
        ],
      },
      {
        title: 'Kenya',
        lead: 'Blackcurrant, grapefruit, tomato and very juicy acidity.',
        text: [
          'Kenyan coffee is nearly always washed (often double-fermented) and grown at 1500–2100 m. The classic varieties are SL28 and SL34, bred in the 1930s; newer ones are the disease-resistant Ruiru 11 and Batian.',
          'Beans are graded by size: AA is the largest, AB medium, PB peaberry. Size isn’t taste, but AA usually costs more.',
        ],
        tip: 'Nyeri and Kirinyaga are the classic regions for vivid Kenyan cups.',
      },
      {
        title: 'More of Africa',
        lead: 'Rwanda and Burundi — red berries and tea; Uganda and Tanzania — chocolate to citrus.',
        terms: [
          ['Rwanda', 'redcurrant, tea, florals. Bourbon at 1500–2000 m.'],
          ['Burundi', 'close to Rwanda: berries, sweetness, clarity.'],
          ['Tanzania', 'bright, citrusy; known for peaberries.'],
          ['Uganda', 'mostly robusta, but arabica from Mount Elgon is chocolatey and fruity.'],
          ['Malawi, Zambia, Congo', 'rarer, sometimes very interesting lots.'],
        ],
        tip: 'The “potato defect” sometimes shows up in Rwanda and Burundi: one bean can smell of raw potato. It isn’t your brewing.',
      },
      {
        title: 'Colombia',
        lead: 'Caramel, red fruit, balance — and two harvests a year.',
        text: [
          'Mountains and the equator give Colombia two picking seasons, so fresh crop arrives almost all year. Many small farms and washed coffees, though experimental fermentations are now popular too.',
          'Varieties include Castillo, Caturra and Colombia, plus trendy Pink Bourbon, Sidra and Gesha.',
        ],
        terms: [
          ['Huila', 'fruity, bright, sweet'],
          ['Nariño', 'high altitude, citrus, florals'],
          ['Cauca, Tolima', 'sweetness, red fruit'],
          ['Antioquia', 'the classic balanced profile'],
        ],
      },
      {
        title: 'Brazil',
        lead: 'The largest producer: nuts, chocolate, caramel, low acidity.',
        text: [
          'Brazil grows about a third of the world’s coffee. Many farms are large and mechanised and altitudes are modest, so the taste is mild and sweet. Natural and pulped natural processing are typical.',
          'Brazil is the base of many espresso blends, adding body, sweetness and chocolate. Bright lots from higher areas (Caparaó, Mantiqueira) exist too.',
        ],
        tip: 'Regions: Cerrado Mineiro, Sul de Minas, Mogiana, Mantiqueira.',
      },
      {
        title: 'More of South America',
        lead: 'Peru, Bolivia and Ecuador — highlands, sweetness and more and more rare lots.',
        terms: [
          ['Peru', 'mild, sweet, often organic; the north (Cajamarca) is brighter.'],
          ['Bolivia', 'high farms, florals and berries; little coffee, and not cheap.'],
          ['Ecuador', 'small volumes; Typica and Sidra from 1500–2200 m are often very complex.'],
        ],
      },
      {
        title: 'Central America',
        lead: 'From chocolatey Guatemala to Panama’s Gesha.',
        terms: [
          ['Guatemala', 'chocolate, spice, apple. Antigua, Huehuetenango, Acatenango.'],
          ['Costa Rica', 'home of honey processing and micro-mills; Tarrazú region. Sweet and clean.'],
          ['Panama', 'world-class Gesha (Boquete), florals, bergamot, record prices.'],
          ['El Salvador', 'Bourbon and Pacamara, sweetness and gentle acidity.'],
          ['Honduras, Nicaragua', 'sweet, caramel, sometimes very bright lots.'],
          ['Mexico', 'mild, nutty; Chiapas and Oaxaca.'],
        ],
      },
      {
        title: 'Asia and Yemen',
        lead: 'Earthy Sumatra, spicy Yemen, and ever more interesting China and India.',
        terms: [
          ['Yemen', 'the oldest coffee farming: dried fruit, spice, wine. The port of Mocha gave “mocha” its name.'],
          ['Indonesia', 'Sumatra is wet-hulled (giling basah): earthy, herbal, heavy body, little acidity.'],
          ['India', '“Monsooned Malabar” is aged in monsoon winds: soft, spicy, no acidity.'],
          ['China', 'Yunnan: from nutty to bright experimental lots.'],
          ['Papua New Guinea', 'tropical fruit, herbs, smallholders.'],
        ],
      },
    ],
  },
  {
    id: 'varieties',
    title: 'Varieties',
    summary: 'Gesha, Bourbon, SL28 and others — how the cultivar shapes the cup',
    articles: [
      {
        title: 'What a variety is',
        lead: 'Like grape varieties: it decides yield, hardiness and taste.',
        text: [
          'Arabica has many varieties (varietals, cultivars). Some are natural mutations, others the result of breeding. Farmers trade taste against yield: the tastiest varieties often get sick and bear little fruit.',
          'The main threat is leaf rust. Hybrids with some robusta in them (Catimor, Sarchimor, Castillo) resist it, but usually taste simpler.',
        ],
      },
      {
        title: 'Typica and Bourbon',
        lead: 'The two old “ancestors” of almost all cultivated arabica.',
        terms: [
          ['Typica', 'one of the first varieties taken out of Yemen. Clean, sweet, low yield.'],
          ['Bourbon', 'from Bourbon island (Réunion). Sweet, caramel, complex. Red, yellow and pink (Pink Bourbon).'],
          ['Caturra', 'a dwarf Bourbon mutation from Brazil: bright acidity, compact trees.'],
          ['Catuai', 'Mundo Novo × Caturra: productive, mild; common in Brazil and Central America.'],
          ['Mundo Novo', 'Typica × Bourbon, tall trees, the backbone of Brazilian coffee.'],
        ],
      },
      {
        title: 'Gesha (Geisha)',
        lead: 'Jasmine, bergamot, peach, tea-like body — and the highest prices.',
        text: [
          'Found in Ethiopia’s Gori Gesha forest but made famous in Panama: in 2004, Gesha from Hacienda La Esmeralda won Best of Panama and changed the market.',
          'Today it’s grown in Colombia, Ethiopia, Costa Rica and beyond. It shines in light roasts and pour-over.',
        ],
        tip: 'Brew Gesha a little cooler (90–93 °C) and not too fine — the floral notes are delicate.',
      },
      {
        title: 'Kenya’s SL28 and SL34',
        lead: 'Blackcurrant, juicy acidity, complexity.',
        text: [
          'Bred by Scott Agricultural Laboratories in Kenya in the 1930s. SL28 tolerates drought and gives the famous Kenyan acidity; SL34 copes better with rain and is a bit softer.',
          'They’re also grown in Uganda, Rwanda and Latin America, often keeping their berry character.',
        ],
      },
      {
        title: 'Ethiopian landraces',
        lead: '“Heirloom” means thousands of wild and local forms, not one variety.',
        text: [
          'Ethiopia’s forests are arabica’s genetic home. Farmers grow a mix of local forms, and the JARC research center selected the best: 74110, 74112, 74158 and others. Bags often just say landrace or heirloom.',
        ],
      },
      {
        title: 'Pacamara, Sidra and other trendy varieties',
        lead: 'Big beans, unusual aromas, often competition lots.',
        terms: [
          ['Pacamara', 'Pacas × Maragogipe from El Salvador. Very large beans; herbs, tropical fruit, chocolate.'],
          ['Maragogipe', 'the “elephant bean”, mild taste, more curiosity than benchmark.'],
          ['Sidra', 'from Ecuador, likely of Ethiopian origin; florals, fruit, sweetness.'],
          ['Pink Bourbon', 'a Colombian star: florals, red fruit, bright acidity.'],
          ['Wush Wush', 'an Ethiopian form; in Colombia it gives berries and spice.'],
          ['Castillo', 'a Colombian rust-resistant hybrid, very good when processed well.'],
        ],
      },
    ],
  },
  {
    id: 'processing',
    title: 'Processing',
    summary: 'Washed, natural, honey, anaerobic, thermal shock, barrels — how processing changes the taste',
    articles: [
      {
        title: 'Why processing matters',
        lead: 'The cherry has to become a dry bean — and how that happens matters as much as the country.',
        text: [
          'A fresh cherry is juicy and spoils fast. Processing removes skin, pulp and mucilage (or dries it all together) and brings the bean down to 10–12% moisture.',
          'While mucilage and pulp touch the bean, it ferments: yeasts and bacteria turn sugars into acids and aromas. The longer and more intense the contact, the fruitier and bolder the cup.',
        ],
        facts: [
          ['Clarity', 'washed > honey > natural'],
          ['Fruit and body', 'natural > honey > washed'],
        ],
      },
      {
        title: 'Washed',
        lead: 'A clean, transparent cup with bright acidity — the voice of the place itself.',
        steps: [
          'Cherries are floated in water; floaters (unripe and empty) are removed.',
          'A depulper strips skin and pulp.',
          'Beans in mucilage ferment in tanks for 12–72 hours until it comes loose.',
          'They’re washed in clean water (in Kenya often twice, with soaking).',
          'Dried in parchment for 1–3 weeks.',
        ],
        tip: 'To learn how a region or variety tastes, pick a washed lot.',
      },
      {
        title: 'Natural (dry)',
        lead: 'The whole cherry is dried: berries, wine, tropical fruit, heavy body.',
        text: [
          'The oldest method: whole cherries are spread on patios or raised beds and dried for 2–4 weeks, turned regularly. Pulp sugars and long fermentation give vivid fruit, sweetness, sometimes winey or boozy notes.',
          'The risk is an over-fermented, “dirty” cup if drying is careless. A good natural is juicy and clean; a bad one tastes of vinegar and rotten fruit.',
        ],
      },
      {
        title: 'Honey and pulped natural',
        lead: 'The skin comes off, the mucilage dries on the bean: sweet and round.',
        text: [
          'A middle way between washed and natural. The name comes from the sticky, honey-like mucilage, not from honey. Popular in Costa Rica and El Salvador; Brazil’s similar method is called pulped natural.',
        ],
        terms: [
          ['White / yellow honey', 'less mucilage, fast drying — closer to washed.'],
          ['Red honey', 'more mucilage, longer drying — more fruit.'],
          ['Black honey', 'the most mucilage, slow drying in shade — closer to natural.'],
        ],
      },
      {
        title: 'Anaerobic and carbonic maceration',
        lead: 'Fermentation without oxygen: intense, vivid, sometimes rum-like.',
        text: [
          'Cherries or beans are sealed in tanks, sometimes with a valve or flushed with carbon dioxide. Without oxygen different microbes take over, and the taste gets explosive: tropical fruit, cinnamon, bubblegum, rum, yogurt.',
          'Carbonic maceration comes from winemaking; Sasa Sestic made it famous in coffee by winning the 2015 World Barista Championship.',
          'Other experiments — lactic fermentation, thermal shock, yeasts, barrel aging — are described below.',
        ],
        tip: 'If an anaerobic coffee feels like “too much”, grind a bit coarser and brew cooler — the fermentation notes soften.',
      },
      {
        title: 'Lactic fermentation',
        lead: 'Fermentation led by lactic acid bacteria: creamy and soft, with yogurt and butter.',
        text: [
          'Coffee is fermented without oxygen in a way that lets lactic acid bacteria take over; sometimes they’re added on purpose. Instead of malic and citric acid, the cup gets more lactic acid — soft and round.',
          'Taste: yogurt, cream, butter, ripe fruit, sometimes cheese. Heavy body, gentle acidity.',
        ],
      },
      {
        title: 'Thermal shock',
        lead: 'After a long fermentation the coffee is washed with hot, then cold water: aromas as vivid as candy.',
        text: [
          'Made famous by Colombian farmer Diego Bermúdez (Finca El Paraíso, Cauca). Cherries or beans first ferment for a long time without oxygen, then the temperature is changed sharply: hot water, then cold. The idea is to “open” the bean and lock in the fermentation aromas.',
          'The taste is very intense: tropical fruit, berries, florals, candy. These lots are often mistaken for flavored ones, but nothing is added.',
        ],
      },
      {
        title: 'Yeasts, starters and koji',
        lead: 'Fermentation is steered by adding chosen microbes — as in wine, bread and sake.',
        terms: [
          ['Selected yeasts', 'strains from winemaking and brewing. Fermentation is more predictable; the cup cleaner and fruitier.'],
          ['Mosto', 'fermenting juice from a previous batch is added to the next, like a sourdough starter. Popular in Colombia; adds sweetness and fruit.'],
          ['Koji', 'the Aspergillus oryzae mold used for sake and miso. A rare experiment: sweetness, soft acidity, unusual depth.'],
          ['Wine yeasts', 'give winey, berry, sometimes boozy notes.'],
        ],
      },
      {
        title: 'Double and extended fermentation',
        lead: 'More time in contact with pulp and mucilage — more fruit and complexity.',
        terms: [
          ['Double (Kenya)', 'coffee is fermented, washed and soaked again — the classic Kenyan clarity and brightness.'],
          ['Double (modern)', 'for example anaerobic in the cherry, then again in parchment in a tank.'],
          ['Extended', 'cherries ferment for 2–8 days before drying: more berries, wine, sweetness.'],
          ['Slow drying', 'drying in shade or dark rooms slows things down and makes the cup more even and sweeter.'],
        ],
      },
      {
        title: 'Barrel aged',
        lead: 'Green coffee rests in whisky, rum or wine barrels and soaks up their aroma.',
        text: [
          'Green coffee goes into used barrels — bourbon, whisky, rum, sherry or wine — for a few weeks or months and is rolled regularly. The dry beans absorb aromas from the wood and the drink. There’s also barrel fermented, where cherries ferment in the barrel itself.',
          'Taste: vanilla, oak, caramel, dried fruit, warm “boozy” notes. There’s no alcohol in the cup — hardly any gets into the bean, and none survives roasting.',
          'A good roaster names the barrel and the time. The base has to be good coffee: the barrel adds to it but doesn’t fix it.',
        ],
        tip: 'Brew a little cooler (88–92 °C): the wood softens and the sweetness comes forward.',
      },
      {
        title: 'Aged and monsooned coffee',
        lead: 'Beans are aged on purpose — the taste turns soft and spicy, with no acidity.',
        terms: [
          ['Monsooned Malabar (India)', 'beans lie for weeks in open warehouses in damp monsoon winds, swelling and turning pale.'],
          ['Aged Sumatra', 'beans are stored for years: earthy, spicy, woody notes.'],
          ['Why it isn’t a defect', 'ordinary old coffee is flat and cardboardy; here the aging is controlled and makes a style of its own.'],
        ],
      },
      {
        title: 'Infused and co-fermented coffee',
        lead: 'Fruit, spices or flavorings go into the tank — a controversial practice.',
        text: [
          'In co-fermentation, things like passion fruit, cinnamon or wine yeast are added to the coffee. The cup becomes very vivid, but the taste no longer comes from the coffee alone. Part of the community calls it flavoring and expects roasters to list additions honestly on the bag.',
        ],
      },
      {
        title: 'Making sense of an experimental lot',
        lead: 'What to look for on the bag and how to brew it.',
        terms: [
          ['Anaerobic, CM, lactic', 'fermentation without oxygen, carbonic maceration, lactic — intense, but nothing added.'],
          ['Thermal shock', 'very aromatic, nothing added.'],
          ['Yeast inoculated, mosto', 'yeast or a starter added — still no outside flavors.'],
          ['Co-fermented, infused with…', 'fruit, spices or flavorings added — the taste isn’t only the coffee’s.'],
          ['Barrel aged', 'rested in a barrel — notes of wood and whatever the barrel held.'],
        ],
        tip: 'Start with a slightly coarser grind, 88–92 °C water and a 1:16–1:17 ratio. If it tastes like bubblegum with an aroma coffee can’t have (say, exactly strawberry yogurt), it’s probably infused.',
      },
      {
        title: 'Wet-hulled (giling basah)',
        lead: 'The Indonesian method: earthy, herbal, heavy body, low acidity.',
        text: [
          'In the humid climate of Sumatra and Sulawesi, parchment is hulled while the bean is still wet (30–50%), and the bare bean dries afterwards. That gives the dark green bean color and the taste: earthy, spicy, woody.',
        ],
      },
      {
        title: 'Decaf',
        lead: 'Caffeine is removed from the green bean — good decaf can be really tasty.',
        terms: [
          ['Swiss Water', 'just water and carbon filters, no chemicals.'],
          ['Sugarcane (EA)', 'ethyl acetate from sugarcane; popular in Colombia, keeps sweetness.'],
          ['CO₂', 'supercritical carbon dioxide; gentle, for large volumes.'],
          ['Methylene chloride', 'cheap and effective, used less and less in specialty.'],
        ],
        tip: 'Usually 97–99.9% of caffeine is removed. Decaf stales faster — buy small bags.',
      },
    ],
  },
  {
    id: 'roasting',
    title: 'Roasting',
    summary: 'Roast levels, what happens in the roaster, filter vs. espresso',
    articles: [
      {
        title: 'What happens during roasting',
        lead: 'In 8–15 minutes a green bean turns into an aromatic brown one.',
        steps: [
          'Drying: the bean loses water and turns yellow (up to ~150 °C), smelling of hay and bread.',
          'Maillard reactions and caramelization: the bean browns and hundreds of aromas form.',
          'First crack (~196–205 °C): steam and gas crack the bean open with a pop, like popcorn.',
          'Development: the time after first crack; it sets sweetness and roast level.',
          'Second crack (~224 °C): oils reach the surface — that’s a dark roast.',
        ],
        facts: [
          ['Weight loss', 'light 12–14%, dark 18–20%'],
          ['Development time', 'usually 15–25% of the whole roast'],
        ],
      },
      {
        title: 'Light roast',
        lead: 'Acidity, florals, fruit, the taste of origin.',
        text: [
          'The roast ends soon after first crack. Beans are light brown, dry and dense, and origin shows most clearly. The Nordic style is very light.',
          'Light beans are denser and harder to extract: grind a little finer and use hotter water (94–100 °C).',
        ],
        tip: 'If a light roast tastes grassy, like raw peanuts, it’s underdeveloped — not “meant to be”.',
      },
      {
        title: 'Medium roast',
        lead: 'Balance: caramel, chocolate, nuts and moderate acidity.',
        text: [
          'Origin still comes through, with more sweetness and body. Works for both filter and espresso. Most omni roasts are medium-light or medium.',
        ],
      },
      {
        title: 'Dark roast',
        lead: 'Bitterness, smoke, dark chocolate, roasty notes; origin fades.',
        text: [
          'The roast reaches second crack and beyond; oil appears on the surface. Roast flavors cover the bean’s own, and acidity nearly disappears.',
          'Dark beans give up their solubles easily: grind coarser and use cooler water (85–90 °C) to avoid bitterness.',
        ],
      },
      {
        title: 'Filter, espresso, omni',
        lead: 'Roasters tailor the profile to the brewing method.',
        terms: [
          ['Filter', 'lighter, aiming for acidity and clarity — for pour-over, AeroPress, French press.'],
          ['Espresso', 'a bit darker and longer in development, so a concentrated shot is sweet, not sour.'],
          ['Omni', 'a compromise that works for both, ideal for neither.'],
        ],
        tip: 'You can brew an espresso roast in a dripper: use cooler water and a coarser grind.',
      },
      {
        title: 'Agtron and bean color',
        lead: 'A number that measures roast color: higher means lighter.',
        facts: [
          ['Very light', 'Agtron 75+'],
          ['Light', '65–75'],
          ['Medium', '50–65'],
          ['Dark', 'below 45'],
        ],
        text: ['Numbers vary between devices and between whole and ground coffee, so only compare them within one roaster.'],
      },
    ],
  },
  {
    id: 'freshness',
    title: 'Freshness & storage',
    summary: 'How long to rest coffee, how to store it, and whether to freeze it',
    articles: [
      {
        title: 'Resting after roasting',
        lead: 'Freshly roasted coffee gives off gas — let it rest.',
        text: [
          'After roasting, beans release CO₂. Coffee that’s too fresh bubbles a lot, brews unevenly and can taste harsh. After a few days the flavor opens up.',
          'Light roasts need longer than dark ones. The valve on the bag lets gas out without letting air in.',
        ],
        facts: [
          ['Filter', 'best 7–30 days after roasting'],
          ['Espresso', 'best 10–40 days'],
          ['Light roast', 'often opens up only in week 2–3'],
        ],
      },
      {
        title: 'How to store coffee',
        lead: 'Airtight, opaque, cool — and as whole beans.',
        steps: [
          'Keep beans in their valve bag (air squeezed out, tightly closed) or an airtight canister.',
          'Away from light, heat and the stove.',
          'Not in the fridge: it’s humid and smells of food.',
          'Grind just before brewing — ground coffee loses aroma within minutes.',
        ],
      },
      {
        title: 'Freezing',
        lead: 'The freezer is the best way to keep coffee for months.',
        steps: [
          'Split the coffee into portions for one or two brews.',
          'Pack them airtight (vacuum, thick bags, small jars) — no air, no moisture.',
          'Grind straight from the freezer without thawing — the grind even gets more even.',
          'Don’t freeze the same portion twice.',
        ],
      },
      {
        title: 'Roast date vs. best before',
        lead: 'Look at the roast date, not the expiry.',
        text: [
          'Year-old coffee is safe, but the flavor goes much sooner. Most roasts peak in the first 1–2 months; an opened bag is best within 2–4 weeks.',
          'Signs of stale coffee: flat, cardboard taste, little aroma, and almost no bloom when brewing.',
        ],
      },
    ],
  },
  {
    id: 'brewing',
    title: 'Brewing basics',
    summary: 'Ratio, grind, temperature, water, and fixing a cup that’s off',
    articles: [
      {
        title: 'Extraction',
        lead: 'Brewing dissolves compounds from the bean; the trick is dissolving the right amount.',
        text: [
          'Acids dissolve first, then sugars, and bitter, astringent compounds last. Under-extraction tastes sour, salty and hollow; over-extraction tastes bitter, dry and astringent.',
          'Strength is how much coffee is in the cup (concentration); extraction is how much came out of the bean. They’re different: a cup can be strong yet under-extracted.',
        ],
        facts: [
          ['Extraction', '18–22% of the bean’s weight'],
          ['Filter strength', 'TDS 1.15–1.45%'],
          ['Espresso strength', 'TDS 8–12%'],
        ],
      },
      {
        title: 'Ratio',
        lead: 'For filter, start at 1:16 — 15 g of coffee to 240 g of water.',
        facts: [
          ['Pour-over', '1:15–1:17'],
          ['AeroPress', '1:12–1:17'],
          ['French press', '1:15–1:17'],
          ['Espresso', '1:2 (18 g → 36 g)'],
          ['Cold brew', '1:8–1:12'],
        ],
        tip: 'Weigh coffee and water on a scale. Scoops and eyeballing are the top reason for inconsistent cups.',
      },
      {
        title: 'Grind size',
        lead: 'The main taste dial: finer means more extraction and a slower flow.',
        terms: [
          ['Powder', 'cezve / Turkish'],
          ['Very fine', 'espresso'],
          ['Fine', 'moka pot, AeroPress'],
          ['Medium-fine', 'V60, Kalita'],
          ['Medium-coarse', 'Chemex, Clever'],
          ['Coarse', 'French press, cold brew'],
        ],
        tip: 'Change one thing at a time — usually the grind is enough.',
      },
      {
        title: 'Water temperature',
        lead: '92–96 °C almost always works; hotter for light roasts, cooler for dark.',
        facts: [
          ['Light roast', '94–100 °C'],
          ['Medium', '90–94 °C'],
          ['Dark', '85–90 °C'],
        ],
        text: ['No thermometer: boil the water and wait 30–60 seconds.'],
      },
      {
        title: 'Water',
        lead: 'Coffee is 98% water; its minerals change the taste.',
        text: [
          'Water that’s too soft or distilled makes flat, sour coffee. Water that’s too hard mutes acidity, tastes chalky and leaves scale.',
          'Filtered water or low-mineral bottled water work well. You can also mix distilled water with mineral packets (Third Wave Water, Lotus).',
        ],
        facts: [
          ['Total dissolved solids', '75–250 mg/L, target ~150'],
          ['Total hardness', '~50–175 mg/L as CaCO₃'],
          ['Alkalinity', '~40 mg/L'],
          ['pH', 'about 7'],
        ],
      },
      {
        title: 'Fixing a cup that’s off',
        lead: 'Sour — grind finer; bitter — grind coarser. The rest is fine-tuning.',
        terms: [
          ['Sour, salty, hollow', 'grind finer, use hotter water, brew longer.'],
          ['Bitter, dry, astringent', 'grind coarser, use cooler water, agitate less.'],
          ['Watery', 'more coffee (say 1:15 instead of 1:17).'],
          ['Too strong, heavy', 'more water.'],
          ['Sour and bitter at once', 'uneven extraction: check the grinder, level the bed, pour more evenly.'],
          ['Very slow drawdown', 'too many fines or too fine a grind.'],
        ],
      },
      {
        title: 'Equipment',
        lead: 'A good burr grinder matters most, then a scale.',
        terms: [
          ['Grinder', 'burr (conical or flat), not blade — the grind has to be even.'],
          ['Scale', '0.1 g resolution with a timer.'],
          ['Kettle', 'gooseneck for pour-over; temperature control is handy.'],
          ['Filters', 'paper gives a clean cup; metal gives more body and oils.'],
        ],
        tip: 'Always rinse a paper filter with hot water: it removes the papery taste and preheats the dripper.',
      },
    ],
  },
  {
    id: 'methods',
    title: 'Brew methods',
    summary: 'Step-by-step recipes: V60, AeroPress, French press, Chemex and more',
    articles: [
      {
        title: 'V60 — the classic recipe',
        lead: 'A clean, bright cup in 3 minutes; James Hoffmann’s single-cup recipe.',
        facts: [
          ['Coffee', '15 g'],
          ['Water', '250 g, 93–96 °C'],
          ['Grind', 'medium-fine, like fine salt'],
          ['Time', '~3:00–3:30'],
        ],
        steps: [
          'Rinse the filter with hot water and discard it.',
          'Add the coffee and make a small well in the middle.',
          '0:00 — pour 30–50 g of water (the bloom) and swirl so everything is wet.',
          '0:45 — pour in spirals up to 100 g over 15–20 seconds.',
          '1:15 — keep going to reach 250 g by 1:45.',
          'Give a gentle stir around the edge, then swirl the dripper so the bed settles flat.',
          'Let it drain; the coffee bed should end up flat.',
        ],
        tip: 'Drains faster than 2:45 and tastes sour — grind finer. Longer than 4:00 and bitter — coarser.',
      },
      {
        title: 'V60 — Tetsu Kasuya’s 4:6 method',
        lead: 'The 2016 world champion’s recipe: the first 40% of water sets the taste, the other 60% the strength.',
        facts: [
          ['Coffee', '20 g'],
          ['Water', '300 g, ~92 °C'],
          ['Grind', 'medium-coarse'],
          ['Time', '~3:30'],
        ],
        steps: [
          '0:00 — 50 g of water.',
          '0:45 — up to 120 g (another 70 g).',
          '1:30 — up to 180 g.',
          '2:15 — up to 240 g.',
          '3:00 — up to 300 g, then let it drain.',
        ],
        text: [
          'For a sweeter cup make the first pour smaller than the second (50 + 70); for a brighter, more acidic one, the reverse (70 + 50). For more strength split the last 60% into more pours; for less, into fewer.',
        ],
      },
      {
        title: 'AeroPress — the classic',
        lead: 'A forgiving method: steeping plus gentle pressure. Hoffmann’s recipe.',
        facts: [
          ['Coffee', '11–15 g'],
          ['Water', '200–250 g, 90–100 °C'],
          ['Grind', 'fine / medium-fine'],
          ['Time', '~3:00'],
        ],
        steps: [
          'Put in a paper filter, rinse it with hot water, set the AeroPress on a cup.',
          'Add the coffee and pour all the water.',
          'Insert the plunger about 1 cm straight away — the vacuum stops dripping.',
          'Wait 2 minutes.',
          'Gently swirl the AeroPress to settle the foam.',
          'Wait 30 seconds more and press slowly, about 30 seconds, stopping before the hiss.',
        ],
        tip: 'Bitter — grind coarser or use cooler water. Hollow and sour — finer or steep longer.',
      },
      {
        title: 'AeroPress — inverted',
        lead: 'The AeroPress stands upside down — nothing drips, so steeping is fully under control.',
        facts: [
          ['Coffee', '15 g'],
          ['Water', '220 g, 85–92 °C'],
          ['Grind', 'medium-fine'],
          ['Time', '~2:30'],
        ],
        steps: [
          'Insert the plunger about 1 cm and stand the AeroPress on it, upside down.',
          'Add the coffee, pour 50 g of water, stir and wait 30 seconds.',
          'Top up to 220 g and screw on the cap with a rinsed filter.',
          'At 1:30, carefully flip it onto a cup.',
          'Press for 20–30 seconds.',
        ],
        tip: 'Flip confidently, holding both the chamber and the plunger — hot water is dangerous.',
      },
      {
        title: 'AeroPress — concentrate',
        lead: 'A strong base for an americano or a milk drink.',
        facts: [
          ['Coffee', '18 g'],
          ['Water', '90–100 g, ~90 °C'],
          ['Grind', 'fine'],
        ],
        steps: [
          'Add the coffee, pour the water, stir hard for 10 seconds.',
          'Press after 1 minute.',
          'Top up with hot water to 200 g, or add milk.',
        ],
      },
      {
        title: 'Iced pour-over (Japanese style)',
        lead: 'Part of the water is swapped for ice in the server — bright iced coffee in 3 minutes.',
        facts: [
          ['Coffee', '20 g'],
          ['Hot water', '200 g'],
          ['Ice', '120 g in the server'],
          ['Grind', 'a bit finer than usual'],
        ],
        steps: [
          'Put the ice in the server and set the dripper on top.',
          'Brew as a normal V60, but with only 200 g of water.',
          'The coffee drips onto ice and chills at once; stir and pour over fresh ice.',
        ],
      },
      {
        title: 'Kalita Wave and flat-bottom drippers',
        lead: 'A flat bed and small holes — more even, and forgiving of uneven pouring.',
        facts: [
          ['Coffee', '20 g'],
          ['Water', '320 g, 93–96 °C'],
          ['Grind', 'medium'],
          ['Time', '3:00–3:30'],
        ],
        steps: [
          'Rinse the filter, add the coffee.',
          '0:00 — bloom with 50 g for 30 seconds.',
          'Then pour 50–70 g every 20–30 seconds, keeping the water level steady.',
          'Reach 320 g by about 2:00 and let it drain.',
        ],
      },
      {
        title: 'Chemex',
        lead: 'The thick filter gives a very clean, light cup — handy for several people.',
        facts: [
          ['Coffee', '30 g'],
          ['Water', '500 g, 94–96 °C'],
          ['Grind', 'medium-coarse'],
          ['Time', '4:00–5:00'],
        ],
        steps: [
          'Put the folded filter with the triple side toward the spout, rinse and discard the water.',
          'Bloom with 60 g of water for 45 seconds.',
          'Pour in spirals and stages up to 500 g by about 2:30.',
          'Let it drain, remove the filter, swirl the carafe.',
        ],
      },
      {
        title: 'French press',
        lead: 'A full-bodied cup. Hoffmann’s method — without the sludge.',
        facts: [
          ['Coffee', '30 g'],
          ['Water', '500 g, just off the boil'],
          ['Grind', 'medium-coarse'],
          ['Time', '~9–12 minutes'],
        ],
        steps: [
          'Add the coffee and all the water.',
          'Wait 4 minutes.',
          'Stir the crust, then skim off the foam and floating bits with two spoons.',
          'Wait another 5–8 minutes — the grounds sink on their own.',
          'Lower the plunger only to the surface and pour slowly.',
        ],
      },
      {
        title: 'Clever Dripper',
        lead: 'Steeped like a French press, filtered like a pour-over.',
        facts: [
          ['Coffee', '20 g'],
          ['Water', '320 g, 94–96 °C'],
          ['Grind', 'medium-coarse'],
          ['Time', '~3:30'],
        ],
        steps: [
          'Rinse the filter and discard the water.',
          'Pour the water first, then add the coffee — it wets more evenly.',
          'Stir after 2 minutes.',
          'Set it on a cup — the valve opens and it drains in about a minute.',
        ],
      },
      {
        title: 'Moka pot',
        lead: 'Strong, heavy coffee on the stove; not espresso, but close in spirit.',
        facts: [
          ['Ratio', '~1:7–1:10'],
          ['Grind', 'fine, but coarser than espresso'],
          ['Heat', 'medium'],
        ],
        steps: [
          'Fill the bottom chamber with hot water up to the valve, no higher.',
          'Fill the basket with coffee and level it without tamping.',
          'Assemble (hold the base with a towel) and put on medium heat, lid open.',
          'When the stream turns pale and starts to sputter, take it off the heat.',
          'Cool the base under cold water to stop extraction.',
        ],
      },
      {
        title: 'Cold brew',
        lead: 'Steeped cold for 12–18 hours: sweet, smooth, almost no acidity.',
        facts: [
          ['Coffee', '100 g'],
          ['Water', '1 L, cold'],
          ['Grind', 'coarse'],
          ['Time', '12–18 h in the fridge'],
        ],
        steps: [
          'Mix the coffee with cold water and stir.',
          'Cover and refrigerate for 12–18 hours.',
          'Strain through a sieve, then through a paper filter.',
          'That’s a concentrate: dilute 1:1 with water or milk and serve over ice.',
        ],
        tip: 'The concentrate keeps in the fridge for up to a week.',
      },
      {
        title: 'Cezve (Turkish coffee)',
        lead: 'Coffee with grounds and foam; the key is never letting it boil.',
        facts: [
          ['Coffee', '7–8 g per 70 ml'],
          ['Grind', 'powder'],
          ['Water', 'cold'],
        ],
        steps: [
          'Put the coffee (and sugar, if you like) in the cezve, add cold water, stir.',
          'Heat slowly without stirring.',
          'When the foam starts to rise, take it off the heat before it boils.',
          'Spoon the foam into cups and pour the coffee. Let the grounds settle for a minute.',
        ],
      },
    ],
  },
  {
    id: 'espresso',
    title: 'Espresso & drinks',
    summary: 'How espresso works, a shot recipe, and milk drinks',
    articles: [
      {
        title: 'What espresso is',
        lead: 'Concentrated coffee: hot water at ~9 bar for 25–30 seconds.',
        facts: [
          ['Dose', '18 g'],
          ['Yield', '36–40 g (1:2)'],
          ['Time', '25–32 s'],
          ['Temperature', '92–94 °C'],
        ],
        text: [
          'Pressure forces water through a dense puck of very finely ground coffee. The result is thick, topped with crema — foam of CO₂ and oils. Fresher coffee gives more crema, but crema says nothing about taste.',
        ],
      },
      {
        title: 'Dialing in a shot',
        lead: 'Change the grind, not the dose: time and yield are your guides.',
        terms: [
          ['Fast and sour', 'grind finer.'],
          ['Slow and bitter', 'grind coarser.'],
          ['Spurts, sour and bitter', 'channeling: distribute with needles (WDT) and tamp level.'],
          ['Light roast', 'longer ratio of 1:2.5–1:3 and higher temperature.'],
        ],
        tip: 'Ristretto is 1:1–1:1.5, normale 1:2, lungo 1:3. Turbo shots (coarser grind, ~15 s) are a modern take for light roasts.',
      },
      {
        title: 'Espresso drinks',
        lead: 'The difference is how much milk and foam.',
        terms: [
          ['Americano', 'espresso plus hot water. A long black is the reverse: espresso into water, keeping the crema.'],
          ['Macchiato', 'espresso with a spoonful of milk foam.'],
          ['Cortado', 'espresso and milk in roughly equal parts, ~120 ml.'],
          ['Flat white', 'a double espresso and thin silky foam, 150–180 ml; coffee comes first.'],
          ['Cappuccino', '150–180 ml with ~1–1.5 cm of foam.'],
          ['Latte', '240+ ml, lots of milk, thin foam — the mildest.'],
        ],
      },
      {
        title: 'Milk',
        lead: 'Steam to 55–65 °C — beyond that, milk loses its sweetness.',
        steps: [
          'Pour cold milk into a cold pitcher, up to the base of the spout.',
          'Put the steam wand just below the surface and let air in — a soft hiss.',
          'Once the volume grows by 20–50% (depending on the drink), sink the wand and spin a whirlpool.',
          'Stop when the pitcher feels hot in your hand (~60 °C).',
          'Tap the pitcher on the counter and swirl until the foam is glossy.',
        ],
        tip: '“Barista” plant milks foam better than regular ones.',
      },
    ],
  },
  {
    id: 'tasting',
    title: 'Tasting',
    summary: 'How to taste, acidity and body, the flavor wheel, cupping and defects',
    articles: [
      {
        title: 'How to taste coffee',
        lead: 'Smell, slurp, and keep tasting as it cools.',
        steps: [
          'Smell the ground coffee, then the brew.',
          'Slurp loudly — the air spreads aroma through your nose and mouth.',
          'Notice sweetness, acidity, body and aftertaste.',
          'Taste again once it’s warm rather than hot: the flavor shifts, and acidity and fruit stand out more.',
          'Compare two coffees side by side — differences become much easier to hear.',
        ],
      },
      {
        title: 'Acidity',
        lead: 'In good coffee, acidity means juiciness, not sourness.',
        terms: [
          ['Citric', 'lemon, orange, grapefruit — often Ethiopia.'],
          ['Malic', 'green apple, pear.'],
          ['Tartaric', 'grape, wine — often naturals.'],
          ['Sparkling', 'blackcurrant, brightness — Kenya.'],
          ['Lactic', 'soft, creamy, yogurt — sometimes after anaerobic fermentation.'],
          ['Acetic', 'in excess, the vinegar of an over-fermented coffee.'],
        ],
      },
      {
        title: 'Body, sweetness, aftertaste',
        lead: 'How coffee feels in the mouth and how long it lingers.',
        terms: [
          ['Body', 'texture: from light and tea-like to syrupy and creamy. Metal filters and French press add body.'],
          ['Sweetness', 'caramel, honey, ripe fruit; a sign of ripe cherries and a good roast.'],
          ['Bitterness', 'in moderation, like dark chocolate; too much means over-extraction or a dark roast.'],
          ['Aftertaste', 'long and pleasant is a mark of quality; short and dry is not.'],
          ['Balance', 'no single part of the taste overpowers the rest.'],
          ['Clean cup', 'no off or dirty flavors.'],
        ],
      },
      {
        title: 'The flavor wheel and descriptors',
        lead: 'Notes on a bag are associations, not additives: there are no blueberries in the coffee.',
        text: [
          'The SCA and World Coffee Research flavor wheel helps you name what you taste. Start at the center — fruity, sweet, nutty — and work outward: fruity → berry → blueberry.',
          'Roasters write the notes they taste when cupping. Your cup may come out differently because of water, grind and recipe — that’s normal.',
        ],
        tip: 'Taste real fruit, spices, tea and chocolate with attention — it’s the best training there is.',
      },
      {
        title: 'Cupping',
        lead: 'The standard way to compare coffees: the same conditions for every sample.',
        facts: [
          ['Coffee', '8.25 g per 150 ml'],
          ['Grind', 'medium-coarse'],
          ['Water', '~93 °C'],
        ],
        steps: [
          'Grind each sample into its own cup and smell the dry fragrance.',
          'Fill to the brim with water and start a 4-minute timer.',
          'Break the crust with a spoon and breathe in the aroma.',
          'Skim off foam and grounds with two spoons.',
          'From minute 8–10, slurp from the spoon, going back to the samples as they cool.',
        ],
      },
      {
        title: 'Common defects',
        lead: 'Some flavors aren’t a “character” but a mistake on the farm, in storage or in roasting.',
        terms: [
          ['Vinegar, rotten fruit', 'over-fermented cherries or poor drying.'],
          ['Potato', 'the “potato defect” (Rwanda, Burundi) — insect damage.'],
          ['Medicinal, iodine', 'a phenolic defect.'],
          ['Burlap, cardboard', 'old green coffee (past crop) or a stale roast.'],
          ['Raw peanut, grass', 'unripe beans (“quakers”) or an underdeveloped roast.'],
          ['Bready, flat', 'a “baked” roast — too slow.'],
          ['Ash, burnt', 'scorching in the roaster or a dark roast.'],
        ],
      },
    ],
  },
  {
    id: 'label',
    title: 'Reading a bag',
    summary: 'What each line on the bag means and what to look for when buying',
    articles: [
      {
        title: 'Origin',
        lead: 'The more precisely the place is named, the better the traceability.',
        terms: [
          ['Country and region', 'a general guide to taste.'],
          ['Farm, producer', 'a specific person or family — a sign of a separate lot.'],
          ['Washing station, cooperative', 'coffee from many smallholders, processed in one place (Ethiopia, Kenya, Rwanda).'],
          ['Microlot', 'a small batch from one plot or one picking day.'],
          ['Single origin / blend', 'one origin or a mix — blends are often made for espresso, for balance.'],
        ],
      },
      {
        title: 'Variety, process, altitude',
        lead: 'The three lines that say the most about taste.',
        text: [
          'Process hints at character: washed means clarity and acidity, natural fruit and body, anaerobic bold fermentation notes. Variety and altitude add detail: Gesha means florals, SL28 blackcurrant, 2000 m brightness.',
          'Coffee Shelf uses all these fields to learn what you like — so it’s worth filling them in when you scan.',
        ],
      },
      {
        title: 'Roast and dates',
        lead: 'Look for the roast date and the purpose: filter, espresso or omni.',
        terms: [
          ['Roast date', 'the date that matters; “best before” says almost nothing about taste.'],
          ['Harvest date', 'green coffee is best within a year of picking.'],
          ['Filter / espresso', 'tells you how to brew it.'],
          ['Roast level', 'light, medium, dark.'],
        ],
      },
      {
        title: 'Descriptors and score',
        lead: 'Flavor notes are a guide; points are a quality level.',
        text: [
          'Notes like “peach, jasmine, honey” are what the roaster tasted when cupping. A score of 85–86 is good specialty; 88+ is something special. Not every roaster prints scores, and scores from different roasters aren’t always comparable.',
        ],
      },
      {
        title: 'Certifications',
        lead: 'Organic, Fairtrade, Rainforest Alliance — about methods and conditions, not taste.',
        terms: [
          ['Organic', 'no synthetic fertilizers or pesticides.'],
          ['Fairtrade', 'a minimum price and a premium for the cooperative.'],
          ['Rainforest Alliance', 'environment and working conditions.'],
          ['Direct trade', 'not a certificate but a buying practice — see whether the roaster publishes prices.'],
        ],
      },
    ],
  },
  {
    id: 'glossary',
    title: 'Glossary',
    summary: 'Short definitions of terms you meet on bags and in recipes',
    articles: [
      {
        title: 'Key terms',
        lead: 'Bloom, TDS, peaberry, channeling and other words of the coffee world.',
        terms: [
          ['Bloom', 'the first wetting of the coffee with a little water so gas can escape.'],
          ['Blend', 'a mix of coffees from different origins.'],
          ['Cascara', 'dried skin and pulp of the coffee cherry, brewed like tea.'],
          ['Channeling', 'water finds an easy path through the coffee and extracts it unevenly.'],
          ['Crema', 'the foam on espresso, made of CO₂ and oils.'],
          ['Cupping', 'the standard professional tasting.'],
          ['Dose', 'the weight of ground coffee for one brew.'],
          ['Drawdown', 'how long the water takes to drain through the coffee at the end of a pour-over.'],
          ['Extraction (EY)', 'the share of the bean’s weight that ends up in the drink.'],
          ['Fines', 'tiny particles from grinding; they slow the flow and add bitterness.'],
          ['Green coffee', 'unroasted coffee.'],
          ['Microlot', 'a small batch from one plot or picking day.'],
          ['Mucilage', 'the sticky layer between the pulp and the parchment.'],
          ['Parchment', 'the hard shell around the bean, removed before export.'],
          ['Peaberry', 'a single round seed in a cherry instead of two.'],
          ['Pour-over', 'brewing by pouring water through coffee in a filter.'],
          ['Q grader', 'a certified taster who scores coffee to the SCA protocol.'],
          ['Quakers', 'unripe beans that stay pale after roasting; they taste of peanut and paper.'],
          ['SCA', 'the Specialty Coffee Association, which sets the standards.'],
          ['Single origin', 'coffee from one origin.'],
          ['TDS', 'the share of dissolved solids in the drink — a measure of strength.'],
          ['Terroir', 'the mix of soil, climate and altitude that shapes taste.'],
          ['WDT', 'stirring ground coffee in the portafilter with fine needles before tamping.'],
          ['Yield', 'the weight of the finished drink, especially in espresso.'],
        ],
      },
    ],
  },
]

export default book
