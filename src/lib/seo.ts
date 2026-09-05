import { SITE } from '@config/site';

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

type DatosTienda = {
  nombre: string;
  descripcion: string;
  web?: string;
  sucursales: {
    calle?: string; colonia?: string; ciudad: string; estado: string; cp?: string;
    lat?: number; lng?: number; telefono?: string;
  }[];
  redes: Record<string, string | undefined>;
  imagen?: string;
  rangoPrecio?: string;
};

/** HobbyShop (subtipo de Store), sin aggregateRating: no publicamos reseñas que no son nuestras. */
export function schemaTienda(b: Base, t: DatosTienda) {
  const principal = t.sucursales[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'HobbyShop',
    name: t.nombre,
    description: t.descripcion,
    url: abs(b.site, b.url),
    ...(t.imagen ? { image: abs(b.site, t.imagen) } : {}),
    ...(t.rangoPrecio ? { priceRange: t.rangoPrecio } : {}),
    ...(t.web ? { sameAs: [t.web, ...Object.values(t.redes).filter(Boolean)] } : {}),
    ...(principal
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: principal.calle,
            addressLocality: principal.ciudad,
            addressRegion: principal.estado,
            postalCode: principal.cp,
            addressCountry: 'MX',
          },
          ...(principal.telefono ? { telephone: principal.telefono } : {}),
          ...(principal.lat && principal.lng
            ? { geo: { '@type': 'GeoCoordinates', latitude: principal.lat, longitude: principal.lng } }
            : {}),
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
  a: { titulo: string; descripcion: string; fecha: Date },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.titulo,
    description: a.descripcion,
    datePublished: a.fecha.toISOString(),
    publisher: { '@type': 'Organization', name: SITE.nombre },
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
