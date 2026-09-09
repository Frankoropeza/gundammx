import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORIA_IDS } from './config/categorias';
import { ESTADOS_SLUGS } from './lib/estados';

const GRADOS = [
  'eg', 'sd', 'hg', 'rg', 'mg', 'mgsd', 'mgex', 'pg', 'full-mechanics', 'mega-size', 're100',
] as const;

/**
 * Fecha ISO YYYY-MM-DD que además EXISTE en el calendario.
 * El regex solo no basta: aceptaba 2026-02-31 y 2026-99-99.
 */
const fechaISO = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe ser ISO YYYY-MM-DD')
  .refine((v) => {
    const [a, m, d] = v.split('-').map(Number);
    const fecha = new Date(Date.UTC(a, m - 1, d));
    return fecha.getUTCFullYear() === a && fecha.getUTCMonth() === m - 1 && fecha.getUTCDate() === d;
  }, 'La fecha no existe en el calendario');

/** Toda ficha publicada debe declarar de dónde salió el dato y cuándo se comprobó. */
const verificacion = z.strictObject({
  estado: z.enum(['verificada', 'reportada', 'sin_verificar', 'cerrada']),
  fecha: fechaISO,
  metodo: z.enum(['sitio_web', 'visita', 'telefono', 'distribuidor', 'documento']),
  fuentes: z.array(z.string().url()).min(1),
  nivel_confianza: z.number().min(1).max(3),
  notas: z.string().optional(),
});

const sucursal = z.strictObject({
  etiqueta: z.string().optional(),
  calle: z.string().optional(),
  colonia: z.string().optional(),
  ciudad: z.string(),
  municipio: z.string().optional(),
  // Slug de estado, validado contra los 32. Un typo ya no compila en silencio.
  estado: z.enum(ESTADOS_SLUGS),
  cp: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  dentro_de_plaza: z.string().optional(),
  /**
   * true = bodega o punto de entrega, NO una tienda donde se pueda entrar a ver.
   * La dirección se le muestra al usuario porque le sirve para recoger, pero no
   * se emite marcado de negocio local: sería afirmar una tienda que no existe.
   */
  solo_recoleccion: z.boolean().default(false),
  telefono: z.string().optional(),
  whatsapp: z.string().optional(),
  horarios: z.record(z.string(), z.string()).optional(),
}).superRefine((s, ctx) => {
  // Media coordenada no sirve para nada: el mapa desaparece sin avisar.
  if ((s.lat === undefined) !== (s.lng === undefined)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [s.lat === undefined ? 'lat' : 'lng'],
      message: 'lat y lng van juntos o no van.',
    });
  }
});

const faqItem = z.strictObject({ pregunta: z.string(), respuesta: z.string() });

