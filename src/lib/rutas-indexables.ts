import { publicado } from '@lib/archivo';
import { categoriasAbiertas, urlCategoria } from '@lib/categorias';
import { getCollection } from 'astro:content';
import {
  tiendasActivas, ciudadesConPagina, estadosConTiendas, categoriasConPagina,
  tiendasEnLinea, tiendasVerificadas, facetaAporta, indexable, UMBRAL_ESTADO,
} from '@lib/directorio';
import { GRADOS, type GradoId } from '@config/site';
import { POR_PAGINA, urlPagina } from '@lib/paginacion';

/**
 * Única fuente de verdad del sitemap. Aplica exactamente las mismas reglas
 * de `noindex` que las páginas, para que el sitemap nunca liste lo que
 * la página pide no indexar. Si añades una ruta indexable, regístrala aquí.
 */
export async function rutasIndexables(): Promise<{ url: string; lastmod?: string }[]> {
  const rutas: { url: string; lastmod?: string }[] = [];
  const add = (url: string, lastmod?: string) => rutas.push({ url, lastmod });

  // Fijas
  ['/', '/universos/', '/series/', '/mobile-suits/', '/personajes/', '/gunpla/', '/cronologia/', '/articulos/',
   '/tiendas/', '/kits/', '/noticias/',
   '/eventos/', '/servicios/', '/comunidad/', '/metodologia/', '/aviso-legal/', '/creditos/', '/alta-de-tienda/', '/reportar/']
    .forEach((u) => add(u));

  // Facetas curadas: entran al sitemap sólo si aportan un conjunto propio.
  // Misma guardia que aplica el `noindex` de la página, para que sitemap y
  // etiqueta nunca digan cosas distintas.
  if (await facetaAporta(await tiendasEnLinea())) add('/tiendas/en-linea/');
  if (await facetaAporta(await tiendasVerificadas())) add('/tiendas/verificadas/');

  // Archivo editorial
  (await getCollection('universes', publicado)).forEach((u) => add(`/universos/${u.id}/`, u.data.actualizado));
  (await getCollection('series', publicado)).forEach((s) => add(`/series/${s.id}/`, s.data.actualizado));
  (await getCollection('mobile-suits', publicado)).forEach((m) => add(`/mobile-suits/${m.id}/`, m.data.actualizado));
  (await getCollection('pilots', publicado)).forEach((p) => add(`/personajes/${p.id}/`, p.data.actualizado));
  (await getCollection('factions', publicado)).forEach((f) => add(`/facciones/${f.id}/`, f.data.actualizado));
  (await getCollection('gunpla', publicado)).forEach((g) => add(`/gunpla/${g.id}/`, g.data.actualizado));
  (await getCollection('articles', ({ data }) => !data.borrador)).forEach((a) => add(`/articulos/${a.id}/`, a.data.fecha.toISOString()));
  (await categoriasAbiertas()).forEach((c) => add(urlCategoria(c.id)));

  // Tiendas
  const tiendas = await tiendasActivas();
  tiendas.forEach((t) => add(`/tienda/${t.id}/`, t.data.actualizada));

  // Ciudades sobre el umbral
  (await ciudadesConPagina()).filter((c) => indexable(c.total)).forEach((c) => add(`/tiendas/ciudad/${c.slug}/`));

  // Estados sobre el umbral (misma regla que la página)
  const porEstado = await estadosConTiendas();
  [...porEstado.entries()].filter(([, total]) => total >= UMBRAL_ESTADO).forEach(([slug]) => add(`/tiendas/${slug}/`));

  // Categorías sobre el umbral (misma regla que la página)
  (await categoriasConPagina()).forEach((c) => add(`/tiendas/categoria/${c.slug}/`));

  // Kits y grados con kits
  const kits = await getCollection('kits');
  kits.forEach((k) => add(`/kit/${k.id}/`));
  (Object.keys(GRADOS) as GradoId[]).filter((g) => kits.some((k) => k.data.grado === g)).forEach((g) => add(`/kits/${g}/`));

  // Editorial
  const noticias = await getCollection('noticias', ({ data }) => !data.borrador);
  noticias.forEach((n) => add(`/noticias/${n.id}/`, n.data.fecha.toISOString()));
  const totalPaginas = Math.ceil(noticias.length / POR_PAGINA);
  for (let n = 2; n <= totalPaginas; n++) add(urlPagina(n));

  return rutas;
}
