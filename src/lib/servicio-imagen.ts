import type { LocalImageService } from 'astro';
import sharpService from 'astro/assets/services/sharp';

/**
 * Servicio de imagen del sitio: sharp, con una sola corrección.
 *
 * Astro usa WebP como formato de salida por omisión (`DEFAULT_OUTPUT_FORMAT`), sin mirar el
 * original. Para la fotografía propia, que se guarda en AVIF, eso es doblemente malo: vuelve a
 * codificar una imagen ya comprimida —degradándola otra vez— y el resultado pesa MÁS que la
 * fuente. Medido en el build del 2026-11-12: un original AVIF de 223 kB salía como WebP de 299 kB.
 *
 * Aquí el AVIF sigue siendo AVIF salvo que quien lo use pida otra cosa con `format`. Los JPG y PNG
 * de banco no cambian: siguen saliendo en WebP, así que nada de lo ya publicado se ve afectado.
 *
 * Es necesario a nivel de servicio y no de componente porque las imágenes insertadas en el cuerpo
 * de los artículos en Markdown no pasan por ningún componente nuestro.
 */
const servicioImagen: LocalImageService = {
  ...sharpService,
  validateOptions(opciones, configuracion) {
    if (!opciones.format) {
      const origen =
        typeof opciones.src === 'object' && opciones.src !== null && 'format' in opciones.src
          ? (opciones.src as { format?: string }).format
          : String(opciones.src).split('?')[0].split('.').pop()?.toLowerCase();
      if (origen === 'avif') opciones.format = 'avif';
    }
    return sharpService.validateOptions!(opciones, configuracion);
  },
};

export default servicioImagen;
