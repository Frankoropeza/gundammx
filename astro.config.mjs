import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// El dominio nunca va en duro: se sobreescribe con PUBLIC_SITE_URL.
// Requisito de arquitectura domain-agnostic del proyecto.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://gundam.mx',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
});
