/**
 * check-directorio-dist.mjs — reglas que sólo se pueden comprobar sobre el HTML compilado.
 *
 * Corre DESPUÉS de `astro build` y ANTES de Pagefind. Valida enlaces internos,
 * orfandad editorial, longitudes reales de <title> y meta description, unicidad
 * del <h1> y coherencia entre `noindex` y el sitemap.
 *
 * Modo por defecto: ADVERTENCIA (exit 0). Con --strict, los errores rompen el build.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Calibración contra el censo del 2026-09-08: 12 fichas, 10 huérfanas, 60 páginas de directorio, 17 indexables. */
export const FIXTURE_BASE = { paginasDirectorio: 60, indexables: 17, fichas: 12, huerfanas: 10 };

export const UMBRALES = {
  TITULO_MAX: 60,
  DESC_MIN: 140,
  DESC_MAX: 165,
  DESC_ERROR: 180,
};

/**
 * DEFINICIÓN REPRODUCIBLE DE "FICHA HUÉRFANA" (objeción 16 de Codex).
 * Una ficha /tienda/<id>/ está huérfana si NO recibe ningún enlace desde una
 * página editorial. Los listados del propio directorio y los bloques de
 * "relacionadas" NO cuentan: son navegación, no señal editorial.
 */
const PREFIJOS_EDITORIALES = [
  '/articulos/', '/noticias/', '/kit/', '/series/', '/mobile-suits/',
  '/universos/', '/personajes/', '/facciones/', '/gunpla/', '/cronologia/',
];
/**
 * Sólo cuentan las páginas EDITORIALES PROFUNDAS (dos o más segmentos): un
 * artículo, una nota, una ficha de kit o de serie. Los hubs de sección
 * (/gunpla/, /kits/, /articulos/, la portada) enlazan fichas por navegación,
 * no por decisión editorial, así que no sacan a nadie de la orfandad.
 */
const esEditorial = (url) =>
  PREFIJOS_EDITORIALES.some((p) => url.startsWith(p)) &&
  url.split('/').filter(Boolean).length >= 2;

const DIST = 'dist';
const errores = [];
const avisos = [];
const err = (u, m) => errores.push(`${u}: ${m}`);
const avi = (u, m) => avisos.push(`${u}: ${m}`);

/* -------- inventario de páginas -------- */
function paginas(dir = DIST, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) paginas(p, acc);
    else if (e === 'index.html') acc.push(p);
  }
  return acc;
}
const archivos = paginas();
if (!archivos.length) { console.error('dist/ vacío: corre `astro build` primero.'); process.exit(1); }

const urlDe = (f) => `/${relative(DIST, f).replace(/index\.html$/, '')}`.replace(/\/+/g, '/');
const limpiar = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
  .replace(/&[a-z]+;/g, ' ').trim();

const docs = archivos.map((f) => {
  const html = readFileSync(f, 'utf8');
  return {
    url: urlDe(f),
    redireccion: /http-equiv="refresh"/i.test(html),
    titulo: limpiar((html.match(/<title>([\s\S]*?)<\/title>/) ?? [, ''])[1]),
    desc: limpiar((html.match(/<meta name="description" content="([\s\S]*?)"/) ?? [, ''])[1]),
    h1: (html.match(/<h1[\s>]/g) ?? []).length,
    noindex: /name="robots"\s+content="noindex/.test(html),
    hrefs: [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]),
  };
});
const existentes = new Set(docs.map((d) => d.url));

/* -------- sitemap -------- */
const sitemapPath = join(DIST, 'sitemap-0.xml');
const sitemap = existsSync(sitemapPath)
  ? new Set([...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => { try { return new URL(m[1]).pathname; } catch { return m[1]; } }))
  : null;
if (!sitemap) avisos.push('sitemap-0.xml no encontrado: se omiten las comprobaciones de sitemap');

