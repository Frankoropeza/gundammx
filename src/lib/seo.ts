import { SITE } from '@config/site';
import { nombreEstado } from '@lib/estados';

type Base = { site: URL | undefined; url: string };

const abs = (site: URL | undefined, path: string) => new URL(path, site).toString();

export function schemaSitio(b: Base) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.nombre,
    alternateName: SITE.nombreLargo,
    url: b.site?.toString(),
    description: SITE.descripcion,
    inLanguage: SITE.locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: abs(b.site, '/buscar/?q={search_term_string}'),
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function schemaFAQ(items: { pregunta: string; respuesta: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: i.respuesta },
    })),
  };
}

export function schemaOrganizacion(b: Base) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.nombre,
    url: b.site?.toString(),
    description: SITE.descripcion,
    logo: abs(b.site, '/og/logo.png'),
    image: abs(b.site, '/og/default.png'),
    areaServed: 'MX',
    // Declaración explícita de independencia: no somos canal oficial de nadie.
    disambiguatingDescription:
      'Directorio independiente. Sin afiliación con Bandai Namco ni con sus filiales.',
  };
}

export function schemaMigaDePan(b: Base, items: { nombre: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.nombre,
      item: abs(b.site, it.href),
    })),
  };
}

type Horarios = Record<string, string>;

type SucursalSchema = {
  etiqueta?: string; calle?: string; colonia?: string; ciudad: string; estado: string; cp?: string;
  lat?: number; lng?: number; telefono?: string; horarios?: Horarios;
};

type DatosTienda = {
  nombre: string;
  descripcion: string;
  web?: string;
  email?: string;
  /** La primera sucursal es la principal: de ella salen address, geo y horarios. */
  sucursales: SucursalSchema[];
  redes: Record<string, string | undefined>;
  imagen?: string;
  rangoPrecio?: string;
  /** Sin envío nacional comprobado no se afirma cobertura nacional. */
  envioNacional?: boolean;
};

const DIAS_SCHEMA: Record<string, string> = {
  lunes: 'Monday', martes: 'Tuesday', miercoles: 'Wednesday', miércoles: 'Wednesday',
  jueves: 'Thursday', viernes: 'Friday', sabado: 'Saturday', sábado: 'Saturday',
  domingo: 'Sunday',
};

/**
 * `openingHoursSpecification` a partir de `horarios` de la ficha.
 * Sólo emite lo que puede interpretar: un día desconocido o un rango que no
 * sea HH:MM-HH:MM se omite en silencio en vez de publicar un horario falso.
 */
/** Normaliza "9:00" a "09:00" y rechaza horas imposibles como 25:00 o 10:99. */
function hora(v: string): string | null {
  const m = v.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 24 || min > 59 || (h === 24 && min !== 0)) return null;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
}

function horariosSchema(horarios?: Horarios) {
  if (!horarios) return [];
  const spec: Record<string, string>[] = [];
  for (const [dia, rango] of Object.entries(horarios)) {
    const nombreDia = DIAS_SCHEMA[dia.trim().toLowerCase()];
    if (!nombreDia) continue;
    const texto = String(rango).trim();
    // Cerrado se declara explícitamente; no se omite en silencio.
    if (/^(cerrado|closed)$/i.test(texto)) {
      spec.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: `https://schema.org/${nombreDia}`, opens: '00:00', closes: '00:00' });
      continue;
    }
    if (/^(24\s*h(oras)?|24\/7)$/i.test(texto)) {
      spec.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: `https://schema.org/${nombreDia}`, opens: '00:00', closes: '23:59' });
      continue;
    }
    // Acepta turnos partidos y los separadores que se usan en la práctica:
    // "10:00-20:00", "10:00 a 20:00", "10:00 — 20:00", "9:00-14:00, 16:00-20:00".
    for (const tramo of texto.split(/\s*[,;]\s*|\s+y\s+/)) {
      const m = tramo.match(/^\s*(\d{1,2}:\d{2})\s*(?:-|–|—|a|to)\s*(\d{1,2}:\d{2})\s*$/i);
      if (!m) continue;
      const abre = hora(m[1]);
      const cierra = hora(m[2]);
      if (!abre || !cierra) continue;
      spec.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: `https://schema.org/${nombreDia}`, opens: abre, closes: cierra });
    }
  }
  return spec;
}

/**
 * Ficha de tienda. `HobbyShop` (subtipo de Store, que a su vez es
 * LocalBusiness) sólo cuando hay domicilio comprobado; una tienda sin punto
 * físico es `OnlineStore`, porque marcar como negocio local algo que no lo es
 * afirma en los datos estructurados lo que la página no muestra.
 * Nunca lleva `aggregateRating`: no publicamos reseñas que no son nuestras.
 */
