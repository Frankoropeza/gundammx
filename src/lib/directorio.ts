import { getCollection, type CollectionEntry } from 'astro:content';
import { slugificar } from '@lib/estados';

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
