import assert from 'node:assert/strict';
import test from 'node:test';
import { seleccionarArticulosRelacionados } from './articulos-relacionados.ts';

const articulo = (id, data) => ({
  id,
  data: {
    titulo: id,
    categoria: 'gunpla',
    tema: 'gunpla',
    fecha: new Date('2026-01-01'),
    keyword_principal: '',
    keywords_secundarias: [],
    universos: [],
    series: [],
    ...data,
  },
});

test('prioriza articulos con categoria, tema y vocabulario compartidos', () => {
  const actual = articulo('entry-grade-que-es', {
    titulo: 'Entry Grade: el Gunpla que se arma sin herramientas',
    keyword_principal: 'entry grade gunpla',
    keywords_secundarias: ['entry grade vs high grade', 'gunpla sin pegamento'],
  });
  const candidatos = [
    actual,
    articulo('noticia-reciente', {
      categoria: 'mexico',
      tema: 'mexico',
      fecha: new Date('2026-11-01'),
    }),
    articulo('grados-de-gunpla', {
      titulo: 'Los grados del Gunpla: EG, HG, RG, MG y PG',
      keyword_principal: 'grados de gunpla',
      keywords_secundarias: ['entry grade', 'high grade'],
    }),
    articulo('herramientas-para-armar-gunpla', {
      titulo: 'Herramientas para armar Gunpla',
      keyword_principal: 'herramientas para gunpla',
      keywords_secundarias: ['armar gunpla'],
    }),
  ];

  assert.deepEqual(
    seleccionarArticulosRelacionados(actual, candidatos, 2).map((item) => item.id),
    ['grados-de-gunpla', 'herramientas-para-armar-gunpla'],
  );
});

test('excluye el articulo actual, limita resultados y desempata por fecha', () => {
  const actual = articulo('actual', {});
  const candidatos = [
    actual,
    articulo('antiguo', { fecha: new Date('2026-01-01') }),
    articulo('nuevo', { fecha: new Date('2026-10-01') }),
    articulo('intermedio', { fecha: new Date('2026-06-01') }),
  ];

  assert.deepEqual(
    seleccionarArticulosRelacionados(actual, candidatos, 2).map((item) => item.id),
    ['nuevo', 'intermedio'],
  );
});
