export const ESTADOS = [
  { slug: 'aguascalientes', nombre: 'Aguascalientes' },
  { slug: 'baja-california', nombre: 'Baja California' },
  { slug: 'baja-california-sur', nombre: 'Baja California Sur' },
  { slug: 'campeche', nombre: 'Campeche' },
  { slug: 'chiapas', nombre: 'Chiapas' },
  { slug: 'chihuahua', nombre: 'Chihuahua' },
  { slug: 'cdmx', nombre: 'Ciudad de México' },
  { slug: 'coahuila', nombre: 'Coahuila' },
  { slug: 'colima', nombre: 'Colima' },
  { slug: 'durango', nombre: 'Durango' },
  { slug: 'estado-de-mexico', nombre: 'Estado de México' },
  { slug: 'guanajuato', nombre: 'Guanajuato' },
  { slug: 'guerrero', nombre: 'Guerrero' },
  { slug: 'hidalgo', nombre: 'Hidalgo' },
  { slug: 'jalisco', nombre: 'Jalisco' },
  { slug: 'michoacan', nombre: 'Michoacán' },
  { slug: 'morelos', nombre: 'Morelos' },
  { slug: 'nayarit', nombre: 'Nayarit' },
  { slug: 'nuevo-leon', nombre: 'Nuevo León' },
  { slug: 'oaxaca', nombre: 'Oaxaca' },
  { slug: 'puebla', nombre: 'Puebla' },
  { slug: 'queretaro', nombre: 'Querétaro' },
  { slug: 'quintana-roo', nombre: 'Quintana Roo' },
  { slug: 'san-luis-potosi', nombre: 'San Luis Potosí' },
  { slug: 'sinaloa', nombre: 'Sinaloa' },
  { slug: 'sonora', nombre: 'Sonora' },
  { slug: 'tabasco', nombre: 'Tabasco' },
  { slug: 'tamaulipas', nombre: 'Tamaulipas' },
  { slug: 'tlaxcala', nombre: 'Tlaxcala' },
  { slug: 'veracruz', nombre: 'Veracruz' },
  { slug: 'yucatan', nombre: 'Yucatán' },
  { slug: 'zacatecas', nombre: 'Zacatecas' },
] as const;

export type EstadoSlug = (typeof ESTADOS)[number]['slug'];

export function nombreEstado(slug: string): string {
  return ESTADOS.find((e) => e.slug === slug)?.nombre ?? slug;
}

export function slugificar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
