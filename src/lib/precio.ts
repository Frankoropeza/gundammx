import { FACTOR_MX, JPY_MXN } from '@config/site';

/**
 * Estimador de precio de referencia en México.
 *
 * Base: comparación de 5 SKU idénticos entre la ficha oficial japonesa y el
 * catálogo oficial mexicano (vault: 01 - ESTUDIO DE MERCADO §4). El múltiplo
 * medido fue 2.35x con dispersión de 2.28x a 2.51x, así que la estimación se
 * publica como rango, nunca como cifra puntual.
 */
export function rangoEstimadoMXN(precioJpy: number) {
  const baseMxn = precioJpy * JPY_MXN;
  return {
    min: Math.round((baseMxn * (FACTOR_MX - 0.15)) / 5) * 5,
    max: Math.round((baseMxn * (FACTOR_MX + 0.16)) / 5) * 5,
    referenciaJpMxn: Math.round(baseMxn),
  };
}

export type Observado = { monto: number; tienda: string; fecha: string; fuente: string };

/** Marca los precios observados que se despegan del rango esperado. */
export function evaluarObservado(precioJpy: number | undefined, obs: Observado) {
  if (!precioJpy) return { sobreprecio: null, alerta: false };
  const { max } = rangoEstimadoMXN(precioJpy);
  const sobreprecio = Math.round(((obs.monto - max) / max) * 100);
  return { sobreprecio, alerta: sobreprecio > 15 };
}

export const pesos = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);

export const yenes = (n: number) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(n);

export const fechaLarga = (iso: string | Date) =>
  new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(typeof iso === 'string' ? new Date(iso) : iso);

export const fechaCorta = (iso: string | Date) =>
  new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(typeof iso === 'string' ? new Date(iso) : iso);
