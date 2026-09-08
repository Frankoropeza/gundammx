/**
 * check-directorio.mjs — reglas de negocio del directorio, sobre el frontmatter crudo.
 *
 * ALCANCE Y LIMITACIÓN DECLARADA (F0 del plan, objeción 17 de Codex):
 * este script NO re-implementa el esquema Zod ni los `default` de Astro. Lee el
 * Markdown tal cual está escrito, así que valida lo que el autor ESCRIBIÓ, no lo
 * que Astro deja tras aplicar defaults y coerciones. Es una auditoría editorial
 * aproximada, complementaria a `astro check`, nunca sustituta.
 *
 * Modo por defecto: ADVERTENCIA (exit 0 siempre). Con --strict, los errores
 * devuelven exit 1 y rompen el build.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';

/* ---------------------------------------------------------------- */
/* Umbrales. Único lugar donde se tocan.                             */
/* ---------------------------------------------------------------- */
export const UMBRALES = {
  MESES_CADUCIDAD_VERIFICADA: 6,   // núcleo: ficha verificada
  MESES_CADUCIDAD_RESTO: 3,        // periferia: sin_verificar / reportada
  MIN_PALABRAS_CUERPO: 150,
  MAX_DESCRIPCION_CORTA: 160,
  MIN_DESCRIPCION_CORTA: 60,
  SIMILITUD_MAX: 0.6,              // Jaccard de trigramas de palabras
};

/** Recuento esperado al calibrar contra el censo del 2026-09-08 (12 fichas). */
export const FIXTURE_BASE = {
  fichas: 12,
  cuerpoCorto: 12,        // ninguna llega a 150 palabras
  sinFaqPropia: 12,
  sinRedes: 12,
};

const DIR = 'src/content/tiendas';
const errores = [];
const avisos = [];
const err = (f, m) => errores.push(`${f}: ${m}`);
const avi = (f, m) => avisos.push(`${f}: ${m}`);

/* Slugs de estado leídos de la fuente única, sin duplicar la lista. */
const ESTADOS = [...readFileSync('src/lib/estados.ts', 'utf8')
  .matchAll(/slug:\s*'([a-z-]+)'/g)].map((m) => m[1]);

/* Claves de primer nivel que el esquema acepta. Aproximación de `.strict()`. */
const CLAVES = new Set([
  'nombre', 'descripcion_corta', 'imagen', 'imagen_alt', 'imagen_credito', 'galeria',
  'zonas_cobertura', 'especialidades', 'rango_precio', 'faq', 'relacionadas', 'seo', 'autor',
  'tipo', 'categoria', 'anio_fundacion', 'sucursales', 'web', 'email', 'redes', 'marketplaces',
  'vende_gunpla', 'origen_producto', 'grados', 'profundidad_catalogo', 'maneja_preventa',
  'maneja_pbandai', 'otras_lineas', 'vende_herramientas', 'vende_pinturas', 'marcas_pintura',
  'servicios', 'envio_nacional', 'paqueterias', 'envio_gratis_desde', 'pickup', 'pagos', 'msi',
  'verificacion', 'destacada', 'plan', 'reclamada_por_dueno', 'actualizada',
  'esquema_version', 'alta', 'politica_preventa',
]);

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const hoy = new Date();
const mesesDesde = (iso) => (hoy - new Date(`${iso}T12:00:00Z`)) / (1000 * 60 * 60 * 24 * 30.44);

/** Trigramas de palabras, para detectar frases reutilizadas entre fichas. */
function trigramas(texto) {
  const p = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9áéíóúñ ]/gi, ' ').split(/\s+/).filter(Boolean);
  return new Set(p.slice(0, -2).map((_, i) => p.slice(i, i + 3).join(' ')));
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

/* ---------------------------------------------------------------- */
const fichas = [];
for (const archivo of readdirSync(DIR).filter((f) => f.endsWith('.md')).sort()) {
  const bruto = readFileSync(join(DIR, archivo), 'utf8');
  const m = bruto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) { err(archivo, 'no se pudo separar el frontmatter'); continue; }
  let d;
  try { d = parseYaml(m[1]); } catch (e) { err(archivo, `YAML inválido: ${e.message}`); continue; }
  fichas.push({ archivo, d, cuerpo: m[2].trim() });
}