const tiendas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tiendas' }),
  schema: ({ image }) => z.strictObject({
    nombre: z.string(),
    // 160 es el techo real de una meta description: la ficha la deriva de aquí.
    descripcion_corta: z.string().max(160),

    /**
     * Versión del estándar de ficha (vault, doc 24 · F4).
     *   1 = ficha heredada, se publica tal cual
     *   2 = ficha migrada al estándar nuevo: exige alta, FAQ propia y,
     *       si maneja preventa, la política declarada
     * La obligatoriedad por versión se activa en la etapa D, cuando el
     * contenido ya exista. Hoy el campo sólo declara en qué estándar está.
     */
    esquema_version: z.number().int().min(1).max(2).default(1),
    alta: fechaISO.optional(),
    politica_preventa: z.string().optional(),

    /**
     * Veredicto editorial: una frase que responde «¿me sirve esta tienda?».
     * No es la descripcion_corta, que describe; esto juzga, con lo verificado.
     */
    veredicto: z.string().max(220).optional(),

    /**
     * EXPEDIENTE DE EVIDENCIA.
     * Una lista global de `fuentes` no alcanza: no dice qué sostiene cada URL.
     * Aquí cada afirmación comercial va amarrada a la página exacta que la
     * respalda y a la fecha en que se consultó. Es lo que permite auditar la
     * ficha sin volver a rastrear el sitio, y lo que se muestra al usuario.
     * Obligatorio desde `esquema_version: 2`.
     */
    evidencias: z.array(z.strictObject({
      afirmacion: z.string().min(12).max(200),
      url: z.string().url(),
      fecha: fechaISO,
      /** Dónde exactamente dentro de la fuente: sección, menú, encabezado. Obligatorio: una URL sola no dice qué parte sostiene el dato. */
      cita: z.string().min(3).max(160),
      /**
       * Meses que esta evidencia sigue siendo defendible sin volver a mirar.
       * Obligatoria y explícita: un precio caduca antes que un domicilio, y un
       * valor por omisión dejaría esa decisión al azar. El script marca las
       * vencidas. Guía: catálogo, precios y ausencias 3 · políticas 6 ·
       * domicilios, teléfonos y redes 12.
       */
      vigencia_meses: z.number().int().min(1).max(24),
      tipo: z.enum(['pagina_propia', 'documento', 'nota_de_prensa', 'directorio_oficial']).default('pagina_propia'),
    })).default([]),

    // Imagen propia o autorizada por la tienda. NUNCA box art ni material de terceros.
    imagen: image().optional(),
    imagen_alt: z.string().optional(),
    imagen_credito: z.string().optional(),
    galeria: z.array(z.strictObject({ src: image(), alt: z.string() })).default([]),

    zonas_cobertura: z.array(z.string()).default([]),
    especialidades: z.array(z.string()).default([]),
    rango_precio: z.enum(['$', '$$', '$$$']).optional(),
    faq: z.array(faqItem).default([]),
    relacionadas: z.array(z.string()).default([]),
    seo: z.strictObject({ titulo: z.string().optional(), descripcion: z.string().optional() }).optional(),
    autor: z.string().default('Redacción GUNDAMMX'),
    tipo: z.enum(['fisica', 'online', 'hibrida', 'popup', 'marketplace']),
    categoria: z.enum(['especialista', 'coleccionables', 'modelismo', 'oficial']),
    anio_fundacion: z.number().optional(),

    sucursales: z.array(sucursal).default([]),

    web: z.string().url().optional(),
    email: z.string().optional(),
    redes: z.strictObject({
      instagram: z.string().url().optional(),
      facebook: z.string().url().optional(),
      tiktok: z.string().url().optional(),
      youtube: z.string().url().optional(),
      x: z.string().url().optional(),
      discord: z.string().url().optional(),
    }).default({}),
    marketplaces: z.strictObject({
      mercadolibre: z.string().url().optional(),
      amazon: z.string().url().optional(),
      mercadoshops: z.string().url().optional(),
    }).default({}),

    // Oferta Gunpla: el corazon del directorio
    vende_gunpla: z.enum(['si', 'ocasional', 'no', 'desconocido']),
    origen_producto: z.enum([
      'distribuidor_autorizado',
      'revende_original',
      'importacion_directa',
      'mixto',
      'no_verificado',
    ]).default('no_verificado'),
    grados: z.array(z.enum(GRADOS)).default([]),
    profundidad_catalogo: z.number().optional(),
    maneja_preventa: z.boolean().default(false),
    maneja_pbandai: z.boolean().default(false),
    otras_lineas: z.array(z.string()).default([]),
    vende_herramientas: z.boolean().default(false),
    vende_pinturas: z.boolean().default(false),
    marcas_pintura: z.array(z.string()).default([]),

    servicios: z.array(z.enum([
      'talleres', 'cursos', 'custom_paint', 'armado_por_encargo',
      'panel_lining', 'aerografia', 'club', 'concursos',
    ])).default([]),

    envio_nacional: z.boolean().default(false),
    paqueterias: z.array(z.string()).default([]),
    envio_gratis_desde: z.number().optional(),
    pickup: z.boolean().default(false),
    pagos: z.array(z.string()).default([]),
    msi: z.boolean().default(false),

    verificacion,

    destacada: z.boolean().default(false),
    plan: z.enum(['gratis', 'verificada', 'destacada']).default('gratis'),
    reclamada_por_dueno: z.boolean().default(false),
    actualizada: fechaISO,
  }).superRefine((d, ctx) => {
    /* Coherencia entre campos. Una ficha incoherente no es un aviso: es un dato
       que afirma dos cosas distintas, y eso rompe la trazabilidad. */
    const error = (path: string, message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    /* Desde la versión 2 del estándar, la ficha se audita por afirmación. */
    if (d.esquema_version >= 2) {
      if (d.evidencias.length === 0) error('evidencias', 'Obligatorio desde esquema_version 2.');
      if (!d.veredicto) error('veredicto', 'Obligatorio desde esquema_version 2.');
      if (d.faq.length === 0) error('faq', 'Obligatorio desde esquema_version 2: al menos una pregunta propia.');
      if (!d.alta) error('alta', 'Obligatorio desde esquema_version 2.');
    }

    if (d.actualizada < d.verificacion.fecha) {
      error('actualizada', 'No puede ser anterior a verificacion.fecha.');
    }
    if (d.alta && d.alta > d.actualizada) {
      error('alta', 'No puede ser posterior a actualizada.');
    }
    if (d.politica_preventa && !d.maneja_preventa) {
      error('politica_preventa', 'Hay política de preventa pero maneja_preventa es falso.');
    }
    if (d.marcas_pintura.length > 0 && !d.vende_pinturas) {
      error('marcas_pintura', 'Se declaran marcas de pintura pero vende_pinturas es falso.');
    }
    if (d.envio_gratis_desde !== undefined && !d.envio_nacional) {
      error('envio_gratis_desde', 'Hay umbral de envío gratis pero no se declara envío nacional.');
    }
    const online = d.tipo === 'online' || d.tipo === 'marketplace';
    if (online && d.sucursales.length > 0) {
      error('sucursales', `tipo "${d.tipo}" no debe declarar sucursales.`);
    }
    if (!online && d.sucursales.length === 0) {
      error('sucursales', `tipo "${d.tipo}" exige al menos una sucursal.`);
    }
  }),
});

