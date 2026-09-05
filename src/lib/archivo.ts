import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { UNIVERSOS_META, type UniversoId } from '@config/site';

export type Serie = CollectionEntry<'series'>;
export type MobileSuit = CollectionEntry<'mobile-suits'>;
export type Piloto = CollectionEntry<'pilots'>;
export type Faccion = CollectionEntry<'factions'>;
export type Universo = CollectionEntry<'universes'>;
export type Articulo = CollectionEntry<'articles'>;

export const nombreUniverso = (id: UniversoId) => UNIVERSOS_META[id].nombre;
export const cortoUniverso = (id: UniversoId) => UNIVERSOS_META[id].corto;

/** Filtro de colección: excluye entradas con estado_editorial 'borrador'. */
export const publicado = ({ data }: { data: { estado_editorial?: string } }) => data.estado_editorial !== 'borrador';

export const FORMATO: Record<string, string> = { tv: 'Serie de TV', ova: 'OVA', pelicula: 'Película', ona: 'Serie web' };

export async function universosConContenido() {
  const [universos, series] = await Promise.all([getCollection('universes', publicado), getCollection('series', publicado)]);
  return universos
    .map((u) => ({ ...u, totalSeries: series.filter((s) => s.data.universo === u.data.abreviatura).length }))
    .filter((u) => u.totalSeries > 0)
    .sort((a, b) => a.data.orden - b.data.orden);
}

export async function seriesOrdenRecomendado() {
  const series = await getCollection('series', publicado);
  return series.filter((s) => s.data.orden_recomendado).sort((a, b) => a.data.orden_recomendado! - b.data.orden_recomendado!);
}

export async function seriesCronologiaUC() {
  const series = await getCollection('series', publicado);
  return series
    .filter((s) => s.data.universo === 'uc' && s.data.orden_cronologico)
    .sort((a, b) => a.data.orden_cronologico! - b.data.orden_cronologico!);
}

export async function seriesPorRuta(ruta: 'empieza-aqui' | 'profundiza' | 'alternativa') {
  const series = await getCollection('series', publicado);
  return series.filter((s) => s.data.ruta === ruta).sort((a, b) => (a.data.orden_recomendado ?? 99) - (b.data.orden_recomendado ?? 99));
}

export async function seriesDeUniverso(u: UniversoId) {
  const series = await getCollection('series', publicado);
  return series.filter((s) => s.data.universo === u).sort((a, b) => a.data.anio - b.data.anio);
}

/** Resuelve ids a nombres para mostrar sin repetir consultas en plantillas. */
export async function nombres() {
  const [series, ms, pilotos, facciones] = await Promise.all([
    getCollection('series', publicado), getCollection('mobile-suits'), getCollection('pilots'), getCollection('factions', publicado),
  ]);
  const mapa = (xs: { id: string; data: { nombre?: string; titulo?: string } }[]) =>
    Object.fromEntries(xs.map((x) => [x.id, x.data.nombre ?? x.data.titulo ?? x.id]));
  return { series: mapa(series), ms: mapa(ms), pilotos: mapa(pilotos), facciones: mapa(facciones) };
}

export async function entradasPorIds<C extends 'series' | 'mobile-suits' | 'pilots' | 'factions'>(coleccion: C, ids: string[]) {
  const res = await Promise.all(ids.map((id) => getEntry(coleccion, id)));
  res.forEach((e, i) => {
    if (!e) throw new Error(`[archivo] id inexistente en ${coleccion}: "${ids[i]}"`);
  });
  return res as CollectionEntry<C>[];
}

export const lecturaMin = (texto: string) => Math.max(1, Math.round(texto.split(/\s+/).length / 200));
