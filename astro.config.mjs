import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// El dominio nunca va en duro: se sobreescribe con PUBLIC_SITE_URL.
// Requisito de arquitectura domain-agnostic del proyecto.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://gundam.mx',
  cacheDir: '.astro',
  vite: {
    cacheDir: '.astro/vite',
  },
  // Servicio de imagen propio: conserva AVIF como salida cuando el original ya es AVIF.
  // Ver el porqué en src/lib/servicio-imagen.ts.
  image: {
    service: {
      entrypoint: './src/lib/servicio-imagen.ts',
      // La fotografía propia ya entra comprimida en AVIF. Recodificarla con la calidad alta
      // por omisión la inflaba: un original de 224 kB salía en 301 kB. Con calidad 52 y
      // effort 4 la variante de 1600 px baja a una fracción de eso sin diferencia visible
      // en foto de vitrina. No afecta a los JPG de banco, que salen en WebP.
      config: { avif: { quality: 52, effort: 4 } },
    },
  },
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
