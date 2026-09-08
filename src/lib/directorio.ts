import { getCollection, type CollectionEntry } from 'astro:content';
import { slugificar } from '@lib/estados';
import { fechaLarga } from '@lib/precio';

export type Tienda = CollectionEntry<'tiendas'>;

/**
 * Tiendas publicables: excluye las cerradas del listado general.
 * Memoizada por build: la colección se lee y se ordena una sola vez, aunque
 * la llamen una decena de páginas.
 */
let cacheTiendas: Promise<Tienda[]> | null = null;
export function tiendasActivas(): Promise<Tienda[]> {
  cacheTiendas ??= getCollection('tiendas').then((todas) =>
    todas.filter((t) => t.data.verificacion.estado !== 'cerrada').sort(ordenarTiendas));
  return cacheTiendas;
}

/** Verificadas primero, luego destacadas, luego alfabético. */
export function ordenarTiendas(a: Tienda, b: Tienda) {
  const peso = (t: Tienda) =>
    (t.data.verificacion.estado === 'verificada' ? 0 : 10) + (t.data.destacada ? -1 : 0);
  const d = peso(a) - peso(b);
  return d !== 0 ? d : a.data.nombre.localeCompare(b.data.nombre, 'es-MX');
}

/** Estados donde la tienda tiene presencia física. */
export function estadosDe(t: Tienda): string[] {
  return [...new Set(t.data.sucursales.map((s) => s.estado))];
}

export function ciudadesDe(t: Tienda): { slug: string; nombre: string; estado: string }[] {
  // Una tienda con varias sucursales en la misma ciudad cuenta UNA vez.
  const vistas = new Map<string, { slug: string; nombre: string; estado: string }>();
  for (const s of t.data.sucursales) {
    const slug = slugificar(s.ciudad);
    if (!vistas.has(slug)) vistas.set(slug, { slug, nombre: s.ciudad, estado: s.estado });
  }
  return [...vistas.values()];
}

export async function tiendasPorEstado(estado: string) {
  const tiendas = await tiendasActivas();
  return tiendas.filter((t) => estadosDe(t).includes(estado));
}

export async function tiendasPorCiudad(ciudadSlug: string) {
  const tiendas = await tiendasActivas();
  return tiendas.filter((t) => ciudadesDe(t).some((c) => c.slug === ciudadSlug));
}

export async function tiendasEnLinea() {
  const tiendas = await tiendasActivas();
  return tiendas.filter((t) => t.data.envio_nacional || t.data.tipo === 'online');
}

/**
 * GUARDIA ANTIFACETAS.
 * Una faceta curada sólo merece URL propia si su conjunto es un subconjunto
 * REAL del censo. Si devuelve exactamente las mismas fichas que `/tiendas/`,
 * no aporta nada que el índice no tenga: se compila (conserva su tabla
 * comparativa y su valor de navegación) pero sale del índice y del sitemap.
 * En cuanto el censo la diferencie, se reactiva sola.
 */
export async function facetaAporta(items: Tienda[]): Promise<boolean> {
  const todas = await tiendasActivas();
  const propios = new Set(items.map((t) => t.id));
  if (propios.size < UMBRAL_FACETA) return false;
  // Comparación real de conjuntos: no se asume que `items` sea un subconjunto
  // ni que no traiga repetidos. Si cubre todo el censo, no aporta una URL.
  if (propios.size >= todas.length && todas.every((t) => propios.has(t.id))) return false;
  return true;
}

export async function tiendasVerificadas() {
  const tiendas = await tiendasActivas();
  return tiendas.filter((t) => t.data.verificacion.estado === 'verificada');
}

/* ------------------------------------------------------------------ */
/* Política de indexación — fuente única                               */
/* ------------------------------------------------------------------ */
/**
 * Una página de listado sólo existe si responde a una consulta real.
 * Reglas, en orden:
 *   - 0 entidades  → NO SE COMPILA. Un HTML vacío sólo consume rastreo.
 *   - 1 entidad    → se compila con `noindex`; se activa sola al llegar a 2.
 *   - ≥2 entidades → indexable y en el sitemap.
 * Cada eje lleva su propio umbral: comparten el valor, no la constante,
 * para que cambiar uno no cambie los otros sin querer.
 */
