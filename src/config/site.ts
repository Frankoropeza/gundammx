/**
 * Fuente única de verdad del sitio (SSoT).
 * Nada de esto se repite en componentes ni en páginas.
 */

export const SITE = {
  nombre: 'GUNDAMMX',
  nombreLargo: 'GUNDAM MEXICO',
  descriptor: 'Archivo editorial · México',
  descripcion:
    'Portal editorial independiente sobre el universo Gundam en español: universos, series, mobile suits, pilotos, cronologías, Gunpla y un directorio verificado de tiendas en México. Sin afiliación con ninguna marca.',
  // El dominio se resuelve desde astro.config (PUBLIC_SITE_URL). Nunca en duro aquí.
  locale: 'es-MX',
  pais: 'MX',
  email: 'contacto@gundam.mx',
  ciudad: 'Ciudad de México',
} as const;

/** Aviso de independencia. Obligatorio en todas las páginas. */
export const AVISO_INDEPENDENCIA =
  'GUNDAMMX es un directorio independiente de tiendas y un medio informativo sobre modelismo. ' +
  'No estamos afiliados, patrocinados, avalados ni asociados con Bandai Namco Holdings Inc., ' +
  'Bandai Co., Ltd., BANDAI SPIRITS, Bandai Namco Filmworks Inc., Sotsu Co., Ltd., ' +
  'Bandai Corporación México, S.A. de C.V. ni con ninguna de sus filiales. ' +
  'GUNDAM, GUNPLA y las demás marcas citadas son marcas registradas de sus respectivos titulares ' +
  'y se mencionan aquí únicamente con fines informativos y de identificación de los productos.';

export const ENLACES_OFICIALES = [
  { nombre: 'Sitio oficial de la franquicia', url: 'https://en.gundam-official.com/' },
  { nombre: 'Bandai Namco México', url: 'https://bandai.com.mx/' },
] as const;

export const NAV = [
  { texto: 'Universos', href: '/universos/' },
  { texto: 'Series', href: '/series/' },
  { texto: 'Mobile Suits', href: '/mobile-suits/' },
  { texto: 'Personajes', href: '/personajes/' },
  { texto: 'Gunpla', href: '/gunpla/' },
  { texto: 'Cronología', href: '/cronologia/' },
  { texto: 'Artículos', href: '/articulos/' },
] as const;

/** Secciones secundarias (pie y hub Gunpla) */
export const NAV_SECUNDARIA = [
  { texto: 'Noticias', href: '/noticias/' },
  { texto: 'Tiendas verificadas', href: '/tiendas/' },
  { texto: 'Kits y precios', href: '/kits/' },
  { texto: 'Eventos', href: '/eventos/' },
  { texto: 'Servicios', href: '/servicios/' },
  { texto: 'Comunidad', href: '/comunidad/' },
] as const;

export const UNIVERSOS_META = {
  uc: { nombre: 'Universal Century', corto: 'UC' },
  ac: { nombre: 'After Colony', corto: 'AC' },
  ce: { nombre: 'Cosmic Era', corto: 'CE' },
  ad: { nombre: 'Anno Domini', corto: 'AD' },
  pd: { nombre: 'Post Disaster', corto: 'PD' },
  as: { nombre: 'Ad Stella', corto: 'AS' },
  cc: { nombre: 'Correct Century', corto: 'CC' },
} as const;
export type UniversoId = keyof typeof UNIVERSOS_META;

export const GRADOS = {
  eg: { etiqueta: 'EG', nombre: 'Entry Grade', escala: '1/144', orden: 1 },
  sd: { etiqueta: 'SD', nombre: 'Super Deformed', escala: 'sin escala', orden: 2 },
  hg: { etiqueta: 'HG', nombre: 'High Grade', escala: '1/144', orden: 3 },
  rg: { etiqueta: 'RG', nombre: 'Real Grade', escala: '1/144', orden: 4 },
  mg: { etiqueta: 'MG', nombre: 'Master Grade', escala: '1/100', orden: 5 },
  mgsd: { etiqueta: 'MGSD', nombre: 'Master Grade SD', escala: 'sin escala', orden: 6 },
  mgex: { etiqueta: 'MGEX', nombre: 'Master Grade Extreme', escala: '1/100', orden: 7 },
  pg: { etiqueta: 'PG', nombre: 'Perfect Grade', escala: '1/60', orden: 8 },
  'full-mechanics': { etiqueta: 'FM', nombre: 'Full Mechanics', escala: '1/100', orden: 9 },
  'mega-size': { etiqueta: 'MSM', nombre: 'Mega Size Model', escala: '1/48', orden: 10 },
  re100: { etiqueta: 'RE/100', nombre: 'Reborn-One Hundred', escala: '1/100', orden: 11 },
} as const;

export type GradoId = keyof typeof GRADOS;

/**
 * Factor de sobreprecio México / precio de lista Japón.
 * Medido sobre 5 SKU idénticos en el canal oficial (vault: 01 - ESTUDIO DE MERCADO §4).
 */
export const FACTOR_MX = 2.35;
export const JPY_MXN = 0.10816; // BCE, 4-sep-2026
