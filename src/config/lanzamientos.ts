/**
 * Calendario de lanzamientos de /lanzamientos/.
 *
 * Regla editorial: solo entran fechas OFICIALES, cada una con su fuente exacta.
 * Nada de rumores ni de «se espera». Si una fecha solo tiene mes, `precision: 'mes'`.
 * Precios: se copian tal como los publica la fuente y se indica si incluyen impuestos
 * (`impuestos: 'incluidos'`) o si el calendario de Bandai Hobby no lo especifica
 * (`impuestos: 'sin_especificar'`). Nunca se convierten a pesos aquí.
 *
 * Mantenimiento: revisar cada mes; mover a `pasados` lo que ya salió.
 * Verificación completa: 2026-09-28 (doc 65 del vault).
 */
export type TipoLanzamiento = 'gunpla' | 'anime' | 'juegos' | 'tcg' | 'coleccionismo' | 'eventos';

export interface Lanzamiento {
  /** ISO: YYYY-MM-DD o YYYY-MM (si solo hay mes) o YYYY (si solo hay año). */
  fecha: string;
  precision: 'dia' | 'mes' | 'anio';
  tipo: TipoLanzamiento;
  titulo: string;
  detalle?: string;
  precio?: { monto: string; impuestos: 'incluidos' | 'sin_especificar' };
  /** Región a la que aplica la fecha, cuando no es global. */
  region?: string;
  fuente: { nombre: string; url: string };
  /** Enlace interno a la pieza del sitio que lo explica. */
  enlace?: string;
}

export const LANZAMIENTOS_VERIFICADO = '2026-09-28';

export const ETIQUETAS_TIPO: Record<TipoLanzamiento, string> = {
  gunpla: 'Gunpla',
  anime: 'Anime y cine',
  juegos: 'Videojuegos',
  tcg: 'Juego de cartas',
  coleccionismo: 'Coleccionismo',
  eventos: 'Eventos',
};

const BH = (m: string) => ({
  nombre: 'BANDAI HOBBY SITE — calendario de lanzamientos',
  url: `https://global.bandai-hobby.net/en-us/schedule/index.php?saledate=${m}`,
});
const GO_1T2027 = {
  nombre: 'GUNDAM Official — Gunpla de enero a marzo de 2027',
  url: 'https://en.gundam-official.com/news/mxksrk66gaof0hajpg2hattm',
};
const GCG_PRODUCTOS = { nombre: 'GUNDAM CARD GAME — catálogo oficial', url: 'https://www.gundam-gcg.com/en/products/list.php' };