export const UMBRAL_CIUDAD = 2;
export const UMBRAL_ESTADO = 2;
export const UMBRAL_CATEGORIA = 2;
export const UMBRAL_FACETA = 2;

/**
 * Ciudades que NO llevan página propia porque su página de estado ya las cubre
 * al cien por ciento. Publicar ambas sería contenido duplicado.
 */
const CIUDADES_CUBIERTAS_POR_ESTADO = new Set(['ciudad-de-mexico']);

export async function ciudadesConPagina() {
  const tiendas = await tiendasActivas();
  const mapa = new Map<string, { slug: string; nombre: string; estado: string; total: number }>();
  for (const t of tiendas) {
    for (const c of ciudadesDe(t)) {
      const previo = mapa.get(c.slug);
      mapa.set(c.slug, { ...c, total: (previo?.total ?? 0) + 1 });
    }
  }
  return [...mapa.values()]
    .filter((c) => !CIUDADES_CUBIERTAS_POR_ESTADO.has(c.slug))
    .sort((a, b) => b.total - a.total);
}

export async function estadosConTiendas() {
  const tiendas = await tiendasActivas();
  const mapa = new Map<string, number>();
  for (const t of tiendas) {
    for (const e of estadosDe(t)) mapa.set(e, (mapa.get(e) ?? 0) + 1);
  }
  return mapa;
}

export const indexable = (total: number) => total >= UMBRAL_CIUDAD;


/* ------------------------------------------------------------------ */
/* Categorías de tienda                                                */
/* ------------------------------------------------------------------ */
export const CATEGORIAS = {
  especialista: { nombre: 'Especialistas en Gunpla', descripcion: 'Gunpla es su línea principal: catálogo profundo y preventas.' },
  coleccionables: { nombre: 'Coleccionables', descripcion: 'Tiendas de anime y figuras con sección de Gunpla.' },
  modelismo: { nombre: 'Modelismo', descripcion: 'Hobby shops de maquetas, pinturas y herramienta.' },
  oficial: { nombre: 'Canal oficial', descripcion: 'Puntos de venta operados por la propia marca.' },
} as const;
export type CategoriaId = keyof typeof CATEGORIAS;

export async function categoriasConTiendas() {
  const tiendas = await tiendasActivas();
  return (Object.keys(CATEGORIAS) as CategoriaId[])
    .map((slug) => ({ slug, ...CATEGORIAS[slug], total: tiendas.filter((t) => t.data.categoria === slug).length }))
    .filter((c) => c.total > 0);
}

/** Categorías que sí llevan página propia: las que llegan al umbral. */
export async function categoriasConPagina() {
  return (await categoriasConTiendas()).filter((c) => c.total >= UMBRAL_CATEGORIA);
}

export async function tiendasPorCategoria(slug: CategoriaId) {
  const tiendas = await tiendasActivas();
  return tiendas.filter((t) => t.data.categoria === slug);
}