const kits = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/kits' }),
  schema: z.object({
    nombre: z.string(),
    grado: z.enum(GRADOS),
    escala: z.string(),
    serie: z.string(),
    linea: z.string().optional(),
    codigo_bandai: z.string().optional(),
    fecha_jp: z.string().optional(),
    precio_jp_jpy: z.number().optional(),
    precio_mx_observado: z.array(z.object({
      monto: z.number(),
      tienda: z.string(),
      fecha: z.string(),
      fuente: z.string().url(),
    })).default([]),
    dificultad: z.enum(['principiante', 'intermedio', 'avanzado']).optional(),
    disponible_en: z.array(z.string()).default([]),
    resumen: z.string(),
  }),
});

const noticias = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/noticias' }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    fecha: z.coerce.date(),
    categoria: z.enum(['lanzamientos', 'p-bandai', 'eventos', 'anime', 'precios', 'directorio']),
    // Regla editorial: ninguna nota sobre terceros se publica sin fuente enlazada
    fuente_nombre: z.string().optional(),
    fuente_url: z.string().url().optional(),
    autor: z.string().default('Redacción GUNDAMMX'),
    tags: z.array(z.string()).default([]),
    kits_relacionados: z.array(z.string()).default([]),
    tiendas_relacionadas: z.array(z.string()).default([]),
    borrador: z.boolean().default(false),
  }).superRefine((d, ctx) => {
    if (d.categoria !== 'directorio' && (!d.fuente_url || !d.fuente_nombre)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Toda nota sobre terceros exige fuente_nombre y fuente_url. Solo los avisos propios (categoria: directorio) están exentos.',
      });
    }
  }),
});

