import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIAS, type CategoriaId } from '@config/categorias';

export type CategoriaAbierta = {
  id: CategoriaId;
  meta: (typeof CATEGORIAS)[CategoriaId];
  piezas: CollectionEntry<'articles'>[];
};

/**
 * Devuelve solo las categorías que alcanzaron su mínimo de apertura.
 * Una categoría por debajo del umbral NO genera ruta y NO entra al sitemap:
 * nunca existió, así que tampoco produce un 404 de algo que estuvo publicado.
 */
export async function categoriasAbiertas(): Promise<CategoriaAbierta[]> {
  const articulos = await getCollection('articles', ({ data }) => !data.borrador);
  return (Object.keys(CATEGORIAS) as CategoriaId[])
    .map((id) => ({
      id,
      meta: CATEGORIAS[id],
      piezas: articulos
        .filter((a) => a.data.categoria === id)
        .sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime()),
    }))
    .filter((c) => c.piezas.length >= c.meta.minimo)
    .sort((a, b) => a.meta.orden - b.meta.orden);
}

/** URL canónica del hub de una categoría. Convención igual a /tiendas/categoria/. */
export const urlCategoria = (id: CategoriaId) => `/articulos/categoria/${id}/`;
