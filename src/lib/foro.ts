export const CATEGORIAS_FORO = [
  'gunpla-y-tecnicas',
  'series-y-universo',
  'compra-venta',
  'eventos-y-clubes',
  'general',
] as const;

export type CategoriaForo = typeof CATEGORIAS_FORO[number];

type DatosArticulo = {
  titulo?: string;
  resumen?: string;
  tema?: string;
  categoria?: string;
  tags?: string[];
  series?: string[];
  universos?: string[];
  tiendas_relacionadas?: string[];
  kits_relacionados?: string[];
  keyword_principal?: string;
  keywords_secundarias?: string[];
};

const BASE_FORO = 'https://comunidad.gundam.mx/foro/';

const normalizar = (valor: string) =>
  valor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const contiene = (texto: string, terminos: string[]) =>
  terminos.some((termino) => texto.includes(termino));

export const urlCategoriaForo = (categoria: CategoriaForo) => `${BASE_FORO}${categoria}/`;

export const categoriaForoArticulo = (datos: DatosArticulo): CategoriaForo => {
  const camposPrincipales = [
    datos.titulo,
    datos.resumen,
    datos.keyword_principal,
    ...(datos.tags ?? []),
    ...(datos.keywords_secundarias ?? []),
  ].filter(Boolean).map((v) => normalizar(String(v))).join(' ');

  // La categoría propia del artículo es una señal mucho más fiable que el
  // barrido de palabras: se resuelve primero y sólo se cae al heurístico
  // cuando la categoría no determina por sí sola dónde va la conversación
  // (`empezar` y `mexico` cubren temas muy distintos entre sí).
  if (datos.categoria === 'gunpla') return 'gunpla-y-tecnicas';
  if (datos.categoria === 'comprar') return 'compra-venta';
  if (datos.categoria === 'series' || datos.categoria === 'donde-ver' || datos.categoria === 'mobile-suits') {
    return 'series-y-universo';
  }
  // Videojuegos y TCG no son compraventa: sin categoría propia en el foro,
  // su sitio es general. Sin esto, un artículo de un juego con una fecha de
  // preventa acababa invitando a comprar y vender.
  if (datos.categoria === 'juegos') return 'general';
  if (datos.tema === 'series' || datos.tema === 'universo' || (datos.series?.length ?? 0) > 0 || (datos.universos?.length ?? 0) > 0) {
    return 'series-y-universo';
  }

  // Un artículo de `mexico` sobre la comunidad o sobre historia no es
  // compraventa aunque de paso hable de precios o de tiendas.
  if (datos.categoria === 'mexico' && contiene(camposPrincipales, [
    'comunidad', 'foro gundam mexico', 'comunidad.gundam.mx', 'historia', 'llego a mexico',
  ])) {
    return 'general';
  }

  if (contiene(camposPrincipales, ['evento', 'eventos', 'convencion', 'club', 'torneo', 'summit', 'mole', 'ipms'])) {
    return 'eventos-y-clubes';
  }

  if (
    (datos.tiendas_relacionadas?.length ?? 0) > 0 ||
    contiene(camposPrincipales, ['comprar', 'compra', 'venta', 'vender', 'precio', 'preventa', 'p-bandai', 'p bandai', 'tienda', 'original', 'importar'])
  ) {
    return 'compra-venta';
  }

  if (
    contiene(camposPrincipales, ['serie', 'series', 'universo', 'universal century', 'cronologia', 'orden ver', 'donde ver', 'pelicula', 'anime', 'zaku', 'char'])
  ) {
    return 'series-y-universo';
  }

  if (
    datos.tema === 'gunpla' ||
    (datos.kits_relacionados?.length ?? 0) > 0 ||
    contiene(camposPrincipales, ['gunpla', 'model kit', 'armar', 'herramienta', 'panel lining', 'top coat', 'acabado', 'ver ka', 'grado'])
  ) {
    return 'gunpla-y-tecnicas';
  }

  return 'general';
};
