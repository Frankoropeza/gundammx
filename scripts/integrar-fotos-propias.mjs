#!/usr/bin/env node
import { readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const raiz = process.cwd();
const mapa = JSON.parse(await readFile(path.join(raiz, 'scripts/fotos-propias.mapa.json'), 'utf8'));
const args = process.argv.slice(2);
const aplicar = args.includes('--aplicar');
const indiceKit = args.indexOf('--kit');
const kitSolicitado = indiceKit === -1 ? undefined : args[indiceKit + 1];

if (
  args.some((arg) => !['--dry-run', '--aplicar', '--kit', kitSolicitado].includes(arg))
  || (indiceKit !== -1 && !kitSolicitado)
  || (args.includes('--dry-run') && aplicar)
) {
  console.error('Uso: node scripts/integrar-fotos-propias.mjs [--dry-run] [--aplicar] [--kit <slug>]');
  process.exit(1);
}
if (kitSolicitado && !mapa[kitSolicitado]) {
  console.error(`Kit desconocido: ${kitSolicitado}`);
  process.exit(1);
}

const kits = kitSolicitado ? [[kitSolicitado, mapa[kitSolicitado]]] : Object.entries(mapa);
const extensionesPrincipal = ['jpg', 'jpeg', 'png', 'heic'];
const extensionesVertical = ['jpg', 'jpeg', 'png'];
const resultados = [];
const cambios = [];

async function archivoDeFoto(directorio, base, extensiones) {
  const encontrados = [];
  for (const extension of extensiones) {
    const archivo = path.join(directorio, `${base}.${extension}`);
    try {
      if ((await stat(archivo)).isFile()) encontrados.push(archivo);
    } catch {}
  }
  return encontrados;
}

async function listarMarkdown(directorio) {
  const entradas = await readdir(directorio, { withFileTypes: true });
  const archivos = await Promise.all(entradas.map(async (entrada) => {
    const completo = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) return listarMarkdown(completo);
    return entrada.isFile() && entrada.name.endsWith('.md') ? [completo] : [];
  }));
  return archivos.flat();
}

function reemplazarCampo(contenido, campo, valor) {
  const patron = new RegExp(`^${campo}:.*$`, 'm');
  if (!patron.test(contenido)) throw new Error(`Falta el campo ${campo} en el frontmatter`);
  return contenido.replace(patron, `${campo}: ${valor}`);
}

function entradaCredito(id, nombre, alt) {
  return `  '${id}': {\n    titulo: ${JSON.stringify(nombre)},\n    autor: 'GUNDAMMX',\n    licencia: 'Fotografía propia',\n    licenciaUrl: '/creditos/#fotografia-propia',\n    fuente: '/creditos/#fotografia-propia',\n    alt: ${JSON.stringify(alt)},\n    tipo: 'propia',\n  },\n`;
}

function actualizarCredito(contenido, id, entrada) {
  const patron = new RegExp(`  '${id}': \\{[\\s\\S]*?^  \\},\\n`, 'm');
  return patron.test(contenido) ? contenido.replace(patron, entrada) : contenido.replace(/\n};\s*$/, `\n${entrada}};\n`);
}

function borrarCredito(contenido, id) {
  return contenido.replace(new RegExp(`  '${id}': \\{[\\s\\S]*?^  \\},\\n`, 'm'), '');
}

