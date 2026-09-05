import { getCollection, type CollectionEntry } from 'astro:content';
import { slugificar } from '@lib/estados';
import { fechaLarga } from '@lib/precio';

export type Tienda = CollectionEntry<'tiendas'>;

/** Tiendas publicables: excluye las cerradas del listado general. */
export async function tiendasActivas(): Promise<Tienda[]> {
  const todas = await getCollection('tiendas');
  return todas
    .filter((t) => t.data.verificacion.estado !== 'cerrada')
    .sort(ordenarTiendas);
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

export async function tiendasVerificadas() {
  const tiendas = await tiendasActivas();
  return tiendas.filter((t) => t.data.verificacion.estado === 'verificada');
}

/**
 * Ciudades con página propia: solo las que llegan al umbral.
 * Una página de ciudad vacía es deuda de indexación (vault: 02 §2.2).
 */
export const UMBRAL_CIUDAD = 2;

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

export async function tiendasPorCategoria(slug: CategoriaId) {
  const tiendas = await tiendasActivas();
  return tiendas.filter((t) => t.data.categoria === slug);
}

/* ------------------------------------------------------------------ */
/* FAQ derivada de datos reales de la ficha (nunca inventada)          */
/* ------------------------------------------------------------------ */
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
      respuesta: 'Sí. Antes de dar un anticipo, pregunta el plazo estimado de llegada y la política si el kit no llega: es la duda más frecuente en este mercado.',
    });
  }
  if (ciudad) {
    items.push({
      pregunta: `¿Dónde está ${d.nombre}?`,
      respuesta: d.sucursales.length === 1
        ? `En ${[d.sucursales[0].calle, d.sucursales[0].colonia, ciudad].filter(Boolean).join(', ')}.`
        : `Tiene ${d.sucursales.length} sucursales: ${[...new Set(d.sucursales.map((s) => s.ciudad))].join(', ')}.`,
    });
  }
  // FAQ editorial de la ficha, si existe, al final
  return [...items, ...d.faq];
}

/** Relacionadas: las declaradas en la ficha; si no hay, misma ciudad; si no, misma categoría. */
export async function relacionadasDe(t: Tienda, max = 3): Promise<Tienda[]> {
  const todas = (await tiendasActivas()).filter((o) => o.id !== t.id);
  const declaradas = t.data.relacionadas.map((id) => todas.find((o) => o.id === id)).filter(Boolean) as Tienda[];
  if (declaradas.length) return declaradas.slice(0, max);
  const misCiudades = ciudadesDe(t).map((c) => c.slug);
  const mismaCiudad = todas.filter((o) => ciudadesDe(o).some((c) => misCiudades.includes(c.slug)));
  if (mismaCiudad.length) return mismaCiudad.slice(0, max);
  return todas.filter((o) => o.data.categoria === t.data.categoria).slice(0, max);
}