export const LANZAMIENTOS: Lanzamiento[] = [
  // ---------- Octubre 2026 ----------
  { fecha: '2026-10-08', precision: 'dia', tipo: 'anime', titulo: 'Panel de Mobile Suit Gundam SEED FREEDOM ZERO en New York Comic Con', detalle: 'Panel de 15:30 a 16:30 (hora del Este de EE. UU.) y transmisión mundial desde las 15:45 en GUNDAM CHANNEL INTL, con novedades de la precuela de SEED FREEDOM.', fuente: { nombre: 'GUNDAM Official', url: 'https://en.gundam-official.com/news/okmmt5ezcp2956hfqscztcyd' }, enlace: '/series/gundam-seed-freedom/' },
  { fecha: '2026-10', precision: 'mes', tipo: 'gunpla', titulo: 'HG 1/144 Gundam Virsago', detalle: 'After War Gundam X.', precio: { monto: '¥2,900', impuestos: 'sin_especificar' }, region: 'Japón', fuente: BH('202610') },
  { fecha: '2026-10', precision: 'mes', tipo: 'coleccionismo', titulo: 'Gundam Assemble: Starter Set 01, Expansion Packs 01 y 02 y Paint Pack 01', detalle: 'Arranque del juego de miniaturas.', precio: { monto: 'Starter ¥3,500 · Expansiones ¥3,000 c/u · Paint Pack ¥3,900', impuestos: 'sin_especificar' }, fuente: BH('202610'), enlace: '/articulos/gundam-assemble-que-es/' },
  { fecha: '2026-10-30', precision: 'dia', tipo: 'tcg', titulo: 'Gundam Card Game: Stardust Trails [GD06]', detalle: 'Booster con Gundam ZZ y 0083: Stardust Memory. Sobres de 12 cartas.', precio: { monto: '4.99 USD por sobre', impuestos: 'sin_especificar' }, fuente: { nombre: 'GUNDAM CARD GAME — GD06', url: 'https://www.gundam-gcg.com/en/products/gd06.html' }, enlace: '/noticias/gd06-stardust-trails-lanzamiento/' },

  // ---------- Noviembre 2026 ----------
  { fecha: '2026-11', precision: 'mes', tipo: 'gunpla', titulo: 'HG 1/144 Gundam Ashtaron', detalle: 'After War Gundam X.', precio: { monto: '¥3,600', impuestos: 'sin_especificar' }, region: 'Japón', fuente: BH('202611') },
  { fecha: '2026-11', precision: 'mes', tipo: 'coleccionismo', titulo: 'Gundam Assemble: Deluxe Set 01 y Expansion Packs 03 y 04', precio: { monto: 'Deluxe ¥9,000 · Expansiones ¥3,000 c/u', impuestos: 'sin_especificar' }, fuente: BH('202611'), enlace: '/articulos/gundam-assemble-que-es/' },
  { fecha: '2026-11', precision: 'mes', tipo: 'eventos', titulo: 'Abre The Gundam Base Shibuya', detalle: 'Piso 5 de Shibuya PARCO, Tokio.', region: 'Japón', fuente: { nombre: 'GUNDAM Official', url: 'https://en.gundam-official.com/news/x0xi6cxd8ilqou22b1zsnza3' }, enlace: '/articulos/gundam-escala-real-yokohama-odaiba/' },
  { fecha: '2026-11-22', precision: 'dia', tipo: 'tcg', titulo: 'Regional oficial del Gundam Card Game en la Ciudad de México', detalle: 'Expo Reforma, colonia Juárez. Organiza SangSang.', region: 'México', fuente: { nombre: 'GUNDAM CARD GAME — Regionals 26-27', url: 'https://www.gundam-gcg.com/en/events/CS26-27Regionals_2.html' }, enlace: '/articulos/gundam-card-game-en-mexico/' },

  // ---------- Diciembre 2026 ----------
  { fecha: '2026-12', precision: 'mes', tipo: 'gunpla', titulo: 'MG 1/100 Gundam Liberty Astray Red Frame', precio: { monto: '¥7,500', impuestos: 'sin_especificar' }, region: 'Japón', fuente: BH('202612') },
  { fecha: '2026-12', precision: 'mes', tipo: 'coleccionismo', titulo: 'Gundam Assemble: Deluxe Set 02 y Expansion Pack 05', precio: { monto: 'Deluxe ¥13,000 · Expansión ¥3,000', impuestos: 'sin_especificar' }, fuente: BH('202612'), enlace: '/articulos/gundam-assemble-que-es/' },

  // ---------- Enero 2027 ----------
  { fecha: '2027-01', precision: 'mes', tipo: 'gunpla', titulo: 'FULL MECHANICS 1/100 Graze Ein', detalle: 'Mobile Suit Gundam: Iron-Blooded Orphans.', precio: { monto: '¥7,150', impuestos: 'incluidos' }, region: 'Japón', fuente: GO_1T2027 },
  { fecha: '2027-01-09', precision: 'dia', tipo: 'eventos', titulo: 'GUNDAM-Con 2027 SIDE MAKUHARI (9 al 11 de enero)', detalle: 'Makuhari Messe, Chiba. Evento del 50 aniversario de la serie; entradas por sorteo.', region: 'Japón', fuente: { nombre: 'GUNDAM Official', url: 'https://en.gundam-official.com/news/p265yy8dsvloa2po7ryf03k2' } },
  { fecha: '2027-01-29', precision: 'dia', tipo: 'tcg', titulo: 'Gundam Card Game: Blazing Fist [GD07]', fuente: GCG_PRODUCTOS, enlace: '/articulos/gundam-card-game-en-mexico/' },

  // ---------- Febrero 2027 ----------
  { fecha: '2027-02', precision: 'mes', tipo: 'gunpla', titulo: 'RG 1/144 Gundam Ground Type', precio: { monto: '¥4,620', impuestos: 'incluidos' }, region: 'Japón', fuente: GO_1T2027 },
  { fecha: '2027-02', precision: 'mes', tipo: 'eventos', titulo: 'Abre The Gundam Base Osaka', detalle: 'Piso 11 de LUCUA South, Umeda.', region: 'Japón', fuente: { nombre: 'GUNDAM Official', url: 'https://en.gundam-official.com/news/uqm9czj96y1pximejy3jxug1' }, enlace: '/articulos/gundam-escala-real-yokohama-odaiba/' },

  // ---------- Marzo 2027 ----------
  { fecha: '2027-03-05', precision: 'dia', tipo: 'juegos', titulo: 'Gundam Rogue Orbit', detalle: 'PS5, Xbox Series X|S y Steam. Texto en español de España; voces en inglés y japonés.', fuente: { nombre: 'Bandai Namco Entertainment', url: 'https://www.bandainamcoent.com/news/gundam-rogue-orbit-lands-this-march-delivering-an-action-sci-fi-thrill-ride' }, enlace: '/articulos/gundam-rogue-orbit-todo-lo-que-se-sabe/' },
  { fecha: '2027-03', precision: 'mes', tipo: 'gunpla', titulo: 'MGEX 1/100 Mighty Strike Freedom Gundam', precio: { monto: '¥26,400', impuestos: 'incluidos' }, region: 'Japón', fuente: GO_1T2027, enlace: '/mobile-suits/mighty-strike-freedom-gundam/' },
  { fecha: '2027-03', precision: 'mes', tipo: 'gunpla', titulo: 'MGSD 00 Raiser', precio: { monto: '¥6,050', impuestos: 'incluidos' }, region: 'Japón', fuente: GO_1T2027 },
  { fecha: '2027-03', precision: 'mes', tipo: 'gunpla', titulo: 'HG 1/144 Hamma-Hamma', precio: { monto: '¥4,400', impuestos: 'incluidos' }, region: 'Japón', fuente: GO_1T2027 },
  { fecha: '2027-03-13', precision: 'dia', tipo: 'tcg', titulo: 'Gran final mundial del Gundam Card Game 26-27 (13 y 14 de marzo)', detalle: 'Solo jugadores invitados.', fuente: { nombre: 'GUNDAM CARD GAME — World Championship 26-27', url: 'https://www.gundam-gcg.com/en/events/CS26-27.html' } },

  // ---------- Abril 2027 ----------
  { fecha: '2027-04', precision: 'mes', tipo: 'anime', titulo: 'Estreno de Mobile Suit Gundam RG XARX-ZERO', detalle: 'Serie de Kenji Kamiyama. Fecha anunciada para Norteamérica y Japón; sin plataforma confirmada para México.', region: 'Norteamérica y Japón', fuente: { nombre: 'GUNDAM Official', url: 'https://en.gundam-official.com/news/r3gircojylscg505jiqn4z91' }, enlace: '/noticias/rg-xarx-zero-anuncio/' },
  { fecha: '2027-04-07', precision: 'dia', tipo: 'eventos', titulo: 'Día de Gundam', detalle: 'El 7 de abril quedó reconocido oficialmente en Japón como «Gundam Day», con actividades cada año.', region: 'Japón', fuente: { nombre: 'GUNDAM Official', url: 'https://en.gundam-official.com/news/um5x5y4ehysqi2t4fggz2gzu' } },

  // ---------- 2027 sin fecha ----------
  { fecha: '2027', precision: 'anio', tipo: 'anime', titulo: 'Película live-action de Gundam (Legendary / Netflix)', detalle: 'Dirige Jim Mickle. Estreno anunciado para 2027 sin mes ni día.', fuente: { nombre: 'Netflix Tudum', url: 'https://www.netflix.com/tudum/articles/gundam-live-action-movie-release-date-news' }, enlace: '/articulos/gundam-live-action-netflix/' },
];
