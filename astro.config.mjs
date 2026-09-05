import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// El dominio nunca va en duro: se sobreescribe con PUBLIC_SITE_URL.
// Requisito de arquitectura domain-agnostic del proyecto.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://gundam.mx',
  // El sitemap lo genera src/pages/sitemap-0.xml.ts con las mismas reglas de indexación
  integrations: [mdx()],
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
});
