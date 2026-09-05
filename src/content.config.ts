import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const GRADOS = [
  'eg', 'sd', 'hg', 'rg', 'mg', 'mgsd', 'mgex', 'pg', 'full-mechanics', 'mega-size', 're100',
] as const;

/** Toda ficha publicada debe declarar de dónde salió el dato y cuándo se comprobó. */
const verificacion = z.object({
  estado: z.enum(['verificada', 'reportada', 'sin_verificar', 'cerrada']),
  fecha: z.string(),
  metodo: z.enum(['sitio_web', 'visita', 'telefono', 'distribuidor', 'documento']),
  fuentes: z.array(z.string().url()).min(1),
  nivel_confianza: z.number().min(1).max(3),
  notas: z.string().optional(),
});

const sucursal = z.object({
  etiqueta: z.string().optional(),
  calle: z.string().optional(),
  colonia: z.string().optional(),
  ciudad: z.string(),
  municipio: z.string().optional(),
  estado: z.string(),
  cp: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  dentro_de_plaza: z.string().optional(),
  telefono: z.string().optional(),
  whatsapp: z.string().optional(),
  horarios: z.record(z.string(), z.string()).optional(),
});

const faqItem = z.object({ pregunta: z.string(), respuesta: z.string() });

const tiendas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tiendas' }),
  schema: ({ image }) => z.object({
    nombre: z.string(),
    descripcion_corta: z.string().max(200),

    // Imagen propia o autorizada por la tienda. NUNCA box art ni material de terceros.
    imagen: image().optional(),
    imagen_alt: z.string().optional(),
    galeria: z.array(z.object({ src: image(), alt: z.string() })).default([]),

    zonas_cobertura: z.array(z.string()).default([]),
    especialidades: z.array(z.string()).default([]),
    rango_precio: z.enum(['$', '$$', '$$$']).optional(),
    faq: z.array(faqItem).default([]),
    relacionadas: z.array(z.string()).default([]),
    seo: z.object({ titulo: z.string().optional(), descripcion: z.string().optional() }).optional(),
    autor: z.string().default('Redacción GUNDAMMX'),
    tipo: z.enum(['fisica', 'online', 'hibrida', 'popup', 'marketplace']),
    categoria: z.enum(['especialista', 'coleccionables', 'modelismo', 'oficial']),
    anio_fundacion: z.number().optional(),

    sucursales: z.array(sucursal).default([]),

    web: z.string().url().optional(),
    email: z.string().optional(),
    redes: z.object({
      instagram: z.string().url().optional(),
      facebook: z.string().url().optional(),
      tiktok: z.string().url().optional(),
      youtube: z.string().url().optional(),
      x: z.string().url().optional(),
      discord: z.string().url().optional(),
    }).default({}),
    marketplaces: z.object({
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
    actualizada: z.string(),
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

const guias = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guias' }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    nivel: z.enum(['principiante', 'intermedio', 'avanzado']),
    fecha: z.coerce.date(),
    actualizada: z.string().optional(),
    orden: z.number().default(50),
    tiendas_relacionadas: z.array(z.string()).default([]),
    kits_relacionados: z.array(z.string()).default([]),
    borrador: z.boolean().default(false),
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

export const collections = { tiendas, kits, noticias, guias, eventos, servicios, comunidad };
