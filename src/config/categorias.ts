/**
 * Registro único de las categorías del blog. Gobierna nombres, orden, umbral de
 * apertura y textos de hub. Cualquier consumidor (esquema, rutas, sitemap) lee de aquí.
 *
 * `minimo` = piezas publicadas necesarias para que la categoría genere hub propio.
 * Una categoría por debajo de su mínimo NO genera ruta y NO entra al sitemap.
 */
export const CATEGORIAS = {
  mexico: {
    nombre: 'Gundam en México',
    orden: 1,
    minimo: 3,
    descripcion: 'Dónde comprar, dónde ver y dónde encontrarse con la escena Gundam en el país.',
    meta: 'Guías para comprar, ver y vivir Gundam en México: tiendas, eventos, comunidad y plataformas con contexto útil para encontrar información comprobable.',
    intro: 'Esta categoría reúne información para seguir Gundam desde México: dónde buscar series, cómo ubicar tiendas y eventos, y de qué forma participar en la comunidad. Sirve tanto para quien apenas está encontrando la franquicia como para quien necesita una referencia local antes de comprar o asistir a una actividad. Complementa el directorio de /tiendas/, el calendario de /eventos/ y las rutas de entrada publicadas en el sitio.',
  },
  gunpla: {
    nombre: 'Gunpla',
    orden: 2,
    minimo: 3,
    descripcion: 'Qué es cada grado, qué significan las siglas y cómo se arma un model kit.',
    meta: 'Guías de Gunpla para entender grados, escalas, armado, herramientas y cuidado de kits, desde el primer modelo hasta decisiones más técnicas.',
    intro: 'Aquí están las guías para entender el hobby del Gunpla sin asumir experiencia previa. Explican grados, escalas, herramientas, armado y cuidados, además de las preguntas que aparecen al elegir un primer kit o avanzar a uno más complejo. Es una lectura útil antes de consultar /gunpla/ para conocer cada grado, /kits/ para ver modelos registrados o /tiendas/ para localizar opciones de compra.',
  },
  series: {
    nombre: 'Series y películas',
    orden: 3,
    minimo: 3,
    descripcion: 'Qué es cada obra de la franquicia, qué cuenta y a quién le va a gustar.',
    meta: 'Artículos sobre series y películas de Gundam: historias, universos, personajes y claves para elegir qué ver según tus intereses y conocer cada obra.',
    intro: 'Esta categoría ordena artículos sobre las series y películas de Gundam: de qué trata cada obra, cómo se relaciona con su universo y qué conviene saber antes de verla. Está pensada para quien busca una puerta de entrada y para quien quiere situar una historia dentro de la franquicia. Puedes complementar la lectura con las fichas de /series/ y la vista comparativa de /cronologia/.',
  },
  empezar: {
    nombre: 'Empezar en Gundam',
    orden: 4,
    minimo: 3,
    descripcion: 'Por dónde entrar a cuarenta años de franquicia sin abandonar en el intento.',
    meta: 'Guías para iniciar en Gundam: series de entrada, conceptos básicos y primeras decisiones para conocer la franquicia sin perderse entre sus universos.',
    intro: 'Los artículos de esta categoría acompañan el primer contacto con Gundam. Reúnen rutas de entrada, explicaciones de conceptos y criterios para escoger una serie o un kit sin perderse entre universos, épocas y formatos. Son útiles si quieres pasar de la curiosidad a una primera obra concreta. Para profundizar después, el archivo de /series/, la guía de /cronologia/ y la sección de /gunpla/ ofrecen contexto adicional.',
  },
  comprar: {
    nombre: 'Comprar Gunpla',
    orden: 5,
    minimo: 3,
    descripcion: 'Precios reales en México, cómo distinguir un kit original y dónde conseguirlo.',
    meta: 'Información para comprar Gunpla en México: cómo revisar originalidad, precios, preventas, tiendas y alternativas antes de elegir un kit para armar.',
    intro: 'Esta categoría concentra decisiones de compra de Gunpla en México: cómo revisar originalidad, entender precios, valorar preventas y comparar alternativas antes de elegir un kit. Está dirigida a quien quiere comprar con información verificable, ya sea su primer modelo o una pieza específica. Las guías se complementan con el directorio de /tiendas/ y el catálogo de /kits/, donde se registran referencias y disponibilidad observada.',
  },
  'donde-ver': {
    nombre: 'Dónde ver',
    orden: 6,
    minimo: 1,
    descripcion: 'En qué plataforma está cada serie en México, con qué doblaje y desde cuándo.',
    meta: 'Disponibilidad de anime Gundam en México: plataformas, ediciones y notas para ubicar cada serie o película antes de buscarla y entender cómo verla.',
    intro: 'Aquí se agrupan las guías sobre dónde encontrar anime de Gundam desde México. Cubren disponibilidad, plataformas, ediciones y cambios que pueden afectar la forma de ver una serie o película. Resulta útil si ya sabes qué obra buscas o si quieres confirmar si está accesible antes de empezar. Para elegir una obra, revisa también las fichas de /series/ y las explicaciones de /cronologia/.',
  },
  'mobile-suits': {
    nombre: 'Mobile suits y lore',
    orden: 7,
    minimo: 3,
    descripcion: 'Las máquinas, los pilotos, las facciones y los calendarios de la franquicia.',
    meta: 'Contexto de mobile suits, pilotos, facciones y universos de Gundam para entender las máquinas y conflictos que conectan cada obra y sus protagonistas.',
    intro: 'Esta categoría explica el lore que rodea a Gundam: mobile suits, pilotos, facciones, tecnologías y universos. Está pensada para lectores que quieren entender una máquina o conflicto sin tener que recorrer toda la franquicia primero. Los artículos sirven como contexto y se conectan con las fichas de /mobile-suits/, /series/ y /cronologia/, donde cada elemento puede explorarse con mayor detalle editorial.',
  },
  juegos: {
    nombre: 'Juegos y TCG',
    orden: 8,
    minimo: 3,
    descripcion: 'El juego de cartas, los videojuegos y cómo se juegan desde México.',
    meta: 'Guías sobre videojuegos, juegos de cartas y otras formas de jugar Gundam desde México, con contexto para saber cómo funcionan, dónde empezar y qué esperar.',
    intro: 'Los artículos de juegos reúnen videojuegos, juegos de cartas y otras maneras de participar en Gundam fuera del anime y el modelismo. Explican de qué trata cada formato, qué necesita una persona para empezar y qué conviene revisar antes de involucrarse. Son una referencia para lectores en México que buscan contexto antes de jugar o coleccionar. Cuando corresponde, se enlazan con /series/ y /tiendas/ para ampliar la búsqueda.',
  },
  coleccionismo: {
    nombre: 'Coleccionismo',
    orden: 9,
    minimo: 3,
    descripcion: 'Figuras oficiales, gashapon, juegos de miniaturas y colaboraciones: qué existe, qué es oficial y cómo reconocerlo.',
    meta: 'Figuras oficiales, gashapon, juegos de miniaturas y colaboraciones de Gundam: cómo identificarlos y entender qué opciones existen al coleccionar.',
    intro: 'Esta categoría cubre el coleccionismo de Gundam más allá del Gunpla: figuras oficiales, gashapon, miniaturas y colaboraciones. Explica qué existe, cómo reconocer productos oficiales y qué información conviene revisar antes de incorporar una pieza a una colección. Sirve para quien está descubriendo formatos distintos al modelismo y para quien quiere comparar opciones con calma. La sección de /gunpla/ y el directorio de /tiendas/ ayudan a continuar la búsqueda.',
  },
} as const;

export type CategoriaId = keyof typeof CATEGORIAS;

export const CATEGORIA_IDS = Object.keys(CATEGORIAS) as [CategoriaId, ...CategoriaId[]];
