import assert from 'node:assert/strict';
import test from 'node:test';
import { categoriaForoArticulo, urlCategoriaForo } from './foro.ts';

test('deduce categorias del foro desde frontmatter real de articulos', () => {
  assert.equal(categoriaForoArticulo({ tema: 'gunpla', categoria: 'gunpla', keywords_secundarias: [] }), 'gunpla-y-tecnicas');
  assert.equal(categoriaForoArticulo({ tema: 'gunpla', categoria: 'gunpla', keywords_secundarias: ['top coat', 'panel lining'] }), 'gunpla-y-tecnicas');
  assert.equal(categoriaForoArticulo({ tema: 'guia', categoria: 'empezar', series: ['gundam-wing'] }), 'series-y-universo');
  assert.equal(categoriaForoArticulo({ tema: 'series', categoria: 'series', universos: ['uc'] }), 'series-y-universo');
  assert.equal(categoriaForoArticulo({ tema: 'mexico', categoria: 'comprar', tiendas_relacionadas: ['bandai-namco-shop'] }), 'compra-venta');
  assert.equal(categoriaForoArticulo({ tema: 'mexico', categoria: 'mexico', keyword_principal: 'eventos gundam mexico' }), 'eventos-y-clubes');
  assert.equal(categoriaForoArticulo({ tema: 'mexico', categoria: 'mexico', keyword_principal: 'comunidad gundam méxico' }), 'general');
  assert.equal(categoriaForoArticulo({ titulo: 'Comprar vender Gunpla de segunda mano', tema: 'mexico', categoria: 'mexico' }), 'compra-venta');
  assert.equal(categoriaForoArticulo({ titulo: 'El Zaku: por qué importa', tema: 'universo', categoria: 'mobile-suits' }), 'series-y-universo');
  assert.equal(categoriaForoArticulo({ titulo: 'Eventos Gundam en México', tema: 'mexico', categoria: 'mexico' }), 'eventos-y-clubes');
});

test('construye urls canonicas del foro', () => {
  assert.equal(urlCategoriaForo('gunpla-y-tecnicas'), 'https://comunidad.gundam.mx/foro/gunpla-y-tecnicas/');
});