for (const [kit, datos] of kits) {
  const directorio = path.join(raiz, '_imagenes/propias', kit);
  const problemas = [];
  const principales = await archivoDeFoto(directorio, 'principal', extensionesPrincipal);
  const verticales = await archivoDeFoto(directorio, 'vertical', extensionesVertical);
  if (principales.length !== 1) problemas.push(principales.length ? 'hay más de una principal' : 'falta principal');
  if (verticales.length > 1) problemas.push('hay más de una vertical');
  const principal = principales[0];
  const vertical = verticales[0];
  const validar = async (archivo, etiqueta, debeSerHorizontal = false) => {
    if (!archivo) return true;
    let metadata;
    try {
      metadata = await sharp(archivo).metadata();
    } catch {
      problemas.push(`${etiqueta} no se pudo leer`);
      return false;
    }
    const intercambiaDimensiones = [5, 6, 7, 8].includes(metadata.orientation ?? 1);
    const width = intercambiaDimensiones ? metadata.height ?? 0 : metadata.width ?? 0;
    const height = intercambiaDimensiones ? metadata.width ?? 0 : metadata.height ?? 0;
    if (Math.max(width, height) < 1600) {
      problemas.push(`${etiqueta} menor a 1600 px (${width}×${height})`);
      return false;
    }
    if (debeSerHorizontal && width <= height) {
      problemas.push(`principal debe ser horizontal (${width}×${height})`);
      return false;
    }
    return true;
  };
  let valida = Boolean(principal) && principales.length === 1 && verticales.length <= 1;
  if (principal) valida = (await validar(principal, 'principal', true)) && valida;
  if (vertical) valida = (await validar(vertical, 'vertical')) && valida;
  const fichasActualizadas = valida ? datos.fichas.length : 0;
  resultados.push({ kit, fotos: principal ? `principal${vertical ? ' + vertical' : ''}` : 'ninguna', fichas: fichasActualizadas, problemas: problemas.join('; ') || '—' });
  if (!valida) continue;
  cambios.push({ kit, datos, principal, vertical });
}

if (aplicar && cambios.length) {
  const todosLosMarkdown = await listarMarkdown(path.join(raiz, 'src/content'));
  const contenidos = new Map(await Promise.all(todosLosMarkdown.map(async (archivo) => [archivo, await readFile(archivo, 'utf8')])));
  const creditosRuta = path.join(raiz, 'src/config/creditos-imagenes.ts');
  let creditos = await readFile(creditosRuta, 'utf8');
  const creditosAnteriores = new Set();

  for (const cambio of cambios) {
    const idPrincipal = `foto-${cambio.kit}`;
    const idVertical = `foto-${cambio.kit}-v`;
    await sharp(cambio.principal).rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toFile(path.join(raiz, 'src/assets', `${idPrincipal}.jpg`));
    if (cambio.vertical) await sharp(cambio.vertical).rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toFile(path.join(raiz, 'src/assets', `${idVertical}.jpg`));
    creditos = actualizarCredito(creditos, idPrincipal, entradaCredito(idPrincipal, cambio.datos.nombre, cambio.datos.fichas[0].alt));
    if (cambio.vertical) creditos = actualizarCredito(creditos, idVertical, entradaCredito(idVertical, cambio.datos.nombre, cambio.datos.fichas.find((ficha) => ficha.vertical)?.alt ?? cambio.datos.fichas[0].alt));
    for (const ficha of cambio.datos.fichas) {
      const archivo = path.join(raiz, ficha.archivo);
      let contenido = contenidos.get(archivo);
      const anterior = contenido.match(/^imagen_credito:\s*(.+)$/m)?.[1]?.trim();
      if (anterior?.startsWith('gen-')) creditosAnteriores.add(anterior);
      const usarVertical = ficha.vertical && cambio.vertical;
      contenido = reemplazarCampo(contenido, 'imagen', `../../assets/${usarVertical ? idVertical : idPrincipal}.jpg`);
      contenido = reemplazarCampo(contenido, 'imagen_alt', JSON.stringify(ficha.alt));
      contenido = reemplazarCampo(contenido, 'imagen_credito', usarVertical ? idVertical : idPrincipal);
      contenidos.set(archivo, contenido);
    }
  }

  for (const credito of creditosAnteriores) {
    const sigueReferenciado = [...contenidos.values()].some((contenido) => new RegExp(`^imagen_credito:\\s*${credito}\\s*$`, 'm').test(contenido));
    if (!sigueReferenciado) {
      creditos = borrarCredito(creditos, credito);
      for (const extension of ['jpg', 'jpeg', 'png', 'webp']) {
        try { await unlink(path.join(raiz, 'src/assets', `${credito}.${extension}`)); } catch {}
      }
    }
  }
  await Promise.all([...contenidos].map(([archivo, contenido]) => writeFile(archivo, contenido)));
  await writeFile(creditosRuta, creditos);
}

console.log(`Modo: ${aplicar ? 'aplicar' : 'dry-run'}${kitSolicitado ? ` · kit: ${kitSolicitado}` : ''}`);
console.log('kit | fotos encontradas | fichas actualizadas | problemas');
console.log('--- | --- | ---: | ---');
for (const resultado of resultados) console.log(`${resultado.kit} | ${resultado.fotos} | ${resultado.fichas} | ${resultado.problemas}`);
