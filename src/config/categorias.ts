/**
 * Registro único de las categorías del blog. Gobierna nombres, orden, umbral de
 * apertura y textos de hub. Cualquier consumidor (esquema, rutas, sitemap) lee de aquí.
 *
 * `minimo` = piezas publicadas necesarias para que la categoría genere hub propio.
 * Una categoría por debajo de su mínimo NO genera ruta y NO entra al sitemap.
 */
export const CATEGORIAS = {
  mexico: {
    nombre: 'Gundam en México',
    orden: 1,
    minimo: 3,
    descripcion: 'Dónde comprar, dónde ver y dónde encontrarse con la escena Gundam en el país.',
  },
  gunpla: {
    nombre: 'Gunpla',
    orden: 2,
    minimo: 3,
    descripcion: 'Qué es cada grado, qué significan las siglas y cómo se arma un model kit.',
  },
  series: {
    nombre: 'Series y películas',
    orden: 3,
    minimo: 3,
    descripcion: 'Qué es cada obra de la franquicia, qué cuenta y a quién le va a gustar.',
  },
  empezar: {
    nombre: 'Empezar en Gundam',
    orden: 4,
    minimo: 3,
    descripcion: 'Por dónde entrar a cuarenta años de franquicia sin abandonar en el intento.',
  },
  comprar: {
    nombre: 'Comprar Gunpla',
    orden: 5,
    minimo: 3,
    descripcion: 'Precios reales en México, cómo distinguir un kit original y dónde conseguirlo.',
  },
  'donde-ver': {
    nombre: 'Dónde ver',
    orden: 6,
    minimo: 1,
    descripcion: 'En qué plataforma está cada serie en México, con qué doblaje y desde cuándo.',
  },
  'mobile-suits': {
    nombre: 'Mobile suits y lore',
    orden: 7,
    minimo: 3,
    descripcion: 'Las máquinas, los pilotos, las facciones y los calendarios de la franquicia.',
  },
  juegos: {
    nombre: 'Juegos y TCG',
    orden: 8,
    minimo: 3,
    descripcion: 'El juego de cartas, los videojuegos y cómo se juegan desde México.',
  },
} as const;

export type CategoriaId = keyof typeof CATEGORIAS;

export const CATEGORIA_IDS = Object.keys(CATEGORIAS) as [CategoriaId, ...CategoriaId[]];
