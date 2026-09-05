import type { APIRoute } from 'astro';
import { rutasIndexables } from '@lib/rutas-indexables';

export const GET: APIRoute = async ({ site }) => {
  const rutas = await rutasIndexables();
  const cuerpo = rutas.map(({ url, lastmod }) => {
    const loc = new URL(url, site).toString();
    const lm = lastmod ? `<lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : '';
    return `<url><loc>${loc}</loc>${lm}</url>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${cuerpo}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