const eventos = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/eventos' }),
  schema: z.object({
    nombre: z.string(),
    descripcion: z.string(),
    tipo: z.enum(['convencion', 'concurso', 'taller', 'exposicion', 'tienda-temporal']),
    fecha_inicio: z.coerce.date(),
    fecha_fin: z.coerce.date().optional(),
    sede: z.string().optional(),
    ciudad: z.string(),
    estado: z.string(),
    organizador: z.string().optional(),
    url_oficial: z.string().url().optional(),
    gunpla_confirmado: z.boolean().default(false),
    recurrente: z.boolean().default(false),
    verificacion,
  }),
});

const servicios = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/servicios' }),
  schema: z.object({
    nombre: z.string(),
    descripcion: z.string(),
    tipo: z.array(z.enum([
      'custom_paint', 'aerografia', 'taller', 'curso', 'herramientas', 'pinturas',
    ])),
    ciudad: z.string(),
    estado: z.string(),
    web: z.string().url().optional(),
    contacto: z.string().optional(),
    marcas: z.array(z.string()).default([]),
    verificacion,
  }),
});

const comunidad = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/comunidad' }),
  schema: z.object({
    nombre: z.string(),
    descripcion: z.string(),
    tipo: z.enum(['grupo_facebook', 'discord', 'club', 'capitulo_ipms', 'canal']),
    alcance: z.enum(['nacional', 'estatal', 'local']),
    ciudad: z.string().optional(),
    estado: z.string().optional(),
    url: z.string().url(),
    verificacion,
  }),
});



/* ================================================================== */
/*  ARCHIVO EDITORIAL — universo Gundam                                */
/*  Regla: ningún dato sin `fuentes`. Sin imágenes de terceros:        */
/*  `imagen` solo acepta activos propios o licenciados del repo.       */
/* ================================================================== */

const UNIVERSOS = ['uc', 'ac', 'ce', 'ad', 'pd', 'as', 'cc'] as const;

const base = {
  codigo: z.string(),                       // código de archivo, p. ej. "SER-UC-0079"
  fuentes: z.array(z.string().url()).min(1),
  estado_editorial: z.enum(['verificado', 'borrador']).default('verificado'),
  actualizado: z.string(),
  seo: z.object({ titulo: z.string().optional(), descripcion: z.string().optional() }).optional(),
};

const universes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/universes' }),
  schema: ({ image }) => z.object({
    nombre: z.string(),
    abreviatura: z.enum(UNIVERSOS),
    calendario: z.string(),                 // "Universal Century"
    periodo: z.string(),                    // "UC 0079 – UC 0153 en la línea principal"
    introduccion: z.string(),
    orden: z.number(),
    serie_de_entrada: z.string(),           // id de la serie recomendada para empezar
    imagen: image().optional(),
    imagen_alt: z.string().optional(),
    imagen_credito: z.string().optional(),
    ...base,
  }),
});

const series = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/series' }),
  schema: ({ image }) => z.object({
    titulo: z.string(),
    titulo_original: z.string().optional(),
    universo: z.enum(UNIVERSOS),
    formato: z.enum(['tv', 'ova', 'pelicula', 'ona']),
    anio: z.number(),
    fecha_inicio: z.string().optional(),
    fecha_fin: z.string().optional(),
    episodios: z.number().optional(),
    estudio: z.string(),
    direccion: z.array(z.string()),
    anio_ficcion: z.string().optional(),   // "UC 0079"
    estado: z.enum(['finalizada', 'en_emision', 'anunciada']).default('finalizada'),
    resumen: z.string(),
    relevancia: z.string(),                 // por qué importa, en una frase
    orden_recomendado: z.number().optional(),   // ruta para principiantes
    orden_cronologico: z.number().optional(),   // cronología interna del universo
    ruta: z.enum(['empieza-aqui', 'profundiza', 'alternativa']).optional(),
    mobile_suits: z.array(z.string()).default([]),
    pilotos: z.array(z.string()).default([]),
    facciones: z.array(z.string()).default([]),
    disponibilidad_mx: z.array(z.string()).default([]),   // dónde verla en México, si se verificó
    imagen: image().optional(),
    imagen_alt: z.string().optional(),
    imagen_credito: z.string().optional(),
    ...base,
  }),
});

