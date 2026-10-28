/**
 * Calendario de lanzamientos de /lanzamientos/.
 *
 * Regla editorial: solo entran fechas OFICIALES, cada una con su fuente exacta.
 * Nada de rumores ni de «se espera». Si una fecha solo tiene mes, `precision: 'mes'`.
 * Precios: se copian tal como los publica la fuente y se indica si incluyen impuestos
 * (`impuestos: 'incluidos'`) o si el calendario de Bandai Hobby no lo especifica
 * (`impuestos: 'sin_especificar'`, se muestra como «la fuente no especifica impuestos»). Nunca se convierten a pesos aquí.
 *
 * Mantenimiento: revisar cada mes; mover a `pasados` lo que ya salió.
 * Verificación completa: 2026-10-28 (doc 75 del vault).
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

export const LANZAMIENTOS_VERIFICADO = '2026-10-28';

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
/** Ficha del producto en el sitio japonés de Bandai Hobby: precio con IVA japonés (10 %) incluido y fecha exacta cuando ya la publican. */
const BHJP = (id: string) => ({ nombre: 'BANDAI HOBBY SITE (Japón) — ficha del producto', url: `https://bandai-hobby.net/item/01_${id}/` });
const BHJP_MES = (m: string) => ({ nombre: 'BANDAI HOBBY SITE (Japón) — calendario de lanzamientos', url: `https://bandai-hobby.net/schedule/?saledate=${m}` });

