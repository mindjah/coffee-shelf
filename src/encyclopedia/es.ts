import type { Book } from './types'

const book: Book = [
  {
    id: 'basics',
    title: 'Fundamentos',
    summary: 'Qué es el café de especialidad, arábica y robusta, del campo a la taza',
    articles: [
      {
        title: 'Qué es el café de especialidad',
        lead: 'Café que obtiene 80+ puntos sobre 100 en la escala SCA y se puede rastrear hasta la finca.',
        text: [
          'Especialidad no es un tipo de grano ni de tueste, sino un nivel de calidad. Catadores certificados (Q graders) evalúan el café verde: casi sin defectos, taza limpia, dulzor y acidez claros. Los lotes desde 80 puntos son de especialidad; por debajo, café comercial.',
          'La segunda señal es la transparencia: se sabe dónde creció, quién lo cultivó, cómo se procesó y cuándo se tostó. Cuanto más cuenta la bolsa, más probable es que detrás haya un lote concreto y no una mezcla de «algún lugar de Brasil».',
        ],
        facts: [
          ['80–84,99', 'muy bueno'],
          ['85–89,99', 'excelente'],
          ['90+', 'excepcional, raro'],
        ],
      },
      {
        title: 'Arábica, robusta y otras especies',
        lead: 'Casi toda la especialidad es arábica; la robusta es más amarga, fuerte y barata.',
        text: [
          'Coffea arabica es un híbrido natural de dos especies, nativo de los bosques del suroeste de Etiopía. Crece en altura, es delicada con el clima y las plagas y rinde menos, pero su sabor es más complejo: acidez frutal, dulzor, notas florales.',
          'Coffea canephora (robusta) crece más abajo y resiste enfermedades. En taza: amargor, notas leñosas y terrosas, mucho cuerpo y crema espesa en espresso. Existe robusta de especialidad (fine robusta), pero es rara.',
          'También hay rarezas: liberica y excelsa, granos grandes con un sabor ahumado y frutal, sobre todo del Sudeste Asiático.',
        ],
        facts: [
          ['Producción mundial', 'arábica ~60%, robusta ~40%'],
          ['Cafeína', 'arábica 1,2–1,5%, robusta 2,2–2,7%'],
          ['Altitud', 'arábica 1000–2300 m, robusta 0–800 m'],
        ],
      },
      {
        title: 'La cereza de café',
        lead: 'El grano es la semilla de un fruto parecido a una cereza; normalmente hay dos por fruto.',
        text: [
          'Por fuera está la piel, luego la pulpa dulce, una capa pegajosa de mucílago, una cáscara dura (pergamino) y una fina película plateada. Dentro, dos semillas con las caras planas enfrentadas.',
          'A veces se desarrolla una sola semilla, redonda: es el caracolillo (peaberry). Se separa aparte y suele saber más concentrado.',
          'Cómo se retiran esas capas es lo que llamamos proceso, y cambia mucho el sabor.',
        ],
        tip: 'La piel y la pulpa secas se preparan como una infusión: es la cáscara (cascara).',
      },
      {
        title: 'Del campo a la taza',
        lead: 'Cosecha → proceso → secado → reposo → trilla y selección → exportación → tueste → preparación.',
        steps: [
          'Cosecha: en especialidad se recoge a mano, solo fruto maduro, en varias pasadas.',
          'Proceso: se quitan piel y pulpa (o se seca la cereza entera); ver «Proceso».',
          'Secado hasta 10–12% de humedad en patios o camas africanas, de 1 a 4 semanas.',
          'Reposo en pergamino durante 1–3 meses para igualar la humedad.',
          'Trilla: se quita el pergamino y se clasifica por tamaño, densidad y color, retirando defectos.',
          'Exportación en sacos con bolsas internas (GrainPro); el viaje por mar dura semanas.',
          'Tueste: el tostador diseña un perfil para cada lote.',
          'Preparación: el último paso y el más rápido, pero también fácil de estropear.',
        ],
      },
      {
        title: 'Las olas del café',
        lead: 'De la lata de soluble al café con el nombre del productor.',
        terms: [
          ['Primera ola', 'El café como producto masivo: soluble, latas de molido, lo importante es que sea accesible.'],
          ['Segunda ola', 'Cadenas de cafeterías y bebidas de espresso: latte, capuchino, el café como experiencia. Tuestes oscuros.'],
          ['Tercera ola', 'Café con origen: tuestes claros, métodos manuales, atención a la finca y al proceso.'],
          ['Lo que viene', 'Ciencia de la extracción, experimentos de fermentación, relación directa con productores.'],
        ],
      },
      {
        title: 'Puntuaciones, campeonatos y subastas',
        lead: 'Cómo se puntúa el café y por qué algunos lotes cuestan cientos de euros el kilo.',
        text: [
          'La evaluación profesional es la catación: los catadores siguen un mismo protocolo, prueban el mismo lote y puntúan aroma, sabor, acidez, cuerpo, balance y posgusto. Desde 2024 la SCA está pasando a su nuevo sistema CVA, que separa describir el café de puntuar su calidad.',
          'Cup of Excellence organiza concursos nacionales en los que los mejores lotes de un país pasan varias rondas de cata a ciegas y se venden en subasta en línea. Los ganadores de Best of Panama (casi siempre Geisha) alcanzan precios récord.',
          'Los campeonatos de barismo (WBC), Brewers Cup y AeroPress marcan tendencia: muchas recetas populares salen de ahí.',
        ],
      },
      {
        title: 'Precio y comercio justo',
        lead: 'Por qué la especialidad cuesta más y adónde va el dinero.',
        text: [
          'El café comercial cotiza en bolsa (el mercado C) y el precio a menudo no cubre lo que le cuesta al productor. La especialidad se compra por calidad, con una prima que permite al productor invertir en cosechar fruto maduro y procesar con cuidado.',
          'El comercio directo no es un sello sino una práctica: el tostador conoce la finca y paga directamente o a través de un importador. Muchos tostadores publican lo que pagaron, y es buena señal.',
        ],
        tip: 'Compara bolsas por precio cada 100 g: Coffee Shelf lo calcula si indicas precio y peso.',
      },
    ],
  },
  {
    id: 'sca',
    title: 'SCA y estándares',
    summary: 'Qué es la SCA, cómo se evalúan el grano y la taza, la Taza de Oro, el agua, la formación y los campeonatos',
    articles: [
      {
        title: 'Qué es la SCA',
        lead: 'La Specialty Coffee Association, una organización sin ánimo de lucro que fija los estándares del café de especialidad.',
        text: [
          'La SCA nació en 2017 de la fusión de la estadounidense SCAA (fundada en 1982) y la europea SCAE (1998). Reúne a productores, importadores, tostadores, baristas, fabricantes de equipos e investigadores.',
          'Redacta estándares (clasificación del verde, catación, preparación, agua), financia investigación, ofrece formación y organiza ferias: Specialty Coffee Expo en EE. UU. y World of Coffee en Europa. Los campeonatos los organiza su rama World Coffee Events.',
        ],
        tip: '«85 puntos SCA» en una bolsa significa una puntuación según el protocolo SCA, no que la asociación haya catado ese café.',
      },
      {
        title: 'Café verde de grado especialidad',
        lead: 'Antes de catarlo, el grano se revisa en busca de defectos: el de especialidad casi no tiene.',
        facts: [
          ['Muestra', '350 g de café verde'],
          ['Defectos primarios', '0'],
          ['Defectos totales', '5 como máximo'],
          ['Humedad', '9–13%'],
          ['Quakers', '0 en 100 g tostado'],
          ['Catación', '80 puntos o más'],
        ],
        terms: [
          ['Defectos primarios', 'granos negros o agrios completos, cerezas secas enteras, moho, piedras, daño grave de insectos: uno solo estropea mucho la taza.'],
          ['Defectos secundarios', 'granos parcialmente negros o agrios, inmaduros, partidos, arrugados, restos de pergamino; se cuentan por grupos (por ejemplo, 5 partidos = 1 defecto).'],
        ],
      },
      {
        title: 'El formulario de catación SCA (2004)',
        lead: 'La escala clásica de 100 puntos: diez atributos de 10 puntos cada uno, menos los defectos.',
        facts: [
          ['6–6,75', 'bueno'],
          ['7–7,75', 'muy bueno'],
          ['8–8,75', 'excelente'],
          ['9–9,75', 'excepcional'],
        ],
        text: [
          'Los atributos de calidad se puntúan de 6 a 9,75 en pasos de 0,25, así que en la práctica la escala no empieza en cero: el café comercial corriente queda en 70–79 y el de especialidad en 80+.',
        ],
        terms: [
          ['Fragancia/aroma', 'el olor del café molido y de la infusión.'],
          ['Sabor', 'la impresión principal en boca y nariz.'],
          ['Posgusto', 'cuánto dura y qué tan agradable es tras tragar.'],
          ['Acidez', 'brillo; se puntúa la calidad, no la cantidad.'],
          ['Cuerpo', 'riqueza y textura.'],
          ['Balance', 'cómo encajan los atributos entre sí.'],
          ['Uniformidad, taza limpia, dulzor', '2 puntos por cada una de las cinco tazas de la muestra.'],
          ['Puntaje del catador', 'la valoración personal del catador.'],
          ['Defectos', '−2 por un sabor extraño (taint) y −4 por un defecto claro (fault) en cada taza afectada.'],
        ],
      },
      {
        title: 'CVA: la nueva evaluación',
        lead: 'Desde 2024 la SCA separa «cómo es este café» de «qué tan bueno es».',
        text: [
          'La Coffee Value Assessment sustituye al formulario de 2004. En el antiguo, un solo número describía a la vez intensidad, calidad y el gusto del catador: un cuerpo «8» podía significar «mucho» o «bueno».',
          'Ahora la evaluación tiene partes separadas que no se mezclan. Se mantiene la cifra de 100 puntos, pero la acompaña una descripción del sabor.',
        ],
        terms: [
          ['Física', 'inspección del café verde: defectos, humedad, tamaño.'],
          ['Descriptiva', 'intensidad de aroma, sabor, acidez, dulzor y cuerpo, y las notas marcadas, sin juicio de bueno o malo.'],
          ['Afectiva', 'la impresión de calidad en una escala de 1 a 9; de ella se calcula la puntuación final.'],
          ['Extrínseca', 'todo lo que no está en la taza: origen, certificaciones, historia de la finca, que también influyen en el valor.'],
        ],
      },
      {
        title: 'La Taza de Oro',
        lead: 'El estándar SCA para café filtrado: cuánto café usar y qué intensidad buscar.',
        facts: [
          ['Proporción', '55 g por 1 L de agua (±10%)'],
          ['Extracción', '18–22%'],
          ['Intensidad (TDS)', '1,15–1,35%'],
          ['Agua', '92–96 °C'],
        ],
        text: [
          'Se basa en la carta de control de preparación (Brewing Control Chart): intensidad en un eje y extracción en el otro. En el centro está la zona «ideal»; a la izquierda, subextracción (ácido); a la derecha, sobreextracción (amargo); arriba, demasiado fuerte; abajo, aguado.',
          '55 g/L es más o menos 1:18. Hoy muchos preparan algo más fuerte (1:15–1:17): el estándar es una referencia, no una regla.',
        ],
        tip: 'Sin refractómetro, guíate por el sabor: ácido, más fino; amargo, más grueso (ver «Bases de la preparación»).',
      },
      {
        title: 'El estándar del agua',
        lead: 'Qué agua hace brillar al café: limpia, sin olor, con una cantidad moderada de minerales.',
        facts: [
          ['Residuo seco (TDS)', '150 mg/L (75–250)'],
          ['Dureza cálcica', '68 mg/L de CaCO₃ (17–85)'],
          ['Alcalinidad', 'unos 40 mg/L'],
          ['pH', '7,0 (6,5–7,5)'],
          ['Sodio', 'unos 10 mg/L'],
          ['Cloro', '0'],
        ],
        text: [
          'El calcio y el magnesio ayudan a extraer el sabor; la alcalinidad (bicarbonatos) amortigua la acidez: poca y el café sale agresivo y ácido; mucha y sale plano y calcáreo. El manual de calidad del agua de la SCA (2018) da rangos más amplios: dureza total 50–175 mg/L, alcalinidad 40–75 mg/L.',
        ],
      },
      {
        title: 'Formación y certificados',
        lead: 'Los cursos de la SCA para baristas, tostadores y catadores, y en qué se diferencia un Q grader.',
        terms: [
          ['Coffee Skills Program', 'módulos: Introducción al café, Barista, Métodos de preparación, Análisis sensorial, Café verde, Tueste. Niveles: Foundation, Intermediate, Professional.'],
          ['Coffee Diploma', 'se obtiene con un conjunto de módulos y puntos.'],
          ['Q grader', 'certificado de otra organización, el Coffee Quality Institute (CQI). Los Q graders puntúan según el protocolo SCA y se recalibran cada tres años.'],
        ],
      },
      {
        title: 'Campeonatos y ferias',
        lead: 'Donde aparecen nuevas recetas, procesos y tendencias.',
        terms: [
          ['World Barista Championship', 'espresso, una bebida con leche y una bebida de autor en 15 minutos.'],
          ['World Brewers Cup', 'preparación manual: una ronda obligatoria y una libre.'],
          ['Cup Tasters', 'encontrar contra reloj la taza distinta en cada grupo de tres.'],
          ['Latte Art, Coffee Roasting, Coffee in Good Spirits, Cezve/Ibrik', 'otros campeonatos de World Coffee Events.'],
          ['World AeroPress Championship', 'independiente de la SCA, se celebra desde 2008.'],
          ['Ferias', 'Specialty Coffee Expo (EE. UU.) y World of Coffee (Europa).'],
        ],
      },
      {
        title: 'La rueda de sabores de la SCA',
        lead: 'Un vocabulario común de sabores, creado con World Coffee Research.',
        text: [
          'La rueda de 2016 se basa en el léxico sensorial de WCR: cada palabra tiene una referencia (una mermelada o una especia concreta, por ejemplo) para que catadores de distintos países entiendan lo mismo. En el centro están las categorías generales y en el borde las notas concretas. Más en «Cata».',
        ],
      },
    ],
  },
  {
    id: 'origins',
    title: 'Orígenes',
    summary: 'Qué esperar de Etiopía, Kenia, Colombia y otros países',
    articles: [
      {
        title: 'Altitud y terroir',
        lead: 'Cuanto más alto crece, más lento madura el café y más brillante y complejo sabe.',
        text: [
          'El cinturón del café está entre los trópicos de Cáncer y Capricornio. En altura hace más fresco, la cereza madura más despacio y el grano es más denso, con más azúcares y ácidos.',
          'También influyen el suelo (el volcánico suele ayudar), la lluvia, la sombra, la variedad y, sobre todo, el proceso. Así que el país es una pista, no una garantía.',
        ],
        facts: [
          ['Bajo 1200 m', 'suave, a frutos secos, chocolate'],
          ['1200–1800 m', 'equilibrado, dulce, frutal'],
          ['Sobre 1800 m', 'acidez brillante, flores, frutos rojos'],
        ],
      },
      {
        title: 'Etiopía',
        lead: 'La cuna de la arábica: flores, bergamota, cítricos y, en naturales, arándano.',
        text: [
          'Etiopía cultiva miles de variedades locales (landraces), así que las bolsas suelen decir «heirloom» o selecciones como 74110 y 74112. Los pequeños productores llevan la cereza a estaciones de lavado.',
          'Los lavados son florales y de cuerpo de té, con jazmín, limón y bergamota. Los naturales son jugosos, con fresa, arándano y frutas tropicales.',
        ],
        terms: [
          ['Yirgacheffe', 'jazmín, limón, bergamota, cuerpo de té'],
          ['Sidamo (Sidama)', 'frutos rojos, cítricos, dulzor'],
          ['Guji', 'melocotón, frutos rojos, flores, naturales intensos'],
          ['Harrar', 'natural, vinoso, especiado, arándano'],
          ['Limu, Jimma', 'más suaves y equilibrados, especias'],
        ],
      },
      {
        title: 'Kenia',
        lead: 'Grosella negra, pomelo, tomate y una acidez muy jugosa.',
        text: [
          'El café keniano casi siempre es lavado (a menudo con doble fermentación) y crece a 1500–2100 m. Las variedades clásicas son SL28 y SL34, de los años 30; las nuevas, resistentes, son Ruiru 11 y Batian.',
          'El grano se clasifica por tamaño: AA es el más grande, AB mediano, PB caracolillo. El tamaño no es el sabor, pero AA suele ser más caro.',
        ],
        tip: 'Nyeri y Kirinyaga son las regiones clásicas de la Kenia más vibrante.',
      },
      {
        title: 'Más de África',
        lead: 'Ruanda y Burundi: frutos rojos y té; Uganda y Tanzania: del chocolate a los cítricos.',
        terms: [
          ['Ruanda', 'grosella roja, té, flores. Bourbon a 1500–2000 m.'],
          ['Burundi', 'parecido a Ruanda: frutos rojos, dulzor, limpieza.'],
          ['Tanzania', 'brillante, cítrico; famosa por su caracolillo.'],
          ['Uganda', 'sobre todo robusta, pero la arábica del monte Elgon es achocolatada y frutal.'],
          ['Malaui, Zambia, Congo', 'menos comunes, a veces lotes muy interesantes.'],
        ],
        tip: 'El «defecto de papa» aparece a veces en Ruanda y Burundi: un solo grano huele a patata cruda. No es culpa de tu preparación.',
      },
      {
        title: 'Colombia',
        lead: 'Caramelo, frutos rojos, equilibrio y dos cosechas al año.',
        text: [
          'Las montañas y el ecuador dan a Colombia dos temporadas de cosecha, así que hay café fresco casi todo el año. Muchas fincas pequeñas y café lavado, aunque ahora también son populares las fermentaciones experimentales.',
          'Variedades: Castillo, Caturra y Colombia, además de las de moda Pink Bourbon, Sidra y Geisha.',
        ],
        terms: [
          ['Huila', 'frutal, brillante, dulce'],
          ['Nariño', 'gran altitud, cítricos, flores'],
          ['Cauca, Tolima', 'dulzor, frutos rojos'],
          ['Antioquia', 'el perfil clásico equilibrado'],
        ],
      },
      {
        title: 'Brasil',
        lead: 'El mayor productor: frutos secos, chocolate, caramelo, poca acidez.',
        text: [
          'Brasil produce cerca de un tercio del café mundial. Muchas fincas son grandes y mecanizadas, a poca altitud, así que el sabor es suave y dulce. Lo típico son los procesos natural y despulpado natural (pulped natural).',
          'Brasil es la base de muchos blends de espresso: aporta cuerpo, dulzor y chocolate. También hay lotes brillantes de zonas altas (Caparaó, Mantiqueira).',
        ],
        tip: 'Regiones: Cerrado Mineiro, Sul de Minas, Mogiana, Mantiqueira.',
      },
      {
        title: 'Más de Sudamérica',
        lead: 'Perú, Bolivia y Ecuador: altura, dulzor y cada vez más lotes raros.',
        terms: [
          ['Perú', 'suave, dulce, a menudo orgánico; el norte (Cajamarca) es más brillante.'],
          ['Bolivia', 'fincas altas, flores y frutos rojos; poco café y no barato.'],
          ['Ecuador', 'volumen pequeño; Typica y Sidra de 1500–2200 m, a menudo muy complejos.'],
        ],
      },
      {
        title: 'Centroamérica',
        lead: 'De la Guatemala achocolatada a la Geisha de Panamá.',
        terms: [
          ['Guatemala', 'chocolate, especias, manzana. Antigua, Huehuetenango, Acatenango.'],
          ['Costa Rica', 'cuna del proceso honey y de los micro-beneficios; región de Tarrazú. Dulce y limpio.'],
          ['Panamá', 'Geisha de primer nivel (Boquete), flores, bergamota, precios récord.'],
          ['El Salvador', 'Bourbon y Pacamara, dulzor y acidez suave.'],
          ['Honduras, Nicaragua', 'dulces, acaramelados, a veces lotes muy brillantes.'],
          ['México', 'suave, a frutos secos; Chiapas y Oaxaca.'],
        ],
      },
      {
        title: 'Asia y Yemen',
        lead: 'La terrosa Sumatra, el especiado Yemen, y una China e India cada vez más interesantes.',
        terms: [
          ['Yemen', 'el cultivo de café más antiguo: frutos secos, especias, vino. El puerto de Moca dio nombre al «moca».'],
          ['Indonesia', 'Sumatra se descascara en húmedo (giling basah): terroso, herbal, mucho cuerpo, poca acidez.'],
          ['India', 'el «Monsooned Malabar» se expone a los vientos del monzón: suave, especiado, sin acidez.'],
          ['China', 'Yunnan: de lotes a frutos secos a experimentales brillantes.'],
          ['Papúa Nueva Guinea', 'frutas tropicales, hierbas, pequeños productores.'],
        ],
      },
    ],
  },
  {
    id: 'varieties',
    title: 'Variedades',
    summary: 'Geisha, Bourbon, SL28 y otras: cómo influye la variedad en la taza',
    articles: [
      {
        title: 'Qué es una variedad',
        lead: 'Como las uvas del vino: define rendimiento, resistencia y sabor.',
        text: [
          'La arábica tiene muchas variedades (varietales, cultivares). Unas son mutaciones naturales, otras fruto de la selección. El productor elige entre sabor y rendimiento: las más sabrosas suelen enfermar y dar poco fruto.',
          'La gran amenaza es la roya. Los híbridos con algo de robusta (Catimor, Sarchimor, Castillo) la resisten, pero suelen saber más simples.',
        ],
      },
      {
        title: 'Typica y Bourbon',
        lead: 'Los dos «ancestros» de casi toda la arábica cultivada.',
        terms: [
          ['Typica', 'una de las primeras variedades sacadas de Yemen. Limpia, dulce, poco productiva.'],
          ['Bourbon', 'de la isla Bourbon (Reunión). Dulce, acaramelada, compleja. Roja, amarilla y rosada (Pink Bourbon).'],
          ['Caturra', 'mutación enana de Bourbon, de Brasil: acidez brillante, árboles compactos.'],
          ['Catuaí', 'Mundo Novo × Caturra: productiva, suave; común en Brasil y Centroamérica.'],
          ['Mundo Novo', 'Typica × Bourbon, árboles altos, la base del café brasileño.'],
        ],
      },
      {
        title: 'Geisha (Gesha)',
        lead: 'Jazmín, bergamota, melocotón, cuerpo de té y los precios más altos.',
        text: [
          'Se encontró en el bosque de Gori Gesha, en Etiopía, pero se hizo famosa en Panamá: en 2004 la Geisha de Hacienda La Esmeralda ganó Best of Panama y cambió el mercado.',
          'Hoy se cultiva en Colombia, Etiopía, Costa Rica y más. Brilla en tuestes claros y filtrados.',
        ],
        tip: 'Prepara la Geisha un poco más fría (90–93 °C) y no muy fina: las notas florales son delicadas.',
      },
      {
        title: 'SL28 y SL34 de Kenia',
        lead: 'Grosella negra, acidez jugosa, complejidad.',
        text: [
          'Creadas por Scott Agricultural Laboratories en Kenia en los años 30. SL28 tolera la sequía y da la famosa acidez keniana; SL34 lleva mejor la lluvia y es algo más suave.',
          'También se cultivan en Uganda, Ruanda y Latinoamérica, donde a menudo conservan su carácter a frutos rojos.',
        ],
      },
      {
        title: 'Variedades locales etíopes',
        lead: '«Heirloom» son miles de formas silvestres y locales, no una sola variedad.',
        text: [
          'Los bosques etíopes son el hogar genético de la arábica. Los productores cultivan una mezcla de formas locales, y el centro de investigación JARC seleccionó las mejores: 74110, 74112, 74158 y otras. Las bolsas suelen decir simplemente landrace o heirloom.',
        ],
      },
      {
        title: 'Pacamara, Sidra y otras de moda',
        lead: 'Granos grandes, aromas inusuales, a menudo lotes de concurso.',
        terms: [
          ['Pacamara', 'Pacas × Maragogipe, de El Salvador. Grano muy grande; hierbas, fruta tropical, chocolate.'],
          ['Maragogipe', 'el «grano elefante», sabor suave, más curiosidad que referencia.'],
          ['Sidra', 'de Ecuador, probablemente de origen etíope; flores, fruta, dulzor.'],
          ['Pink Bourbon', 'estrella colombiana: flores, frutos rojos, acidez brillante.'],
          ['Wush Wush', 'forma etíope; en Colombia da frutos rojos y especias.'],
          ['Castillo', 'híbrido colombiano resistente a la roya, muy rico con buen proceso.'],
        ],
      },
    ],
  },
  {
    id: 'processing',
    title: 'Proceso',
    summary: 'Lavado, natural, honey, anaeróbico, choque térmico, barricas: cómo cambia el sabor',
    articles: [
      {
        title: 'Por qué importa el proceso',
        lead: 'La cereza tiene que convertirse en grano seco, y cómo se hace importa tanto como el país.',
        text: [
          'La cereza fresca es jugosa y se estropea rápido. El proceso retira piel, pulpa y mucílago (o lo seca todo junto) y baja la humedad del grano al 10–12%.',
          'Mientras el mucílago y la pulpa tocan el grano, hay fermentación: levaduras y bacterias convierten azúcares en ácidos y aromas. Cuanto más largo e intenso el contacto, más frutal y atrevida la taza.',
        ],
        facts: [
          ['Limpieza', 'lavado > honey > natural'],
          ['Fruta y cuerpo', 'natural > honey > lavado'],
        ],
      },
      {
        title: 'Lavado',
        lead: 'Taza limpia y transparente, acidez brillante: la voz del lugar.',
        steps: [
          'Las cerezas se sumergen en agua; las que flotan (verdes o vacías) se retiran.',
          'La despulpadora quita piel y pulpa.',
          'El grano con mucílago fermenta en tanques 12–72 horas hasta que se suelta.',
          'Se lava con agua limpia (en Kenia a menudo dos veces, con remojo).',
          'Se seca en pergamino 1–3 semanas.',
        ],
        tip: 'Para conocer cómo sabe una región o una variedad, elige un lavado.',
      },
      {
        title: 'Natural (seco)',
        lead: 'Se seca la cereza entera: frutos rojos, vino, trópico, mucho cuerpo.',
        text: [
          'El método más antiguo: las cerezas enteras se extienden en patios o camas elevadas y se secan 2–4 semanas, removiéndolas a menudo. Los azúcares de la pulpa y la larga fermentación dan fruta intensa, dulzor y a veces notas vinosas o licorosas.',
          'El riesgo es una taza sobrefermentada y «sucia» si el secado es descuidado. Un buen natural es jugoso y limpio; uno malo sabe a vinagre y fruta podrida.',
        ],
      },
      {
        title: 'Honey y despulpado natural',
        lead: 'Se quita la piel y el mucílago se seca sobre el grano: dulce y redondo.',
        text: [
          'Un punto medio entre lavado y natural. El nombre viene del mucílago pegajoso como la miel, no de la miel. Popular en Costa Rica y El Salvador; en Brasil un método parecido se llama pulped natural.',
        ],
        terms: [
          ['Honey blanco / amarillo', 'menos mucílago, secado rápido: más cerca del lavado.'],
          ['Honey rojo', 'más mucílago, secado más largo: más fruta.'],
          ['Honey negro', 'el máximo mucílago, secado lento a la sombra: más cerca del natural.'],
        ],
      },
      {
        title: 'Anaeróbico y maceración carbónica',
        lead: 'Fermentación sin oxígeno: intensa, vibrante, a veces como ron.',
        text: [
          'Las cerezas o los granos se cierran en tanques herméticos, a veces con válvula o llenos de dióxido de carbono. Sin oxígeno trabajan otros microorganismos y el sabor se vuelve explosivo: fruta tropical, canela, chicle, ron, yogur.',
          'La maceración carbónica viene del vino; Sasa Sestic la hizo famosa en el café al ganar el Campeonato Mundial de Baristas de 2015.',
          'Otros experimentos (fermentación láctica, choque térmico, levaduras, añejado en barrica) se describen más abajo.',
        ],
        tip: 'Si un anaeróbico te resulta «demasiado», muele un poco más grueso y usa agua más fría: las notas de fermentación se suavizan.',
      },
      {
        title: 'Fermentación láctica',
        lead: 'Fermentación dominada por bacterias lácticas: cremosa y suave, con yogur y mantequilla.',
        text: [
          'El café fermenta sin oxígeno de forma que dominen las bacterias lácticas; a veces se añaden a propósito. En lugar de ácido málico y cítrico, la taza tiene más ácido láctico, suave y redondo.',
          'Sabor: yogur, nata, mantequilla, fruta madura, a veces queso. Cuerpo denso, acidez suave.',
        ],
      },
      {
        title: 'Choque térmico',
        lead: 'Tras una fermentación larga el café se lava con agua caliente y luego fría: aromas intensos como caramelos.',
        text: [
          'Lo popularizó el caficultor colombiano Diego Bermúdez (Finca El Paraíso, Cauca). Las cerezas o el grano fermentan mucho tiempo sin oxígeno y luego se cambia la temperatura de golpe: agua caliente y después fría. La idea es «abrir» el grano y fijar los aromas de la fermentación.',
          'El sabor es muy intenso: fruta tropical, frutos rojos, flores, caramelos. A menudo se confunden con cafés aromatizados, pero no llevan añadidos.',
        ],
      },
      {
        title: 'Levaduras, mosto y koji',
        lead: 'La fermentación se dirige añadiendo microorganismos elegidos, como en el vino, el pan y el sake.',
        terms: [
          ['Levaduras seleccionadas', 'cepas del vino y la cerveza. Fermentación más predecible; taza más limpia y frutal.'],
          ['Mosto', 'el jugo fermentado de un lote anterior se añade al siguiente, como masa madre. Popular en Colombia; aporta dulzor y fruta.'],
          ['Koji', 'el hongo Aspergillus oryzae del sake y el miso. Experimento raro: dulzor, acidez suave, profundidad inusual.'],
          ['Levaduras de vino', 'dan notas vinosas, de frutos rojos, a veces licorosas.'],
        ],
      },
      {
        title: 'Fermentación doble y prolongada',
        lead: 'Más tiempo en contacto con la pulpa y el mucílago: más fruta y complejidad.',
        terms: [
          ['Doble (Kenia)', 'el café se fermenta, se lava y se vuelve a remojar: la limpieza y el brillo clásicos de Kenia.'],
          ['Doble (moderna)', 'por ejemplo, anaeróbica en cereza y luego otra vez en pergamino en tanque.'],
          ['Prolongada', 'las cerezas fermentan 2–8 días antes de secarse: más frutos rojos, vino, dulzor.'],
          ['Secado lento', 'secar a la sombra o en cuartos oscuros ralentiza el proceso y da una taza más pareja y dulce.'],
        ],
      },
      {
        title: 'Añejado en barrica (barrel aged)',
        lead: 'El café verde reposa en barricas de whisky, ron o vino y absorbe su aroma.',
        text: [
          'El café verde se mete en barricas usadas (de bourbon, whisky, ron, jerez o vino) durante semanas o meses y se gira con regularidad. El grano seco absorbe los aromas de la madera y de la bebida. También existe el barrel fermented, en el que las cerezas fermentan dentro de la barrica.',
          'Sabor: vainilla, roble, caramelo, frutos secos, notas cálidas «licorosas». No hay alcohol en la taza: apenas pasa al grano y no sobrevive al tueste.',
          'Un buen tostador indica la barrica y el tiempo. La base tiene que ser un buen café: la barrica suma, pero no arregla.',
        ],
        tip: 'Prepáralo un poco más frío (88–92 °C): la madera se suaviza y el dulzor gana protagonismo.',
      },
      {
        title: 'Café añejo y monzonado',
        lead: 'El grano se envejece a propósito: el sabor se vuelve suave y especiado, sin acidez.',
        terms: [
          ['Monsooned Malabar (India)', 'el grano pasa semanas en almacenes abiertos expuesto a los vientos húmedos del monzón; se hincha y palidece.'],
          ['Sumatra añejo', 'el grano se guarda durante años: notas terrosas, especiadas, leñosas.'],
          ['Por qué no es un defecto', 'el café viejo corriente sabe plano y a cartón; aquí el envejecimiento es controlado y crea un estilo propio.'],
        ],
      },
      {
        title: 'Infusionados y co-fermentados',
        lead: 'Se añaden frutas, especias o aromas al tanque: una práctica polémica.',
        text: [
          'En la co-fermentación se añade al café, por ejemplo, maracuyá, canela o levadura de vino. La taza resulta muy llamativa, pero el sabor ya no viene solo del café. Parte de la comunidad lo considera aromatización y espera que el tostador indique los añadidos en la bolsa.',
        ],
      },
      {
        title: 'Cómo entender un lote experimental',
        lead: 'Qué buscar en la bolsa y cómo prepararlo.',
        terms: [
          ['Anaerobic, CM, lactic', 'fermentación sin oxígeno, maceración carbónica, láctica: intensos, pero sin añadidos.'],
          ['Thermal shock', 'choque térmico: muy aromático, sin añadidos.'],
          ['Yeast inoculated, mosto', 'con levadura o mosto añadidos: tampoco aportan sabores ajenos.'],
          ['Co-fermented, infused with…', 'con frutas, especias o aromas añadidos: el sabor ya no es solo del café.'],
          ['Barrel aged', 'reposado en barrica: notas de madera y de lo que contenía la barrica.'],
        ],
        tip: 'Empieza con una molienda algo más gruesa, agua a 88–92 °C y proporción 1:16–1:17. Si sabe a chicle con un aroma imposible en el café (por ejemplo, exactamente a yogur de fresa), probablemente sea infusionado.',
      },
      {
        title: 'Descascarado en húmedo (giling basah)',
        lead: 'El método indonesio: terroso, herbal, mucho cuerpo, poca acidez.',
        text: [
          'En el clima húmedo de Sumatra y Célebes se quita el pergamino cuando el grano aún está húmedo (30–50%) y luego se seca el grano desnudo. De ahí su color verde oscuro y su sabor terroso, especiado y leñoso.',
        ],
      },
      {
        title: 'Descafeinado',
        lead: 'La cafeína se retira del grano verde, y un buen descafeinado puede ser muy rico.',
        terms: [
          ['Swiss Water', 'solo agua y filtros de carbón, sin químicos.'],
          ['Caña de azúcar (EA)', 'acetato de etilo de la caña; popular en Colombia, conserva el dulzor.'],
          ['CO₂', 'dióxido de carbono supercrítico; delicado, para grandes volúmenes.'],
          ['Cloruro de metileno', 'barato y eficaz, cada vez menos usado en especialidad.'],
        ],
        tip: 'Normalmente se elimina el 97–99,9% de la cafeína. El descafeinado pierde frescura antes: compra bolsas pequeñas.',
      },
    ],
  },
  {
    id: 'roasting',
    title: 'Tueste',
    summary: 'Niveles de tueste, qué pasa en la tostadora, filtro y espresso',
    articles: [
      {
        title: 'Qué pasa al tostar',
        lead: 'En 8–15 minutos el grano verde se vuelve marrón y aromático.',
        steps: [
          'Secado: el grano pierde agua y amarillea (hasta ~150 °C); huele a heno y pan.',
          'Reacciones de Maillard y caramelización: el grano se dora y nacen cientos de aromas.',
          'Primer crack (~196–205 °C): el vapor y el gas abren el grano con un chasquido, como palomitas.',
          'Desarrollo: el tiempo tras el primer crack; define el dulzor y el nivel de tueste.',
          'Segundo crack (~224 °C): los aceites salen a la superficie; ya es un tueste oscuro.',
        ],
        facts: [
          ['Pérdida de peso', 'claro 12–14%, oscuro 18–20%'],
          ['Tiempo de desarrollo', 'normalmente 15–25% del total'],
        ],
      },
      {
        title: 'Tueste claro',
        lead: 'Acidez, flores, fruta, el sabor del origen.',
        text: [
          'El tueste termina poco después del primer crack. El grano es marrón claro, seco y denso, y el origen se nota con más claridad. El estilo nórdico es muy claro.',
          'El grano claro es más denso y cuesta más extraerlo: muele un poco más fino y usa agua más caliente (94–100 °C).',
        ],
        tip: 'Si un tueste claro sabe a hierba o a cacahuete crudo, está subdesarrollado, no es «así a propósito».',
      },
      {
        title: 'Tueste medio',
        lead: 'Equilibrio: caramelo, chocolate, frutos secos y acidez moderada.',
        text: [
          'El origen aún se percibe, con más dulzor y cuerpo. Funciona para filtro y espresso. La mayoría de los tuestes omni son medio-claros o medios.',
        ],
      },
      {
        title: 'Tueste oscuro',
        lead: 'Amargor, humo, chocolate negro, notas tostadas; el origen se desvanece.',
        text: [
          'El tueste llega al segundo crack o más allá y aparece aceite en la superficie. Los sabores del tueste tapan los del grano y la acidez casi desaparece.',
          'El grano oscuro se extrae con facilidad: muele más grueso y usa agua más fría (85–90 °C) para evitar el amargor.',
        ],
      },
      {
        title: 'Filtro, espresso, omni',
        lead: 'El tostador adapta el perfil al método de preparación.',
        terms: [
          ['Filtro', 'más claro, buscando acidez y claridad: para V60, AeroPress, prensa francesa.'],
          ['Espresso', 'algo más oscuro y con más desarrollo, para que un shot concentrado sea dulce y no ácido.'],
          ['Omni', 'un compromiso que funciona en ambos, ideal en ninguno.'],
        ],
        tip: 'Puedes preparar un tueste de espresso en filtro: agua más fría y molienda más gruesa.',
      },
      {
        title: 'Agtron y color del grano',
        lead: 'Un número que mide el color del tueste: más alto, más claro.',
        facts: [
          ['Muy claro', 'Agtron 75+'],
          ['Claro', '65–75'],
          ['Medio', '50–65'],
          ['Oscuro', 'menos de 45'],
        ],
        text: ['Los valores cambian entre aparatos y entre grano entero y molido, así que compáralos solo dentro de un mismo tostador.'],
      },
    ],
  },
  {
    id: 'freshness',
    title: 'Frescura y conservación',
    summary: 'Cuánto reposar el café, cómo guardarlo y si conviene congelarlo',
    articles: [
      {
        title: 'Reposo tras el tueste',
        lead: 'El café recién tostado desprende gas: déjalo reposar.',
        text: [
          'Tras el tueste el grano libera CO₂. Un café demasiado fresco burbujea mucho, se extrae de forma desigual y puede saber áspero. A los pocos días el sabor se abre.',
          'Los tuestes claros necesitan más reposo que los oscuros. La válvula de la bolsa deja salir el gas sin dejar entrar aire.',
        ],
        facts: [
          ['Filtro', 'mejor entre 7 y 30 días tras el tueste'],
          ['Espresso', 'mejor entre 10 y 40 días'],
          ['Tueste claro', 'a menudo se abre en la 2.ª–3.ª semana'],
        ],
      },
      {
        title: 'Cómo guardarlo',
        lead: 'Hermético, opaco, fresco y en grano entero.',
        steps: [
          'Guarda el grano en su bolsa con válvula (sin aire y bien cerrada) o en un bote hermético.',
          'Lejos de la luz, el calor y la cocina.',
          'No en la nevera: hay humedad y olores.',
          'Muele justo antes de preparar: el café molido pierde aroma en minutos.',
        ],
      },
      {
        title: 'Congelar',
        lead: 'El congelador es la mejor forma de conservar café durante meses.',
        steps: [
          'Divide el café en porciones para una o dos preparaciones.',
          'Envásalas herméticamente (al vacío, bolsas gruesas, tarros pequeños): sin aire ni humedad.',
          'Muele directamente del congelador sin descongelar; la molienda incluso sale más uniforme.',
          'No congeles dos veces la misma porción.',
        ],
      },
      {
        title: 'Fecha de tueste y consumo preferente',
        lead: 'Fíjate en la fecha de tueste, no en la de caducidad.',
        text: [
          'El café de hace un año es seguro, pero el sabor se va mucho antes. La mayoría de tuestes están en su mejor momento los primeros 1–2 meses; una bolsa abierta, en 2–4 semanas.',
          'Señales de café pasado: sabor plano, a cartón, poco aroma y casi nada de bloom al prepararlo.',
        ],
      },
    ],
  },
  {
    id: 'brewing',
    title: 'Bases de la preparación',
    summary: 'Proporción, molienda, temperatura, agua y cómo corregir la taza',
    articles: [
      {
        title: 'Extracción',
        lead: 'Preparar café es disolver compuestos del grano; la clave es disolver la cantidad justa.',
        text: [
          'Primero se disuelven los ácidos, luego los azúcares y al final los compuestos amargos y astringentes. La subextracción sabe ácida, salada y vacía; la sobreextracción, amarga, seca y astringente.',
          'La intensidad es cuánto café hay en la taza (concentración); la extracción es cuánto salió del grano. Son cosas distintas: una taza puede ser fuerte y estar subextraída.',
        ],
        facts: [
          ['Extracción', '18–22% del peso del grano'],
          ['Intensidad en filtro', 'TDS 1,15–1,45%'],
          ['Intensidad en espresso', 'TDS 8–12%'],
        ],
      },
      {
        title: 'Proporción',
        lead: 'Para filtro, empieza con 1:16: 15 g de café para 240 g de agua.',
        facts: [
          ['Filtrado (pour-over)', '1:15–1:17'],
          ['AeroPress', '1:12–1:17'],
          ['Prensa francesa', '1:15–1:17'],
          ['Espresso', '1:2 (18 g → 36 g)'],
          ['Cold brew', '1:8–1:12'],
        ],
        tip: 'Pesa café y agua con una báscula. Las cucharas y el «a ojo» son la principal causa de tazas irregulares.',
      },
      {
        title: 'Molienda',
        lead: 'El mando principal del sabor: más fino, más extracción y flujo más lento.',
        terms: [
          ['Polvo', 'café turco (cezve)'],
          ['Muy fina', 'espresso'],
          ['Fina', 'moka, AeroPress'],
          ['Media-fina', 'V60, Kalita'],
          ['Media-gruesa', 'Chemex, Clever'],
          ['Gruesa', 'prensa francesa, cold brew'],
        ],
        tip: 'Cambia una sola cosa cada vez; normalmente basta con la molienda.',
      },
      {
        title: 'Temperatura del agua',
        lead: '92–96 °C funciona casi siempre; más caliente para tuestes claros, más fría para oscuros.',
        facts: [
          ['Tueste claro', '94–100 °C'],
          ['Medio', '90–94 °C'],
          ['Oscuro', '85–90 °C'],
        ],
        text: ['Sin termómetro: hierve el agua y espera 30–60 segundos.'],
      },
      {
        title: 'Agua',
        lead: 'El café es 98% agua; sus minerales cambian el sabor.',
        text: [
          'El agua demasiado blanda o destilada da un café plano y ácido. La demasiado dura apaga la acidez, sabe a tiza y deja cal.',
          'Va bien el agua filtrada o embotellada de mineralización débil. También puedes mezclar agua destilada con sobres de minerales (Third Wave Water, Lotus).',
        ],
        facts: [
          ['Residuo seco', '75–250 mg/L, ideal ~150'],
          ['Dureza total', '~50–175 mg/L de CaCO₃'],
          ['Alcalinidad', '~40 mg/L'],
          ['pH', 'alrededor de 7'],
        ],
      },
      {
        title: 'Cómo corregir la taza',
        lead: 'Ácido: más fino; amargo: más grueso. Lo demás es ajuste fino.',
        terms: [
          ['Ácido, salado, vacío', 'muele más fino, agua más caliente, más tiempo de contacto.'],
          ['Amargo, seco, astringente', 'muele más grueso, agua más fría, menos agitación.'],
          ['Aguado', 'más café (por ejemplo 1:15 en vez de 1:17).'],
          ['Demasiado fuerte, pesado', 'más agua.'],
          ['Ácido y amargo a la vez', 'extracción desigual: revisa el molino, nivela la cama, vierte más parejo.'],
          ['Drenaje muy lento', 'demasiados finos o molienda demasiado fina.'],
        ],
      },
      {
        title: 'Qué comprar primero',
        lead: 'Lo más importante es un buen molino de muelas; después, una báscula.',
        terms: [
          ['Molino', 'de muelas (cónicas o planas), no de cuchillas: la molienda debe ser uniforme.'],
          ['Báscula', 'con precisión de 0,1 g y temporizador.'],
          ['Hervidor', 'de cuello de cisne para filtrados; útil si regula la temperatura.'],
          ['Filtros', 'el papel da una taza limpia; el metal, más cuerpo y aceites.'],
        ],
        tip: 'Enjuaga siempre el filtro de papel con agua caliente: quita el sabor a papel y precalienta el gotero.',
      },
    ],
  },
  {
    id: 'equipment',
    title: 'Equipo',
    summary: 'V60, AeroPress, Chemex, moka, espresso, molinos: cómo funcionan, con esquemas',
    articles: [
      {
        title: 'Hario V60',
        lead: 'Un cono de 60° con un solo agujero grande: el flujo lo controlas tú.',
        figure: 'v60',
        parts: [
          ['Estrías en espiral', 'dejan salir el aire y separan el filtro de las paredes, así el agua fluye libremente.'],
          ['Agujero grande', 'apenas frena el agua: el tiempo de drenaje depende de la molienda y de cómo viertes.'],
          ['Filtro de papel', 'cónico; retiene aceites y finos para una taza limpia.'],
          ['Jarra o taza', 'donde cae el café preparado.'],
        ],
        text: [
          'La japonesa Hario lanzó el V60 en 2004. Pronto se convirtió en el estándar del filtrado: tazas brillantes y transparentes, pero exige un vertido cuidadoso.',
          'El material importa poco: el plástico retiene bien el calor y no se rompe; la cerámica y el vidrio hay que precalentarlos; el metal se calienta y se enfría rápido. El tamaño 01 es para 1–2 tazas; el 02, para 1–4.',
        ],
        tip: 'Las recetas están en «Métodos de preparación».',
      },
      {
        title: 'Kalita Wave y goteros de fondo plano',
        lead: 'Cama plana y tres agujeros pequeños: más uniforme y más fácil que un cono.',
        figure: 'kalita',
        parts: [
          ['Fondo plano', 'el café queda en una capa pareja del mismo grosor: extracción más uniforme.'],
          ['Tres agujeros pequeños', 'frenan un poco el agua, así que perdonan un vertido irregular.'],
          ['Filtro ondulado', 'solo toca las paredes con sus crestas: pierde menos calor y el agua no se escapa por los bordes.'],
          ['Jarra o taza', 'donde cae el café preparado.'],
        ],
        text: [
          'El Kalita Wave es un gotero japonés con filtros «de onda»: tamaño 155 para 1–2 tazas y 185 para 2–4. La taza suele ser más dulce y con más cuerpo que en un V60, algo menos brillante.',
          'Goteros planos parecidos: Orea, April, Origami con filtro ondulado.',
        ],
      },
      {
        title: 'Chemex',
        lead: 'Un reloj de arena de vidrio y un filtro grueso: taza muy limpia y ligera.',
        figure: 'chemex',
        parts: [
          ['Filtro grueso', 'un 20–30% más pesado de lo normal; retiene casi todos los aceites y finos. El lado triple, hacia el pico.'],
          ['Collar de madera', 'atado con un cordón de cuero, para sujetar la jarra caliente.'],
          ['Pico y canal de aire', 'el aire sale por el canal; si el filtro lo tapa, el flujo se detiene.'],
          ['Jarra de vidrio', 'gotero y jarra a la vez.'],
        ],
        text: [
          'El químico Peter Schlumbohm inventó la Chemex en 1941; forma parte de la colección del MoMA de Nueva York. Hay tamaños de 3, 6, 8 y 10 tazas, práctica para varias personas.',
          'Por el filtro grueso el cuerpo es ligero y el sabor transparente, con el aroma algo más apagado que en un V60.',
        ],
      },
      {
        title: 'AeroPress',
        lead: 'Infusión más una presión suave: versátil, indulgente y casi irrompible.',
        figure: 'aeropress',
        parts: [
          ['Émbolo', 'empuja el café a través del filtro; si lo colocas enseguida, el vacío evita el goteo.'],
          ['Junta de goma', 'ajusta herméticamente con la cámara para que la presión funcione.'],
          ['Cámara con números', 'donde reposa el café; los números son orientativos, mejor pesar.'],
          ['Filtro', 'el de papel da una taza limpia; el metálico, más cuerpo y aceites.'],
          ['Tapa', 'se enrosca abajo y sujeta el filtro; la versión Flow Control evita el goteo.'],
        ],
        text: [
          'El ingeniero Alan Adler inventó la AeroPress en 2005. Hay miles de recetas, desde «casi espresso» hasta un filtrado ligero, y desde 2008 se celebra el World AeroPress Championship.',
          'Existen las versiones Go (compacta, de viaje), XL (para dos tazas) y Clear (transparente).',
        ],
      },
      {
        title: 'Prensa francesa',
        lead: 'Infusión clásica y malla metálica: taza con mucho cuerpo y aceites.',
        figure: 'frenchPress',
        parts: [
          ['Filtro de malla', 'el metal deja pasar aceites y algunos finos: de ahí el cuerpo denso.'],
          ['Varilla y tapa', 'sujetan el filtro; bájalo solo hasta la superficie, sin remover los posos.'],
          ['Jarra', 'de vidrio o de acero de doble pared, que conserva mejor el calor.'],
          ['Sedimento', 'baja al fondo si esperas 5–8 minutos después de remover.'],
        ],
        text: [
          'El italiano Attilio Calimani patentó la prensa francesa tal como la conocemos en 1929. Es el método más simple: añadir, verter, esperar.',
          'La prensa también sirve para cold brew y para espumar leche con el émbolo.',
        ],
      },
      {
        title: 'Clever Dripper',
        lead: 'Un cono con válvula: infusión como en la prensa, filtrado como en un V60.',
        figure: 'clever',
        parts: [
          ['Válvula', 'cerrada mientras el gotero está sobre la mesa: el café reposa sin gotear.'],
          ['Filtro de papel', 'cónico estándar, para una taza limpia.'],
          ['Borde de la taza', 'levanta la válvula al colocar el gotero encima y el café cae.'],
          ['Café en infusión', 'en contacto con el agua todo el tiempo: taza estable y dulce.'],
        ],
        text: [
          'Un método muy indulgente: el resultado casi no depende de la técnica de vertido. Ideal para comparar dos cafés en las mismas condiciones.',
        ],
      },
      {
        title: 'Cafetera moka (italiana)',
        lead: 'El vapor empuja el agua hacia arriba a través del café: fuerte y denso, pero no es espresso.',
        figure: 'moka',
        parts: [
          ['Depósito inferior', 'el agua se calienta y la presión del vapor la empuja hacia arriba.'],
          ['Válvula de seguridad', 'libera presión si el paso se obstruye. No llenes por encima de ella.'],
          ['Filtro embudo', 'con el café; llénalo con colmo y nivélalo sin apretar.'],
          ['Columna', 'por ella sube el café preparado.'],
          ['Depósito superior', 'recoge el café.'],
        ],
        text: [
          'Alfonso Bialetti lanzó la Moka Express en 1933. Trabaja a unos 1–1,5 bar, varias veces menos que los 9 bar de una máquina de espresso, por eso no hay crema de verdad.',
          'Las mokas de aluminio no funcionan en placas de inducción: hacen falta de acero.',
        ],
      },
      {
        title: 'Máquina de espresso',
        lead: 'Una bomba empuja agua caliente a ~9 bar a través de una pastilla compacta de café.',
        figure: 'espresso',
        parts: [
          ['Grupo', 'suministra agua caliente a presión.'],
          ['Ducha', 'reparte el agua de forma uniforme sobre la pastilla.'],
          ['Cesta y pastilla', 'café molido apisonado con el tamper; la cesta tiene cientos de agujeros diminutos.'],
          ['Portafiltro', 'el mango con la cesta que se encaja en el grupo.'],
          ['Caños', 'dividen el flujo en una o dos tazas; un portafiltro sin fondo deja ver la canalización.'],
        ],
        terms: [
          ['Una caldera', 'café y vapor por turnos: barato, pero toca esperar.'],
          ['Intercambiador de calor', 'vapor y café a la vez; temperatura menos estable.'],
          ['Doble caldera', 'calderas separadas para café y vapor, temperatura precisa.'],
          ['De palanca', 'la presión la crea un muelle o el brazo del barista y cambia a lo largo del shot.'],
        ],
        tip: 'Para espresso el molino importa más que la máquina: necesita una molienda muy uniforme y de ajuste fino.',
      },
      {
        title: 'Molinos: muelas',
        lead: 'Las muelas trituran el grano a un mismo tamaño; las cuchillas lo cortan de forma irregular.',
        figure: 'burrs',
        parts: [
          ['Muelas cónicas', 'un cono gira dentro de un anillo que se estrecha. Más silenciosas, a menudo más cuerpo; casi todos los molinos manuales las usan.'],
          ['Muelas planas', 'dos discos dentados enfrentados. Suelen dar una molienda más uniforme y una taza más clara.'],
          ['Separación entre muelas', 'el ajuste de molienda: cuanto más estrecha, más fina.'],
        ],
        text: [
          'Un «molinillo» de cuchillas corta el grano en polvo y trozos a la vez: el polvo se sobreextrae (amargor) y los trozos se subextraen (acidez). Por eso incluso un molino manual de muelas económico (Comandante, 1Zpresso, Timemore) mejora mucho la taza.',
          'También importan el tamaño de las muelas (más grandes, más rápido y normalmente más uniforme), la retención de café dentro y la precisión del ajuste, sobre todo para espresso.',
        ],
      },
      {
        title: 'Cezve (ibrik)',
        lead: 'Base ancha, cuello estrecho y mango largo: todo para la espuma.',
        figure: 'cezve',
        parts: [
          ['Base ancha', 'se calienta rápido y de forma uniforme.'],
          ['Cuello estrecho', 'recoge la espuma y evita que se rompa.'],
          ['Mango largo', 'mantiene la mano lejos del fuego.'],
          ['Fuego suave', 'el calentamiento lento da una espuma densa; en arena caliente, aún más suave.'],
        ],
        text: [
          'Los cezves clásicos son de cobre o latón, estañados por dentro. Elige el tamaño según las tazas: café y agua deben llenarlo hasta donde empieza el cuello.',
        ],
      },
      {
        title: 'Hervidor y báscula',
        lead: 'Un chorro fino y un peso exacto: las dos herramientas que hacen repetible un filtrado.',
        figure: 'kettleScale',
        parts: [
          ['Cuello de cisne', 'un chorro fino y controlable: vierte despacio y con precisión en espiral.'],
          ['Control de temperatura', 'mantiene 90–96 °C sin termómetro.'],
          ['Báscula con temporizador', 'precisión de 0,1 g: pesa el café y sigue el agua y el tiempo a la vez.'],
        ],
        tip: 'Pon el gotero y la jarra juntos sobre la báscula y tara: así ves exactamente cuánta agua has vertido.',
      },
    ],
  },
  {
    id: 'methods',
    title: 'Métodos de preparación',
    summary: 'Recetas paso a paso: V60, AeroPress, prensa francesa, Chemex y más',
    articles: [
      {
        title: 'V60: la receta clásica',
        lead: 'Una taza limpia y brillante en 3 minutos; la receta de una taza de James Hoffmann.',
        facts: [
          ['Café', '15 g'],
          ['Agua', '250 g, 93–96 °C'],
          ['Molienda', 'media-fina, como sal fina'],
          ['Tiempo', '~3:00–3:30'],
        ],
        steps: [
          'Enjuaga el filtro con agua caliente y tírala.',
          'Añade el café y haz un pequeño hueco en el centro.',
          '0:00: vierte 30–50 g de agua (bloom) y gira el gotero para mojarlo todo.',
          '0:45: vierte en espiral hasta 100 g en 15–20 segundos.',
          '1:15: sigue hasta llegar a 250 g a los 1:45.',
          'Remueve suavemente por el borde y gira el gotero para que la cama quede plana.',
          'Deja que drene; la cama de café debe quedar plana.',
        ],
        timer: [null, null, 45, 30, 30, 15, null],
        tip: 'Si drena antes de 2:45 y sabe ácido, muele más fino. Si pasa de 4:00 y amarga, más grueso.',
      },
      {
        title: 'V60: método 4:6 de Tetsu Kasuya',
        lead: 'La receta del campeón mundial de 2016: el primer 40% del agua define el sabor, el 60% restante la intensidad.',
        facts: [
          ['Café', '20 g'],
          ['Agua', '300 g, ~92 °C'],
          ['Molienda', 'media-gruesa'],
          ['Tiempo', '~3:30'],
        ],
        steps: [
          '0:00: 50 g de agua.',
          '0:45: hasta 120 g (70 g más).',
          '1:30: hasta 180 g.',
          '2:15: hasta 240 g.',
          '3:00: hasta 300 g y deja que drene.',
        ],
        timer: [45, 45, 45, 45, null],
        text: [
          'Para una taza más dulce, haz el primer vertido más pequeño que el segundo (50 + 70); para una más brillante y ácida, al revés (70 + 50). Para más intensidad divide el último 60% en más vertidos; para menos, en menos.',
        ],
      },
      {
        title: 'AeroPress: la clásica',
        lead: 'Un método indulgente: infusión más una presión suave. Receta de Hoffmann.',
        facts: [
          ['Café', '11–15 g'],
          ['Agua', '200–250 g, 90–100 °C'],
          ['Molienda', 'fina / media-fina'],
          ['Tiempo', '~3:00'],
        ],
        steps: [
          'Pon un filtro de papel, enjuágalo con agua caliente y coloca la AeroPress sobre la taza.',
          'Añade el café y vierte toda el agua.',
          'Inserta el émbolo ~1 cm enseguida: el vacío evita que gotee.',
          'Espera 2 minutos.',
          'Gira suavemente la AeroPress para bajar la espuma.',
          'Espera 30 segundos más y presiona despacio, unos 30 segundos, parando antes del silbido.',
        ],
        timer: [null, 10, 5, 105, 5, 60],
        tip: 'Si amarga, muele más grueso o usa agua más fría. Si sabe vacío y ácido, más fino o más tiempo.',
      },
      {
        title: 'AeroPress: invertida',
        lead: 'La AeroPress se pone boca abajo: no gotea nada y controlas toda la infusión.',
        facts: [
          ['Café', '15 g'],
          ['Agua', '220 g, 85–92 °C'],
          ['Molienda', 'media-fina'],
          ['Tiempo', '~2:30'],
        ],
        steps: [
          'Inserta el émbolo ~1 cm y apoya la AeroPress sobre él, boca abajo.',
          'Añade el café, vierte 50 g de agua, remueve y espera 30 segundos.',
          'Completa hasta 220 g y enrosca la tapa con el filtro enjuagado.',
          'A los 1:30, dale la vuelta con cuidado sobre la taza.',
          'Presiona durante 20–30 segundos.',
        ],
        timer: [null, 30, 60, 10, 30],
        tip: 'Gírala con decisión, sujetando cámara y émbolo: el agua caliente es peligrosa.',
      },
      {
        title: 'AeroPress: concentrado',
        lead: 'Una base intensa para un americano o una bebida con leche.',
        facts: [
          ['Café', '18 g'],
          ['Agua', '90–100 g, ~90 °C'],
          ['Molienda', 'fina'],
        ],
        steps: [
          'Añade el café, vierte el agua y remueve con energía 10 segundos.',
          'Presiona al cabo de 1 minuto.',
          'Completa con agua caliente hasta 200 g o añade leche.',
        ],
        timer: [10, 50, null],
      },
      {
        title: 'Filtrado con hielo (estilo japonés)',
        lead: 'Parte del agua se sustituye por hielo en la jarra: café frío y brillante en 3 minutos.',
        facts: [
          ['Café', '20 g'],
          ['Agua caliente', '200 g'],
          ['Hielo', '120 g en la jarra'],
          ['Molienda', 'algo más fina de lo normal'],
        ],
        steps: [
          'Pon el hielo en la jarra y el gotero encima.',
          'Prepara como un V60 normal, pero solo con 200 g de agua.',
          'El café cae sobre el hielo y se enfría al instante; remueve y sirve sobre hielo nuevo.',
        ],
        timer: [null, 180, null],
      },
      {
        title: 'Kalita Wave y goteros de fondo plano',
        lead: 'Cama plana y agujeros pequeños: más uniforme y perdona un vertido irregular.',
        facts: [
          ['Café', '20 g'],
          ['Agua', '320 g, 93–96 °C'],
          ['Molienda', 'media'],
          ['Tiempo', '3:00–3:30'],
        ],
        steps: [
          'Enjuaga el filtro y añade el café.',
          '0:00: bloom con 50 g durante 30 segundos.',
          'Luego vierte 50–70 g cada 20–30 segundos, manteniendo el nivel de agua constante.',
          'Llega a 320 g hacia los 2:00 y deja que drene.',
        ],
        timer: [null, 30, 90, null],
      },
      {
        title: 'Chemex',
        lead: 'El filtro grueso da una taza muy limpia y ligera; práctico para varias personas.',
        facts: [
          ['Café', '30 g'],
          ['Agua', '500 g, 94–96 °C'],
          ['Molienda', 'media-gruesa'],
          ['Tiempo', '4:00–5:00'],
        ],
        steps: [
          'Coloca el filtro doblado con el lado triple hacia el pico, enjuágalo y tira el agua.',
          'Bloom con 60 g de agua durante 45 segundos.',
          'Vierte en espiral y por etapas hasta 500 g hacia los 2:30.',
          'Deja que drene, retira el filtro y gira la jarra.',
        ],
        timer: [null, 45, 105, null],
      },
      {
        title: 'Prensa francesa',
        lead: 'Una taza con mucho cuerpo. El método de Hoffmann, sin posos.',
        facts: [
          ['Café', '30 g'],
          ['Agua', '500 g, recién hervida'],
          ['Molienda', 'media-gruesa'],
          ['Tiempo', '~9–12 minutos'],
        ],
        steps: [
          'Añade el café y toda el agua.',
          'Espera 4 minutos.',
          'Rompe la costra y retira con dos cucharas la espuma y los trozos que flotan.',
          'Espera otros 5–8 minutos: los posos bajan solos.',
          'Baja el émbolo solo hasta la superficie y sirve despacio.',
        ],
        timer: [15, 225, 30, 300, null],
      },
      {
        title: 'Clever Dripper',
        lead: 'Infusión como en una prensa francesa, filtrado como en un V60.',
        facts: [
          ['Café', '20 g'],
          ['Agua', '320 g, 94–96 °C'],
          ['Molienda', 'media-gruesa'],
          ['Tiempo', '~3:30'],
        ],
        steps: [
          'Enjuaga el filtro y tira el agua.',
          'Vierte primero el agua y luego añade el café: se moja de forma más pareja.',
          'Remueve a los 2 minutos.',
          'Colócalo sobre la taza: la válvula se abre y drena en un minuto.',
        ],
        timer: [null, 15, 105, 60],
      },
      {
        title: 'Cafetera moka (italiana)',
        lead: 'Café fuerte y con cuerpo en el fuego; no es espresso, pero se le parece.',
        facts: [
          ['Proporción', '~1:7–1:10'],
          ['Molienda', 'fina, pero más gruesa que para espresso'],
          ['Fuego', 'medio'],
        ],
        steps: [
          'Llena el depósito inferior con agua caliente hasta la válvula, no más.',
          'Llena el filtro de café y nivélalo sin apretar.',
          'Monta la cafetera (sujeta la base con un paño) y ponla a fuego medio con la tapa abierta.',
          'Cuando el chorro se aclare y empiece a borbotear, retírala del fuego.',
          'Enfría la base con agua fría para detener la extracción.',
        ],
        timer: [null, null, null, null, null],
      },
      {
        title: 'Cold brew',
        lead: 'Infusión en frío de 12–18 horas: dulce, suave, casi sin acidez.',
        facts: [
          ['Café', '100 g'],
          ['Agua', '1 L fría'],
          ['Molienda', 'gruesa'],
          ['Tiempo', '12–18 h en la nevera'],
        ],
        steps: [
          'Mezcla el café con el agua fría y remueve.',
          'Tapa y deja en la nevera 12–18 horas.',
          'Cuela con un colador y luego con un filtro de papel.',
          'Es un concentrado: diluye 1:1 con agua o leche y sirve con hielo.',
        ],
        timer: [null, null, null, null],
        tip: 'El concentrado aguanta hasta una semana en la nevera.',
      },
      {
        title: 'Cezve (café turco)',
        lead: 'Café con posos y espuma; la clave es que nunca hierva.',
        facts: [
          ['Café', '7–8 g por 70 ml'],
          ['Molienda', 'polvo'],
          ['Agua', 'fría'],
        ],
        steps: [
          'Pon el café (y azúcar, si quieres) en el cezve, añade agua fría y remueve.',
          'Calienta despacio sin remover.',
          'Cuando la espuma empiece a subir, retíralo antes de que hierva.',
          'Reparte la espuma en las tazas y sirve el café. Deja reposar los posos un minuto.',
        ],
        timer: [null, null, null, 60],
      },
    ],
  },
  {
    id: 'espresso',
    title: 'Espresso y bebidas',
    summary: 'Cómo funciona el espresso, receta de un shot y bebidas con leche',
    articles: [
      {
        title: 'Qué es un espresso',
        lead: 'Café concentrado: agua caliente a ~9 bar durante 25–30 segundos.',
        facts: [
          ['Dosis', '18 g'],
          ['Rendimiento', '36–40 g (1:2)'],
          ['Tiempo', '25–32 s'],
          ['Temperatura', '92–94 °C'],
        ],
        text: [
          'La presión empuja el agua a través de una pastilla compacta de café muy fino. El resultado es denso, con crema: espuma de CO₂ y aceites. Un café más fresco da más crema, pero la crema no dice nada del sabor.',
        ],
      },
      {
        title: 'Ajustar un shot',
        lead: 'Cambia la molienda, no la dosis: tiempo y rendimiento son tu guía.',
        terms: [
          ['Rápido y ácido', 'muele más fino.'],
          ['Lento y amargo', 'muele más grueso.'],
          ['Chorros, ácido y amargo', 'canalización: distribuye con agujas (WDT) y apisona nivelado.'],
          ['Tueste claro', 'proporción más larga, 1:2,5–1:3, y más temperatura.'],
        ],
        tip: 'Ristretto es 1:1–1:1,5, normale 1:2, lungo 1:3. Los turbo shots (molienda más gruesa, ~15 s) son una opción moderna para tuestes claros.',
      },
      {
        title: 'Bebidas con espresso',
        lead: 'La diferencia está en cuánta leche y espuma llevan.',
        terms: [
          ['Americano', 'espresso más agua caliente. El long black es al revés: espresso sobre el agua, conserva la crema.'],
          ['Macchiato (cortado italiano)', 'espresso con una cucharada de espuma de leche.'],
          ['Cortado', 'espresso y leche a partes casi iguales, ~120 ml.'],
          ['Flat white', 'doble espresso y espuma fina y sedosa, 150–180 ml; manda el café.'],
          ['Capuchino', '150–180 ml con ~1–1,5 cm de espuma.'],
          ['Latte', '240+ ml, mucha leche, espuma fina: el más suave.'],
        ],
      },
      {
        title: 'Leche',
        lead: 'Calienta a 55–65 °C; por encima, la leche pierde dulzor.',
        steps: [
          'Vierte leche fría en una jarra fría, hasta el inicio del pico.',
          'Coloca el vaporizador justo bajo la superficie y deja entrar aire: un siseo suave.',
          'Cuando el volumen crezca un 20–50% (según la bebida), hunde el vaporizador y crea un remolino.',
          'Para cuando la jarra queme en la mano (~60 °C).',
          'Golpea la jarra contra la mesa y gírala hasta que la espuma brille.',
        ],
        tip: 'Las bebidas vegetales «barista» espuman mejor que las normales.',
      },
    ],
  },
  {
    id: 'tasting',
    title: 'Cata',
    summary: 'Cómo catar, acidez y cuerpo, la rueda de sabores, catación y defectos',
    articles: [
      {
        title: 'Cómo probar el café',
        lead: 'Huele, sorbe con ruido y sigue probando mientras se enfría.',
        steps: [
          'Huele el café molido y luego la bebida.',
          'Sorbe con ruido: el aire reparte el aroma por la nariz y la boca.',
          'Fíjate en el dulzor, la acidez, el cuerpo y el posgusto.',
          'Prueba otra vez cuando esté tibio: el sabor cambia y la acidez y la fruta se notan más.',
          'Compara dos cafés a la vez: las diferencias se perciben mucho mejor.',
        ],
      },
      {
        title: 'Acidez',
        lead: 'En un buen café la acidez es jugosidad, no agrura.',
        terms: [
          ['Cítrica', 'limón, naranja, pomelo; a menudo Etiopía.'],
          ['Málica', 'manzana verde, pera.'],
          ['Tartárica', 'uva, vino; a menudo naturales.'],
          ['Chispeante', 'grosella negra, brillo; Kenia.'],
          ['Láctica', 'suave, cremosa, yogur; a veces tras fermentación anaeróbica.'],
          ['Acética', 'en exceso, el vinagre de un café sobrefermentado.'],
        ],
      },
      {
        title: 'Cuerpo, dulzor, posgusto',
        lead: 'Cómo se siente el café en boca y cuánto dura.',
        terms: [
          ['Cuerpo', 'textura: de ligero como un té a almibarado y cremoso. El filtro metálico y la prensa francesa dan más cuerpo.'],
          ['Dulzor', 'caramelo, miel, fruta madura; señal de cereza madura y buen tueste.'],
          ['Amargor', 'con moderación, como el chocolate negro; en exceso, sobreextracción o tueste oscuro.'],
          ['Posgusto', 'largo y agradable es señal de calidad; corto y seco, no.'],
          ['Balance', 'ningún aspecto del sabor domina a los demás.'],
          ['Taza limpia', 'sin sabores extraños ni sucios.'],
        ],
      },
      {
        title: 'La rueda de sabores y los descriptores',
        lead: 'Las notas de la bolsa son asociaciones, no aditivos: el café no lleva arándanos.',
        text: [
          'La rueda de sabores de la SCA y World Coffee Research ayuda a nombrar lo que percibes. Empieza por el centro (frutal, dulce, a frutos secos) y avanza hacia fuera: frutal → frutos rojos → arándano.',
          'Los tostadores escriben las notas que perciben al catar. Tu taza puede salir distinta por el agua, la molienda o la receta, y es normal.',
        ],
        tip: 'Prueba fruta de verdad, especias, té y chocolate prestando atención: es el mejor entrenamiento.',
      },
      {
        title: 'Catación',
        lead: 'La forma estándar de comparar cafés: las mismas condiciones para cada muestra.',
        facts: [
          ['Café', '8,25 g por 150 ml'],
          ['Molienda', 'media-gruesa'],
          ['Agua', '~93 °C'],
        ],
        steps: [
          'Muele cada muestra en su taza y huele la fragancia en seco.',
          'Llena de agua hasta el borde y pon 4 minutos.',
          'Rompe la costra con una cuchara y aspira el aroma.',
          'Retira la espuma y los posos con dos cucharas.',
          'Desde el minuto 8–10, sorbe de la cuchara y vuelve a las muestras mientras se enfrían.',
        ],
      },
      {
        title: 'Defectos comunes',
        lead: 'Algunos sabores no son «carácter», sino un error en la finca, el almacenaje o el tueste.',
        terms: [
          ['Vinagre, fruta podrida', 'cerezas sobrefermentadas o mal secado.'],
          ['Patata', 'el «defecto de papa» (Ruanda, Burundi): daño de un insecto.'],
          ['Medicinal, yodo', 'defecto fenólico.'],
          ['Arpillera, cartón', 'café verde viejo (cosecha pasada) o tueste pasado.'],
          ['Cacahuete crudo, hierba', 'granos inmaduros («quakers») o tueste subdesarrollado.'],
          ['Pan, plano', 'tueste «horneado», demasiado lento.'],
          ['Ceniza, quemado', 'quemado en la tostadora o tueste oscuro.'],
        ],
      },
    ],
  },
  {
    id: 'label',
    title: 'Leer una bolsa',
    summary: 'Qué significa cada línea de la bolsa y qué mirar al comprar',
    articles: [
      {
        title: 'Origen',
        lead: 'Cuanto más preciso el lugar, mejor la trazabilidad.',
        terms: [
          ['País y región', 'una guía general del sabor.'],
          ['Finca, productor', 'una persona o familia concreta: señal de un lote propio.'],
          ['Estación de lavado, cooperativa', 'café de muchos pequeños productores procesado en un mismo lugar (Etiopía, Kenia, Ruanda).'],
          ['Microlote', 'una partida pequeña de una parcela o un día de cosecha.'],
          ['Origen único / blend', 'un solo origen o una mezcla; los blends suelen hacerse para espresso, por equilibrio.'],
        ],
      },
      {
        title: 'Variedad, proceso, altitud',
        lead: 'Las tres líneas que más dicen del sabor.',
        text: [
          'El proceso indica el carácter: lavado es limpieza y acidez; natural, fruta y cuerpo; anaeróbico, notas de fermentación atrevidas. La variedad y la altitud añaden detalle: Geisha son flores; SL28, grosella negra; 2000 m, brillo.',
          'Coffee Shelf usa todos estos campos para aprender qué te gusta, así que vale la pena rellenarlos al escanear.',
        ],
      },
      {
        title: 'Tueste y fechas',
        lead: 'Busca la fecha de tueste y el uso: filtro, espresso u omni.',
        terms: [
          ['Fecha de tueste', 'la fecha importante; el «consumir preferentemente» casi no dice nada del sabor.'],
          ['Fecha de cosecha', 'el café verde está mejor durante el primer año.'],
          ['Filtro / espresso', 'te dice cómo prepararlo.'],
          ['Nivel de tueste', 'claro, medio, oscuro.'],
        ],
      },
      {
        title: 'Descriptores y puntuación',
        lead: 'Las notas de sabor son una guía; los puntos, un nivel de calidad.',
        text: [
          'Notas como «melocotón, jazmín, miel» son lo que el tostador percibió al catar. Una puntuación de 85–86 es buena especialidad; 88+, algo especial. No todos los tostadores publican puntos, y los de distintos tostadores no siempre son comparables.',
        ],
      },
      {
        title: 'Certificaciones',
        lead: 'Orgánico, Fairtrade, Rainforest Alliance: hablan de métodos y condiciones, no de sabor.',
        terms: [
          ['Orgánico', 'sin fertilizantes ni pesticidas sintéticos.'],
          ['Fairtrade', 'un precio mínimo y una prima para la cooperativa.'],
          ['Rainforest Alliance', 'medio ambiente y condiciones de trabajo.'],
          ['Comercio directo', 'no es un sello sino una práctica de compra: mira si el tostador publica los precios.'],
        ],
      },
    ],
  },
  {
    id: 'glossary',
    title: 'Glosario',
    summary: 'Definiciones breves de términos que aparecen en bolsas y recetas',
    articles: [
      {
        title: 'Términos clave',
        lead: 'Bloom, TDS, caracolillo, canalización y otras palabras del mundo del café.',
        terms: [
          ['Bloom (preinfusión)', 'el primer mojado del café con un poco de agua para que salga el gas.'],
          ['Blend', 'mezcla de cafés de distintos orígenes.'],
          ['Canalización', 'el agua encuentra un camino fácil por el café y lo extrae de forma desigual.'],
          ['Caracolillo', 'una sola semilla redonda en la cereza en vez de dos.'],
          ['Cáscara', 'piel y pulpa secas de la cereza de café, se preparan como infusión.'],
          ['Catación', 'la cata profesional estándar.'],
          ['Crema', 'la espuma del espresso, de CO₂ y aceites.'],
          ['Café verde', 'café sin tostar.'],
          ['Dosis', 'el peso del café molido para una preparación.'],
          ['Drenaje (drawdown)', 'lo que tarda el agua en atravesar el café al final de un filtrado.'],
          ['Extracción (EY)', 'la parte del peso del grano que pasa a la bebida.'],
          ['Filtrado (pour-over)', 'preparar vertiendo agua sobre café en un filtro.'],
          ['Finos', 'partículas diminutas de la molienda; frenan el flujo y añaden amargor.'],
          ['Microlote', 'una partida pequeña de una parcela o un día de cosecha.'],
          ['Mucílago', 'la capa pegajosa entre la pulpa y el pergamino.'],
          ['Origen único', 'café de un solo origen.'],
          ['Pergamino', 'la cáscara dura alrededor del grano, se retira antes de exportar.'],
          ['Q grader', 'catador certificado que puntúa el café según el protocolo SCA.'],
          ['Quakers', 'granos inmaduros que quedan pálidos tras el tueste; saben a cacahuete y papel.'],
          ['Rendimiento (yield)', 'el peso de la bebida terminada, sobre todo en espresso.'],
          ['SCA', 'la Specialty Coffee Association, que fija los estándares.'],
          ['TDS', 'la proporción de sólidos disueltos en la bebida: mide la intensidad.'],
          ['Terroir', 'la combinación de suelo, clima y altitud que da forma al sabor.'],
          ['WDT', 'remover el café molido en el portafiltro con agujas finas antes de apisonar.'],
        ],
      },
    ],
  },
]

export default book