for (const { archivo, d, cuerpo } of fichas) {
  /* 1. Claves desconocidas — aproximación de .strict() */
  for (const k of Object.keys(d)) if (!CLAVES.has(k)) avi(archivo, `clave desconocida en frontmatter: "${k}"`);

  /* 2. Fechas */
  const v = d.verificacion ?? {};
  if (!ISO.test(String(v.fecha ?? ''))) err(archivo, `verificacion.fecha no es ISO YYYY-MM-DD: "${v.fecha}"`);
  else {
    const meses = mesesDesde(v.fecha);
    if (meses < 0) err(archivo, `verificacion.fecha está en el futuro: ${v.fecha}`);
    const tope = v.estado === 'verificada' ? UMBRALES.MESES_CADUCIDAD_VERIFICADA : UMBRALES.MESES_CADUCIDAD_RESTO;
    if (meses > tope) avi(archivo, `verificación caducada: ${meses.toFixed(1)} meses (tope ${tope})`);
  }
  if (!ISO.test(String(d.actualizada ?? ''))) err(archivo, `actualizada no es ISO: "${d.actualizada}"`);
  else if (ISO.test(String(v.fecha ?? '')) && d.actualizada < v.fecha) err(archivo, 'actualizada es anterior a verificacion.fecha');
  if (d.alta !== undefined && !ISO.test(String(d.alta))) err(archivo, `alta no es ISO: "${d.alta}"`);

  /* 3. Fuentes */
  if (!Array.isArray(v.fuentes) || v.fuentes.length === 0) err(archivo, 'verificacion.fuentes vacío: ninguna ficha se publica sin fuente');

  /* 4. Sucursales y geografía */
  const suc = d.sucursales ?? [];
  for (const [i, s] of suc.entries()) {
    if (!ESTADOS.includes(s.estado)) err(archivo, `sucursal ${i}: estado "${s.estado}" no está en los 32 slugs`);
    const tieneLat = s.lat !== undefined, tieneLng = s.lng !== undefined;
    if (tieneLat !== tieneLng) err(archivo, `sucursal ${i}: lat y lng deben ir juntos o no ir`);
  }
  const online = d.tipo === 'online' || d.tipo === 'marketplace';
  if (online && suc.length) err(archivo, `tipo "${d.tipo}" no debería declarar sucursales`);
  if (!online && suc.length === 0) err(archivo, `tipo "${d.tipo}" exige al menos una sucursal`);

  /* 5. Descripción corta */
  const dc = String(d.descripcion_corta ?? '');
  if (dc.length > UMBRALES.MAX_DESCRIPCION_CORTA) err(archivo, `descripcion_corta de ${dc.length} caracteres (máx ${UMBRALES.MAX_DESCRIPCION_CORTA})`);
  else if (dc.length < UMBRALES.MIN_DESCRIPCION_CORTA) avi(archivo, `descripcion_corta de sólo ${dc.length} caracteres`);

  /* 6. Cuerpo editorial */
  const palabras = cuerpo.split(/\s+/).filter(Boolean).length;
  if (palabras < UMBRALES.MIN_PALABRAS_CUERPO) avi(archivo, `cuerpo de ${palabras} palabras (mínimo ${UMBRALES.MIN_PALABRAS_CUERPO})`);

  /* 7. FAQ propia y contacto */
  if (!Array.isArray(d.faq) || d.faq.length === 0) avi(archivo, 'sin FAQ propia: el FAQPage sale idéntico al de las demás fichas');
  const redes = Object.values(d.redes ?? {}).filter(Boolean).length;
  if (!d.web && redes === 0) err(archivo, 'sin web ni ninguna red social: la ficha no tiene canal de contacto');
  if (redes === 0) avi(archivo, 'sin redes sociales declaradas: sameAs queda incompleto');

  /* 8. Preventa sin política redactada */
  if (d.maneja_preventa && !d.politica_preventa) avi(archivo, 'maneja_preventa sin politica_preventa: la FAQ saldrá con la respuesta genérica');
}

/* 9. Duplicados y casi-duplicados entre fichas */
for (const campo of ['descripcion_corta', 'cuerpo']) {
  const textos = fichas.map((f) => ({ archivo: f.archivo, t: campo === 'cuerpo' ? f.cuerpo : String(f.d.descripcion_corta ?? '') }));
  const tri = textos.map((x) => ({ ...x, g: trigramas(x.t) }));
  for (let i = 0; i < tri.length; i++) {
    for (let j = i + 1; j < tri.length; j++) {
      if (tri[i].t && tri[i].t === tri[j].t) { err(tri[i].archivo, `${campo} idéntico al de ${tri[j].archivo}`); continue; }
      const s = jaccard(tri[i].g, tri[j].g);
      if (s > UMBRALES.SIMILITUD_MAX) avi(tri[i].archivo, `${campo} ${(s * 100).toFixed(0)}% similar al de ${tri[j].archivo}`);
    }
  }
}

/* ---------------------------------------------------------------- */
const estricto = process.argv.includes('--strict');
console.log(`\n── check:directorio — ${fichas.length} fichas ──`);
if (errores.length) { console.log(`\nERRORES (${errores.length})`); errores.forEach((e) => console.log(`  ✗ ${e}`)); }
if (avisos.length) { console.log(`\nAVISOS (${avisos.length})`); avisos.forEach((a) => console.log(`  · ${a}`)); }
if (!errores.length && !avisos.length) console.log('  Sin hallazgos.');
console.log(`\nResumen: ${errores.length} errores, ${avisos.length} avisos${estricto ? '' : '  (modo advertencia: no rompe el build)'}\n`);
process.exit(estricto && errores.length ? 1 : 0);
