import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const paginasConCabeceraEditorial = [
  '../pages/universos/index.astro',
  '../pages/series/index.astro',
  '../pages/mobile-suits/index.astro',
  '../pages/personajes/index.astro',
  '../pages/gunpla/index.astro',
  '../pages/kits/index.astro',
  '../pages/articulos/index.astro',
  '../pages/noticias/index.astro',
  '../pages/tiendas/index.astro',
  '../pages/eventos/index.astro',
  '../pages/comunidad/index.astro',
  '../pages/servicios/index.astro',
  '../pages/cronologia.astro',
  '../pages/lanzamientos.astro',
  '../pages/buscar.astro',
  '../pages/alta-de-tienda.astro',
  '../pages/reportar.astro',
  '../pages/metodologia.astro',
  '../pages/creditos.astro',
  '../pages/aviso-legal.astro',
  '../pages/tiendas/verificadas.astro',
  '../pages/tiendas/en-linea.astro',
  '../pages/articulos/categoria/[categoria].astro',
  '../pages/noticias/pagina/[pagina].astro',
  '../pages/tiendas/[estado].astro',
  '../pages/tiendas/ciudad/[ciudad].astro',
  '../pages/tiendas/categoria/[categoria].astro',
  '../pages/kits/[grado].astro',
];

test('las paginas internas usan la cabecera editorial compartida del inicio', async () => {
  for (const ruta of paginasConCabeceraEditorial) {
    const contenido = await readFile(new URL(ruta, import.meta.url), 'utf8');
    assert.match(contenido, /import PageHeader from '@components\/PageHeader\.astro';/, ruta);
    assert.match(contenido, /<PageHeader\b/, ruta);
  }
});

const plantillasDeDetalle = [
  '../layouts/ArticleLayout.astro',
  '../components/ArticleEditorialHero.astro',
  '../pages/universos/[id].astro',
  '../pages/series/[id].astro',
  '../pages/mobile-suits/[id].astro',
  '../pages/personajes/[id].astro',
  '../pages/facciones/[id].astro',
  '../pages/gunpla/[id].astro',
  '../pages/kit/[id].astro',
  '../pages/tienda/[id].astro',
  '../pages/articulos/[id].astro',
];

test('las fichas y articulos comparten el ritmo vertical editorial', async () => {
  for (const ruta of plantillasDeDetalle) {
    const contenido = await readFile(new URL(ruta, import.meta.url), 'utf8');
    assert.match(contenido, /py-12/, ruta);
  }
});

const hubsConImagen = [
  '../pages/universos/index.astro',
  '../pages/series/index.astro',
  '../pages/mobile-suits/index.astro',
  '../pages/personajes/index.astro',
  '../pages/gunpla/index.astro',
  '../pages/kits/index.astro',
  '../pages/articulos/index.astro',
  '../pages/noticias/index.astro',
  '../pages/tiendas/index.astro',
  '../pages/eventos/index.astro',
  '../pages/comunidad/index.astro',
];

test('la jerarquia editorial aparece antes de la imagen en los hubs', async () => {
  for (const ruta of hubsConImagen) {
    const contenido = await readFile(new URL(ruta, import.meta.url), 'utf8');
    assert.ok(contenido.indexOf('<PageHeader') < contenido.indexOf('<HubImagen'), ruta);
  }
});