const mobileSuits = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/mobile-suits' }),
  schema: ({ image }) => z.object({
    nombre: z.string(),
    designacion: z.string(),                // "RX-78-2"
    universo: z.enum(UNIVERSOS),
    faccion: z.string(),                    // id de facción
    pilotos: z.array(z.string()).default([]),
    primera_aparicion: z.string(),          // id de serie
    fabricante: z.string().optional(),
    tipo: z.string().optional(),            // "Prototipo de combate cercano"
    especificaciones: z.array(z.object({ etiqueta: z.string(), valor: z.string() })).default([]),
    resumen: z.string(),
    relacionados: z.array(z.string()).default([]),
    kits: z.array(z.string()).default([]),  // ids de la colección kits (Gunpla)
    imagen: image().optional(),
    imagen_alt: z.string().optional(),
    imagen_credito: z.string().optional(),
    ...base,
  }),
});

const pilots = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pilots' }),
  schema: ({ image }) => z.object({
    nombre: z.string(),
    alias: z.array(z.string()).default([]),
    universo: z.enum(UNIVERSOS),
    facciones: z.array(z.string()).default([]),
    series: z.array(z.string()).default([]),
    mobile_suits: z.array(z.string()).default([]),
    rol: z.string(),                        // "Protagonista", "Antagonista", "Secundario"
    resumen: z.string(),
    imagen: image().optional(),
    imagen_alt: z.string().optional(),
    imagen_credito: z.string().optional(),
    ...base,
  }),
});

const factions = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/factions' }),
  schema: z.object({
    nombre: z.string(),
    universo: z.enum(UNIVERSOS),
    tipo: z.string(),                       // "Estado", "Fuerza militar", "Organización privada"
    series: z.array(z.string()).default([]),
    resumen: z.string(),
    ...base,
  }),
});

const gunpla = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/gunpla' }),
  schema: z.object({
    nombre: z.string(),                     // "High Grade"
    etiqueta: z.string(),                   // "HG"
    escala: z.string(),
    anio_lanzamiento: z.number(),
    dificultad: z.enum(['principiante', 'intermedio', 'avanzado', 'experto']),
    resumen: z.string(),
    para_quien: z.string(),
    orden: z.number(),
    ...base,
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: ({ image }) => z.object({
    titulo: z.string(),
    resumen: z.string(),
    autor: z.string().default('Redacción GUNDAMMX'),
    fecha: z.coerce.date(),
    tema: z.enum(['universo', 'series', 'mobile-suits', 'gunpla', 'mexico', 'guia']),
    categoria: z.enum(CATEGORIA_IDS),
    nivel: z.enum(['principiante', 'intermedio', 'avanzado']).optional(),
    actualizada: z.string().optional(),
    tiendas_relacionadas: z.array(z.string()).default([]),
    kits_relacionados: z.array(z.string()).default([]),
    lectura_min: z.number(),
    destacado: z.boolean().default(false),
    universos: z.array(z.enum(UNIVERSOS)).default([]),
    series: z.array(z.string()).default([]),
    imagen: image().optional(),
    imagen_alt: z.string().optional(),
    imagen_credito: z.string().optional(),   // clave en src/config/creditos-imagenes.ts
    referencias: z.array(z.object({ titulo: z.string(), url: z.string().url() })).min(1),

    // --- SEO autorable. Si se omite, la pagina cae al derivado de titulo/resumen. ---
    seo: z.object({
      titulo: z.string().max(65).optional(),
      descripcion: z.string().min(120).max(165).optional(),
    }).optional(),
    keyword_principal: z.string().optional(),
    keywords_secundarias: z.array(z.string()).default([]),

    // Bloque de preguntas frecuentes. Alimenta schemaFAQ() y es elegible para rich results.
    faq: z.array(faqItem).default([]),

    borrador: z.boolean().default(false),
  }),
});

export const collections = {
  // directorio y hobby
  tiendas, kits, noticias, eventos, servicios, comunidad,
  // archivo editorial
  universes, series, 'mobile-suits': mobileSuits, pilots, factions, gunpla, articles,
};