const direccionDe = (s: SucursalSchema) => ({
  '@type': 'PostalAddress',
  ...(s.calle ? { streetAddress: s.calle } : {}),
  addressLocality: s.ciudad,
  // Nombre legible del estado, no el slug interno.
  addressRegion: nombreEstado(s.estado),
  ...(s.cp ? { postalCode: s.cp } : {}),
  addressCountry: 'MX',
});

export function schemaTienda(b: Base, t: DatosTienda) {
  const principal = t.sucursales[0];
  /**
   * `HobbyShop` y `Store` son negocios locales: afirman una sede física.
   * Sólo se emiten con CALLE comprobada. Una ficha que declara nada más la
   * ciudad, aunque tenga punto de entrega, no sostiene ese marcado, así que
   * sale `OnlineStore`. Es más pobre, y es lo honesto: el sello de la ficha
   * no puede comunicar más certeza que su expediente.
   */
  const conDomicilio = Boolean(principal?.calle);
  const tipo = conDomicilio ? 'HobbyShop' : 'OnlineStore';

  // Marketplaces fuera de `sameAs`: un perfil de vendedor no prueba que la
  // entidad sea la misma. Sólo el sitio propio y las redes de la tienda.
  const sameAs = [t.web, ...Object.values(t.redes ?? {})]
    .filter((u): u is string => Boolean(u));

  const horas = horariosSchema(principal?.horarios);
  const tieneGeo = principal?.lat !== undefined && principal?.lng !== undefined;
  // Las sucursales que no son la principal se publican como lugares propios,
  // en vez de quedar invisibles detrás de la primera dirección.
  const otras = t.sucursales.slice(1);

  return {
    '@context': 'https://schema.org',
    '@type': tipo,
    name: t.nombre,
    description: t.descripcion,
    url: abs(b.site, b.url),
    // Sólo se afirma cobertura nacional cuando está comprobada.
    ...(t.envioNacional ? { areaServed: { '@type': 'Country', name: 'MX' } } : {}),
    ...(t.imagen ? { image: abs(b.site, t.imagen) } : {}),
    ...(t.rangoPrecio ? { priceRange: t.rangoPrecio } : {}),
    ...(t.email ? { email: t.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(conDomicilio
      ? {
          address: direccionDe(principal!),
          ...(principal!.telefono ? { telephone: principal!.telefono } : {}),
          ...(tieneGeo
            ? {
                geo: { '@type': 'GeoCoordinates', latitude: principal!.lat, longitude: principal!.lng },
                hasMap: `https://www.google.com/maps/search/?api=1&query=${principal!.lat},${principal!.lng}`,
              }
            : {}),
          ...(horas.length ? { openingHoursSpecification: horas } : {}),
        }
      : {}),
    ...(otras.length
      ? {
          location: otras.map((s) => ({
            '@type': 'Place',
            ...(s.etiqueta ? { name: `${t.nombre} — ${s.etiqueta}` } : { name: `${t.nombre} — ${s.ciudad}` }),
            address: direccionDe(s),
            ...(s.telefono ? { telephone: s.telefono } : {}),
          })),
        }
      : {}),
  };
}

export function schemaListado(
  b: Base,
  nombre: string,
  items: { nombre: string; href: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: nombre,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.nombre,
      url: abs(b.site, it.href),
    })),
  };
}

export function schemaNoticia(
  b: Base,
  n: { titulo: string; descripcion: string; fecha: Date; autor: string; fuenteUrl?: string },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: n.titulo,
    description: n.descripcion,
    datePublished: n.fecha.toISOString(),
    author: { '@type': 'Organization', name: n.autor },
    publisher: { '@type': 'Organization', name: SITE.nombre },
    mainEntityOfPage: abs(b.site, b.url),
    ...(n.fuenteUrl ? { citation: n.fuenteUrl } : {}),
    inLanguage: SITE.locale,
  };
}

export function schemaArticulo(
  b: Base,
  a: { titulo: string; descripcion: string; fecha: Date; actualizado?: Date; autor?: string; imagen?: string },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.titulo,
    description: a.descripcion,
    datePublished: a.fecha.toISOString(),
    dateModified: (a.actualizado ?? a.fecha).toISOString(),
    author: { '@type': a.autor && !a.autor.startsWith('Redacción') ? 'Person' : 'Organization', name: a.autor ?? SITE.nombre },
    publisher: {
      '@type': 'Organization',
      name: SITE.nombre,
      logo: { '@type': 'ImageObject', url: abs(b.site, '/og/logo.png') },
    },
    image: abs(b.site, a.imagen ?? '/og/articulos.png'),
    mainEntityOfPage: abs(b.site, b.url),
    inLanguage: SITE.locale,
  };
}

