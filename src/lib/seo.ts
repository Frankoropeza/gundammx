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
  calle?: string; colonia?: string; ciudad: string; estado: string; cp?: string;
  lat?: number; lng?: number; telefono?: string; horarios?: Horarios;
};

type DatosTienda = {
  nombre: string;
  descripcion: string;
  web?: string;
  /** La primera sucursal es la principal por convención: de ella salen address, geo y horarios. */
  sucursales: SucursalSchema[];
  redes: Record<string, string | undefined>;
  marketplaces?: Record<string, string | undefined>;
  imagen?: string;
  rangoPrecio?: string;
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
function horariosSchema(horarios?: Horarios) {
  if (!horarios) return [];
  const spec: Record<string, string>[] = [];
  for (const [dia, rango] of Object.entries(horarios)) {
    const nombreDia = DIAS_SCHEMA[dia.trim().toLowerCase()];
    const m = String(rango).match(/^\s*(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})\s*$/);
    if (!nombreDia || !m) continue;
    spec.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${nombreDia}`,
      opens: m[1].padStart(5, '0'),
      closes: m[2].padStart(5, '0'),
    });
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
export function schemaTienda(b: Base, t: DatosTienda) {
  const principal = t.sucursales[0];
  const sameAs = [
    t.web,
    ...Object.values(t.redes ?? {}),
    ...Object.values(t.marketplaces ?? {}),
  ].filter((u): u is string => Boolean(u));
  const horas = horariosSchema(principal?.horarios);
  const tieneGeo = principal?.lat !== undefined && principal?.lng !== undefined;

  return {
    '@context': 'https://schema.org',
    '@type': principal ? 'HobbyShop' : 'OnlineStore',
    name: t.nombre,
    description: t.descripcion,
    url: abs(b.site, b.url),
    areaServed: 'MX',
    ...(t.imagen ? { image: abs(b.site, t.imagen) } : {}),
    ...(t.rangoPrecio ? { priceRange: t.rangoPrecio } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(principal
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: principal.calle,
            addressLocality: principal.ciudad,
            // Nombre legible del estado, no el slug interno.
            addressRegion: nombreEstado(principal.estado),
            postalCode: principal.cp,
            addressCountry: 'MX',
          },
          ...(principal.telefono ? { telephone: principal.telefono } : {}),
          ...(tieneGeo
            ? { geo: { '@type': 'GeoCoordinates', latitude: principal.lat, longitude: principal.lng } }
            : {}),
          ...(horas.length ? { openingHoursSpecification: horas } : {}),
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
