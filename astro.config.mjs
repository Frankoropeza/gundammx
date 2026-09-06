import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// El dominio nunca va en duro: se sobreescribe con PUBLIC_SITE_URL.
// Requisito de arquitectura domain-agnostic del proyecto.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://gundam.mx',
  // El sitemap lo genera src/pages/sitemap-0.xml.ts con las mismas reglas de indexación
  integrations: [mdx()],
  // Las guías se unificaron en /articulos/. En salida estática Astro emite una página
  // de redirección con meta-refresh, canonical al destino y noindex. Estas rutas quedan
  // fuera del sitemap a propósito (ver src/lib/rutas-indexables.ts).
  //
  // 2026-09-06: el cluster de compra estaba canibalizado por dos artículos con la misma
  // intención. Se consolidaron en /articulos/donde-comprar-gunpla-en-mexico/ y el slug
  // retirado redirige aquí.
  redirects: {
    '/guias': '/articulos/',
    '/articulos/donde-comprar-gunpla-original-en-mexico': '/articulos/donde-comprar-gunpla-en-mexico/',
    '/guias/donde-comprar-gunpla-original-en-mexico': '/articulos/donde-comprar-gunpla-en-mexico/',
    '/guias/cuanto-cuesta-un-gunpla-en-mexico': '/articulos/cuanto-cuesta-un-gunpla-en-mexico/',
    '/guias/como-saber-si-un-gunpla-es-original': '/articulos/como-saber-si-un-gunpla-es-original/',
  },
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
});