export function schemaEvento(
  _b: Base,
  e: {
    nombre: string; descripcion: string; inicio: Date; fin?: Date;
    sede?: string; ciudad: string; estado: string; organizador?: string; urlOficial?: string;
  },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.nombre,
    description: e.descripcion,
    startDate: e.inicio.toISOString(),
    ...(e.fin ? { endDate: e.fin.toISOString() } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: e.sede ?? e.ciudad,
      address: {
        '@type': 'PostalAddress',
        addressLocality: e.ciudad,
        addressRegion: e.estado,
        addressCountry: 'MX',
      },
    },
    ...(e.organizador ? { organizer: { '@type': 'Organization', name: e.organizador } } : {}),
    ...(e.urlOficial ? { sameAs: e.urlOficial } : {}),
  };
}

/**
 * Product para kits. Se emite `offers` SOLO con precio observado y fechado.
 * Una estimación nunca sale como oferta.
 */
export function schemaKit(
  b: Base,
  k: { nombre: string; resumen: string; observados: { monto: number; fecha: string }[] },
) {
  const menor = [...k.observados].sort((a, c) => a.monto - c.monto)[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: k.nombre,
    description: k.resumen,
    url: abs(b.site, b.url),
    ...(menor
      ? {
          offers: {
            '@type': 'Offer',
            price: menor.monto,
            priceCurrency: 'MXN',
            priceValidUntil: menor.fecha,
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  };
}


export function schemaColeccion(b: Base, c: { nombre: string; descripcion: string; items: { nombre: string; href: string }[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: c.nombre,
    description: c.descripcion,
    url: abs(b.site, b.url),
    inLanguage: SITE.locale,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: c.items.length,
      itemListElement: c.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.nombre, url: abs(b.site, it.href) })),
    },
  };
}

export function schemaSerie(b: Base, s: {
  titulo: string; resumen: string; anio: number; episodios?: number; formato: string;
  direccion: string[]; estudio: string; fechaInicio?: string; fechaFin?: string;
}) {
  const tipo = s.formato === 'pelicula' ? 'Movie' : 'TVSeries';
  return {
    '@context': 'https://schema.org',
    '@type': tipo,
    name: s.titulo,
    description: s.resumen,
    url: abs(b.site, b.url),
    inLanguage: 'ja',
    ...(s.fechaInicio ? { datePublished: s.fechaInicio } : {}),
    ...(s.fechaFin && tipo === 'TVSeries' ? { endDate: s.fechaFin } : {}),
    ...(s.episodios && tipo === 'TVSeries' ? { numberOfEpisodes: s.episodios } : {}),
    director: s.direccion.map((d) => ({ '@type': 'Person', name: d })),
    productionCompany: { '@type': 'Organization', name: s.estudio },
  };
}

export function schemaFicha(b: Base, f: { nombre: string; descripcion: string; fecha?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: f.nombre,
    description: f.descripcion,
    ...(f.fecha ? { dateModified: f.fecha } : {}),
    publisher: { '@type': 'Organization', name: SITE.nombre },
    mainEntityOfPage: abs(b.site, b.url),
    inLanguage: SITE.locale,
  };
}

/** Segundo módulo del <title> para contenido editorial. Se omite si el título ya es largo. */
const TEMAS: Record<string, string> = {
  universo: 'Universos de Gundam',
  series: 'Series de Gundam',
  'mobile-suits': 'Mobile Suits de Gundam',
  gunpla: 'Guía de Gunpla',
  mexico: 'Gundam México',
  guia: 'Guía de Gundam',
};
export function tituloEditorial(titulo: string, tema?: string, respaldo = 'Gundam México') {
  const modulo = (tema && TEMAS[tema]) || respaldo;
  return titulo.length > 36 ? titulo : `${titulo} | ${modulo}`;
}

/** Meta description de ficha: recorta el resumen y garantiza que la cola de marca quede completa. */
export function descripcionFicha(resumen: string, cola: string, max = 112) {
  const base = resumen.length > max ? `${resumen.slice(0, max).trimEnd().replace(/[.,;:]$/, '')}…` : resumen;
  return `${base} ${cola}`;
}