/* ------------------------------------------------------------------ */
/* FAQ derivada de datos reales de la ficha (nunca inventada)          */
/* ------------------------------------------------------------------ */
/** Enumera en español: "a", "a y b", "a, b y c". */
function listaEs(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

export function faqDeTienda(t: Tienda): { pregunta: string; respuesta: string }[] {
  const d = t.data;
  const items: { pregunta: string; respuesta: string }[] = [];
  const ciudad = d.sucursales[0]?.ciudad;

  if (d.vende_gunpla === 'si') {
    items.push({
      pregunta: `¿${d.nombre} vende Gunpla original?`,
      respuesta:
        d.verificacion.estado === 'verificada'
          ? `Sí. Comprobamos su oferta de Gunpla el ${fechaLarga(d.verificacion.fecha)} con las fuentes que enlazamos en esta ficha.${d.origen_producto === 'distribuidor_autorizado' ? ' Opera como distribuidor autorizado.' : ''}`
          : 'Existe la oferta, pero aún no la verificamos con fuente. Confirma disponibilidad y origen con la tienda antes de comprar.',
    });
  }
  items.push({
    pregunta: `¿${d.nombre} envía a todo México?`,
    respuesta: d.envio_nacional
      ? `Sí, envía a todo el país${d.paqueterias.length ? ` con ${d.paqueterias.join(', ')}` : ''}${d.envio_gratis_desde ? `, con envío gratis desde $${d.envio_gratis_desde.toLocaleString('es-MX')} MXN` : ''}.`
      : 'No tenemos confirmado envío nacional. Consulta directamente con la tienda.',
  });
  if (d.maneja_preventa) {
    items.push({
      pregunta: `¿${d.nombre} maneja preventas?`,
      // Con política declarada se publica la de la tienda; sin ella, la
      // advertencia genérica. Nunca se atribuye una política que no dijeron.
      respuesta: d.politica_preventa
        ?? 'Sí. Antes de dar un anticipo, pregunta el plazo estimado de llegada y la política si el kit no llega: es la duda más frecuente en este mercado.',
    });
  }
  if (ciudad) {
    items.push({
      pregunta: `¿Dónde está ${d.nombre}?`,
      respuesta: d.sucursales.length === 1
        ? `En ${[d.sucursales[0].calle, d.sucursales[0].colonia, ciudad].filter(Boolean).join(', ')}.`
        : `Tiene ${d.sucursales.length} sucursales, en ${listaEs([...new Set(d.sucursales.map((s) => s.ciudad))])}.`,
    });
  }
  // La FAQ propia de la ficha va primero: es la que aporta algo que las
  // demás fichas no dicen. Las derivadas de datos van después.
  return [...d.faq, ...items];
}

/**
 * Sólo se emite `FAQPage` cuando la ficha aporta al menos una pregunta
 * propia. Un FAQPage compuesto sólo de preguntas derivadas sale
 * prácticamente idéntico en todas las fichas, y eso es exactamente el
 * patrón que Google trata como contenido generado sin valor añadido.
 */
export function tieneFaqPropia(t: Tienda): boolean {
  return t.data.faq.length > 0;
}

/* ------------------------------------------------------------------ */
/* Índice del directorio                                               */
/* ------------------------------------------------------------------ */
/**
 * Índices precalculados del censo. Existen para que `relacionadasDe()` no
 * recorra la colección entera por cada ficha dentro de `getStaticPaths`:
 * con 12 fichas da igual, con 300 el build se vuelve cuadrático.
 */
export type IndiceTiendas = {
  todas: Tienda[];
  porId: Map<string, Tienda>;
  porCiudad: Map<string, Tienda[]>;
  porCategoria: Map<CategoriaId, Tienda[]>;
};

let cacheIndice: Promise<IndiceTiendas> | null = null;
export function indiceTiendas(): Promise<IndiceTiendas> {
  cacheIndice ??= tiendasActivas().then((todas) => {
    const porId = new Map<string, Tienda>();
    const porCiudad = new Map<string, Tienda[]>();
    const porCategoria = new Map<CategoriaId, Tienda[]>();
    for (const t of todas) {
      porId.set(t.id, t);
      for (const c of ciudadesDe(t)) {
        if (!porCiudad.has(c.slug)) porCiudad.set(c.slug, []);
        porCiudad.get(c.slug)!.push(t);
      }
      const cat = t.data.categoria as CategoriaId;
      if (!porCategoria.has(cat)) porCategoria.set(cat, []);
      porCategoria.get(cat)!.push(t);
    }
    return { todas, porId, porCiudad, porCategoria };
  });
  return cacheIndice;
}

/**
 * Relacionadas: las declaradas en la ficha; si no hay, misma ciudad; si no,
 * misma categoría. Resuelve contra el índice, sin recorrer la colección.
 */
export async function relacionadasDe(t: Tienda, max = 3, indice?: IndiceTiendas): Promise<Tienda[]> {
  const ix = indice ?? (await indiceTiendas());
  const otras = (lista: Tienda[] | undefined) => (lista ?? []).filter((o) => o.id !== t.id);

  const declaradas = t.data.relacionadas
    .map((id) => ix.porId.get(id))
    .filter((o): o is Tienda => Boolean(o) && o!.id !== t.id);
  if (declaradas.length) return declaradas.slice(0, max);

  const vistas = new Set<string>();
  const mismaCiudad: Tienda[] = [];
  for (const c of ciudadesDe(t)) {
    for (const o of otras(ix.porCiudad.get(c.slug))) {
      if (!vistas.has(o.id)) { vistas.add(o.id); mismaCiudad.push(o); }
    }
  }
  if (mismaCiudad.length) return mismaCiudad.slice(0, max);

  return otras(ix.porCategoria.get(t.data.categoria as CategoriaId)).slice(0, max);
}