export const LANZAMIENTOS: Lanzamiento[] = [
  // ---------- Octubre 2026 ----------
  { fecha: '2026-10-08', precision: 'dia', tipo: 'anime', titulo: 'Panel de Mobile Suit Gundam SEED FREEDOM ZERO en New York Comic Con', detalle: 'Se anunciaron el estreno en Japón (15 de enero de 2027) y en Norteamérica (febrero de 2027), un nuevo tráiler y el elenco en inglés.', fuente: { nombre: 'Bandai Namco Filmworks — comunicado de NYCC 2026', url: 'https://www.prnewswire.com/news-releases/mobile-suit-gundam-seed-freedom-zero-coming-to-north-american-theaters-in-february-2027-announced-at-new-york-comic-con-2026-302902878.html' }, enlace: '/noticias/seed-freedom-zero-fecha-estreno/' },
  { fecha: '2026-10-31', precision: 'dia', tipo: 'gunpla', titulo: 'HG 1/144 Gundam Virsago', detalle: 'After War Gundam X.', precio: { monto: '¥3,190', impuestos: 'incluidos' }, region: 'Japón', fuente: BHJP('7249') },
  { fecha: '2026-10-31', precision: 'dia', tipo: 'coleccionismo', titulo: 'Gundam Assemble: Starter Set 01, Expansion Packs 01 y 02 y Paint Pack 01', detalle: 'Arranque del juego de miniaturas.', precio: { monto: 'Starter ¥3,850 · Expansiones ¥3,300 c/u · Paint Pack ¥4,290', impuestos: 'incluidos' }, region: 'Japón', fuente: BHJP_MES('202610'), enlace: '/articulos/gundam-assemble-que-es/' },
  { fecha: '2026-10-30', precision: 'dia', tipo: 'tcg', titulo: 'Gundam Card Game: Stardust Trails [GD06]', detalle: 'Booster con Gundam ZZ y 0083: Stardust Memory. Sobres de 12 cartas.', precio: { monto: '4.99 USD por sobre', impuestos: 'sin_especificar' }, fuente: { nombre: 'GUNDAM CARD GAME — GD06', url: 'https://www.gundam-gcg.com/en/products/gd06.html' }, enlace: '/noticias/gd06-stardust-trails-lanzamiento/' },
  { fecha: '2026-10-30', precision: 'dia', tipo: 'eventos', titulo: 'Abre The Gundam Base Minneapolis', detalle: 'Nueva tienda oficial de Gunpla en Estados Unidos.', region: 'Estados Unidos', fuente: { nombre: 'GUNDAM Official', url: 'https://en.gundam-official.com/news/kmvd0q6zxcgys0d8vq01vyxb' } },

  // ---------- Noviembre 2026 ----------
  { fecha: '2026-11-28', precision: 'dia', tipo: 'gunpla', titulo: 'HG 1/144 Gundam Ashtaron', detalle: 'After War Gundam X.', precio: { monto: '¥3,960', impuestos: 'incluidos' }, region: 'Japón', fuente: BHJP('7253') },
  { fecha: '2026-11', precision: 'mes', tipo: 'coleccionismo', titulo: 'Gundam Assemble: Deluxe Set 01 y Expansion Packs 03 y 04', precio: { monto: 'Deluxe ¥9,000 · Expansiones ¥3,000 c/u', impuestos: 'sin_especificar' }, fuente: BH('202611'), enlace: '/articulos/gundam-assemble-que-es/' },
  { fecha: '2026-11-20', precision: 'dia', tipo: 'eventos', titulo: 'Abre The Gundam Base Shibuya', detalle: 'Piso 5 de Shibuya PARCO, Tokio. Con bustos del RX-78-2, el Strike Freedom y el Unicorn.', region: 'Japón', fuente: { nombre: 'GUNDAM Official', url: 'https://en.gundam-official.com/news/emxedubrxufeygcn97m1v2n1' }, enlace: '/articulos/gundam-escala-real-yokohama-odaiba/' },
  { fecha: '2026-11-22', precision: 'dia', tipo: 'tcg', titulo: 'Regional oficial del Gundam Card Game en la Ciudad de México', detalle: 'Expo Reforma, colonia Juárez. Organiza SangSang.', region: 'México', fuente: { nombre: 'GUNDAM CARD GAME — Regionals 26-27', url: 'https://www.gundam-gcg.com/en/events/CS26-27Regionals_2.html' }, enlace: '/articulos/gundam-card-game-en-mexico/' },

  // ---------- Diciembre 2026 ----------
  { fecha: '2026-12', precision: 'mes', tipo: 'gunpla', titulo: 'MG 1/100 Gundam Liberty Astray Red Frame', precio: { monto: '¥7,500', impuestos: 'sin_especificar' }, region: 'Japón', fuente: BH('202612') },
  { fecha: '2026-12', precision: 'mes', tipo: 'gunpla', titulo: 'HG 1/144 Murasame Kai (tipo de producción inicial)', detalle: 'Mobile Suit Gundam SEED FREEDOM ZERO.', precio: { monto: '¥2,970', impuestos: 'incluidos' }, region: 'Japón', fuente: BHJP('7428'), enlace: '/noticias/seed-freedom-zero-fecha-estreno/' },
  { fecha: '2026-12', precision: 'mes', tipo: 'coleccionismo', titulo: 'Gundam Assemble: Deluxe Set 02 y Expansion Pack 05', precio: { monto: 'Deluxe ¥13,000 · Expansión ¥3,000', impuestos: 'sin_especificar' }, fuente: BH('202612'), enlace: '/articulos/gundam-assemble-que-es/' },

  // ---------- Enero 2027 ----------
  { fecha: '2027-01', precision: 'mes', tipo: 'gunpla', titulo: 'FULL MECHANICS 1/100 Graze Ein', detalle: 'Mobile Suit Gundam: Iron-Blooded Orphans.', precio: { monto: '¥7,150', impuestos: 'incluidos' }, region: 'Japón', fuente: GO_1T2027 },
  { fecha: '2027-01', precision: 'mes', tipo: 'gunpla', titulo: 'HG 1/144 Strike Freedom Gundam SEED FREEDOM ZERO Ver. (nombre provisional)', detalle: 'Mobile Suit Gundam SEED FREEDOM ZERO. Bandai dará los detalles después.', precio: { monto: '¥2,970', impuestos: 'incluidos' }, region: 'Japón', fuente: BHJP('7430'), enlace: '/noticias/seed-freedom-zero-fecha-estreno/' },
  { fecha: '2027-01', precision: 'mes', tipo: 'gunpla', titulo: 'Option Parts Set Gunpla 21 (nombre provisional)', detalle: 'Piezas de Mobile Suit Gundam SEED FREEDOM ZERO. Bandai dará los detalles después.', precio: { monto: '¥5,720', impuestos: 'incluidos' }, region: 'Japón', fuente: BHJP('7431') },
  { fecha: '2027-01', precision: 'mes', tipo: 'gunpla', titulo: 'HG 1/144 Gundam Helix', detalle: 'Del videojuego Gundam Rogue Orbit.', precio: { monto: '¥2,750', impuestos: 'incluidos' }, region: 'Japón', fuente: BHJP('7429'), enlace: '/articulos/gundam-rogue-orbit-todo-lo-que-se-sabe/' },
  { fecha: '2027-01', precision: 'mes', tipo: 'coleccionismo', titulo: 'Gundam Assemble: Expansion Packs 06 y 07', precio: { monto: '¥3,300 c/u', impuestos: 'incluidos' }, region: 'Japón', fuente: BHJP('7327'), enlace: '/articulos/gundam-assemble-que-es/' },
  { fecha: '2027-01-09', precision: 'dia', tipo: 'eventos', titulo: 'GUNDAM-Con 2027 SIDE MAKUHARI (9 al 11 de enero)', detalle: 'Makuhari Messe, Chiba. Evento del 50 aniversario de la serie; entradas por sorteo.', region: 'Japón', fuente: { nombre: 'GUNDAM Official', url: 'https://en.gundam-official.com/news/p265yy8dsvloa2po7ryf03k2' } },
  { fecha: '2027-01-15', precision: 'dia', tipo: 'anime', titulo: 'Estreno en cines de Mobile Suit Gundam SEED FREEDOM ZERO', detalle: 'Precuela de SEED FREEDOM, ambientada en C.E. 74. Distribuyen Bandai Namco Filmworks y Shochiku.', region: 'Japón', fuente: { nombre: 'Sitio oficial de SEED FREEDOM ZERO', url: 'https://gundam-official.com/seed/freedom/news/item.php?id=u41ricmmmttp4p014dosmk9p' }, enlace: '/noticias/seed-freedom-zero-fecha-estreno/' },
  { fecha: '2027-01-29', precision: 'dia', tipo: 'tcg', titulo: 'Gundam Card Game: Blazing Fist [GD07]', detalle: 'Booster con Mobile Suit Gundam: The 08th MS Team. Sobres de 12 cartas.', fuente: { nombre: 'GUNDAM CARD GAME — GD07', url: 'https://www.gundam-gcg.com/en/products/gd07.html' }, enlace: '/articulos/gundam-card-game-en-mexico/' },

  // ---------- Febrero 2027 ----------
  { fecha: '2027-02', precision: 'mes', tipo: 'anime', titulo: 'Estreno en cines de Mobile Suit Gundam SEED FREEDOM ZERO en Norteamérica', detalle: 'Con versión doblada al inglés. Día exacto por confirmar. El comunicado no menciona a México.', region: 'Norteamérica', fuente: { nombre: 'Bandai Namco Filmworks — comunicado de NYCC 2026', url: 'https://www.prnewswire.com/news-releases/mobile-suit-gundam-seed-freedom-zero-coming-to-north-american-theaters-in-february-2027-announced-at-new-york-comic-con-2026-302902878.html' }, enlace: '/noticias/seed-freedom-zero-fecha-estreno/' },
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