/* -------- 1. enlaces internos rotos -------- */
const entrantes = new Map();
for (const d of docs) {
  for (const href of d.hrefs) {
    if (/^(https?:|mailto:|tel:|#|javascript:|data:)/.test(href)) continue;
    const limpio = href.split('#')[0].split('?')[0];
    if (!limpio.startsWith('/')) continue;
    const destino = limpio.endsWith('/') ? limpio : `${limpio}/`;
    if (/\/[^/]*\.[a-z0-9]{2,6}$/i.test(limpio)) { // asset (tiene extensión en el último segmento)
      if (!existsSync(join(DIST, limpio))) err(d.url, `asset inexistente: ${limpio}`);
      continue;
    }
    if (!existentes.has(destino)) { err(d.url, `enlace interno roto: ${limpio}`); continue; }
    if (!entrantes.has(destino)) entrantes.set(destino, new Set());
    entrantes.get(destino).add(d.url);
  }
}

/* -------- 2. fichas huérfanas -------- */
const fichas = docs.filter((d) => d.url.startsWith('/tienda/'));
const huerfanas = [];
for (const f of fichas) {
  const desde = [...(entrantes.get(f.url) ?? [])].filter(esEditorial);
  if (desde.length === 0) { huerfanas.push(f.url); avi(f.url, 'ficha huérfana: 0 enlaces editoriales entrantes'); }
  else if (desde.length < 3) avi(f.url, `sólo ${desde.length} enlace(s) editorial(es) entrante(s): ${desde.join(', ')}`);
}

/* -------- 3. títulos, descripciones, h1 -------- */
for (const d of docs) {
  if (d.redireccion) continue;   // páginas de redirección de Astro: sin h1 ni meta, a propósito
  if (d.h1 !== 1) err(d.url, `${d.h1} etiquetas <h1> (debe haber exactamente 1)`);
  if (!d.titulo) err(d.url, 'sin <title>');
  else if (d.titulo.length > UMBRALES.TITULO_MAX) avi(d.url, `<title> de ${d.titulo.length} caracteres (máx ${UMBRALES.TITULO_MAX})`);
  if (!d.desc) err(d.url, 'sin meta description');
  else if (d.desc.length > UMBRALES.DESC_ERROR) err(d.url, `meta description de ${d.desc.length} caracteres`);
  else if (d.desc.length > UMBRALES.DESC_MAX || d.desc.length < UMBRALES.DESC_MIN) avi(d.url, `meta description de ${d.desc.length} caracteres (banda ${UMBRALES.DESC_MIN}-${UMBRALES.DESC_MAX})`);
}

/* -------- 4. metas duplicadas entre páginas indexables -------- */
const porDesc = new Map();
for (const d of docs) {
  if (d.noindex || d.redireccion || !d.desc) continue;
  if (!porDesc.has(d.desc)) porDesc.set(d.desc, []);
  porDesc.get(d.desc).push(d.url);
}
for (const [, urls] of porDesc) if (urls.length > 1) err(urls[0], `meta description idéntica a: ${urls.slice(1).join(', ')}`);

/* -------- 5. coherencia noindex ↔ sitemap -------- */
if (sitemap) {
  for (const d of docs) {
    if (d.noindex && sitemap.has(d.url)) err(d.url, 'está en el sitemap pese a llevar noindex');
    if (!d.noindex && !d.redireccion && !sitemap.has(d.url) && d.url !== '/404/') avi(d.url, 'indexable pero ausente del sitemap');
  }
  for (const u of sitemap) if (!existentes.has(u)) err(u, 'en el sitemap pero sin HTML compilado');
}

/* -------- reporte -------- */
const dir = docs.filter((d) => d.url.startsWith('/tienda') || d.url.startsWith('/tiendas'));
const estricto = process.argv.includes('--strict');
console.log(`\n── check:directorio:dist ──`);
console.log(`  ${docs.length} páginas compiladas · ${dir.length} del directorio · ${dir.filter((d) => !d.noindex).length} indexables`);
console.log(`  ${fichas.length} fichas de tienda · ${huerfanas.length} huérfanas`);
if (errores.length) { console.log(`\nERRORES (${errores.length})`); errores.forEach((e) => console.log(`  ✗ ${e}`)); }
if (avisos.length) { console.log(`\nAVISOS (${avisos.length})`); avisos.forEach((a) => console.log(`  · ${a}`)); }
console.log(`\nResumen: ${errores.length} errores, ${avisos.length} avisos${estricto ? '' : '  (modo advertencia: no rompe el build)'}\n`);
process.exit(estricto && errores.length ? 1 : 0);
