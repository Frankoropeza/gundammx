# GUNDAMMX — gundam.mx

Archivo editorial independiente sobre el universo Gundam y directorio verificado de tiendas, kits, eventos y comunidad en México. Astro 6 · TypeScript estricto · Markdown/MDX · Pagefind. Sitio estático desplegado en GitHub Pages.

> Proyecto independiente de aficionados. No está afiliado a Bandai Namco, Sunrise ni Sotsu. Sin logotipos, arte de caja ni imágenes de terceros.

## Comandos

```bash
npm install --include=dev   # (--include=dev evita que NODE_ENV=production pode devDependencies)
npm run dev                  # http://localhost:4321
npm run check                # astro check (TS estricto + esquemas)
npm run build                # astro build + índice Pagefind en dist/pagefind
npm run preview
```

Node ≥ 22.12. La Action de deploy usa Node 22.

## Estructura

```
src/
  content.config.ts      esquemas Zod de todas las colecciones
  content/
    universes/           7 calendarios (uc, ac, ce, ad, pd, as, cc)
    series/              obras (TV, OVA, película, ONA)
    mobile-suits/        fichas técnicas
    pilots/              personajes
    factions/            facciones
    gunpla/              grados del hobby (EG, HG, RG, MG, PG)
    articles/            expedientes editoriales (home, /articulos/)
    guides/              guías de compra
    tiendas/ kits/ noticias/ eventos/ servicios/ comunidad/   directorio
  components/            SiteHeader, EditorialHero, UniverseNavigator, SeriesRail,
                         MobileSuitCard, ArchiveCard, TimelineGuide, SearchDialog,
                         MetadataRow, RelatedContent, GunplaBlock, NewsletterCTA, SiteFooter…
  layouts/BaseLayout.astro
  lib/archivo.ts         consultas del archivo (rutas de entrada, cronología UC…)
  lib/seo.ts             JSON-LD (WebSite, Organization, BreadcrumbList, TVSeries, Article…)
  lib/rutas-indexables.ts  única fuente de verdad del sitemap (misma regla que noindex)
  pages/                 rutas
  styles/global.css      tokens (claro/oscuro), utilidades editoriales
```

## Cómo agregar contenido

Todo es Markdown con frontmatter validado por Zod. Si un campo falta o está mal, `npm run check` / `npm run build` fallan con el archivo y la línea.

Reglas comunes a **todas** las colecciones del archivo (`universes`, `series`, `mobile-suits`, `pilots`, `factions`, `gunpla`, `articles`):

- `codigo`: código de archivo visible en la ficha (`SER-AC-WING`, `MS-UC-RX-78-2`…). Único.
- `fuentes`: lista de URLs verificables, mínimo una. Sin fuente no compila.
- `estado_editorial`: `verificado` (default) o `borrador`. Un borrador no aparece en listados, en la home ni en el sitemap; su página se genera con `noindex` para revisión.
- `actualizado`: fecha `YYYY-MM-DD`.
- `imagen` (opcional): ruta bajo `src/assets/`. Si falta, se muestra un marcador `ImagenPendiente` con el código. **Solo activos propios o licenciados.**
- Valores YAML con `:` o comillas → entre comillas dobles.

### Serie — `src/content/series/<slug>.md`

```yaml
---
codigo: SER-AC-WING
titulo: Mobile Suit Gundam Wing
titulo_original: 新機動戦記ガンダムW
universo: ac                     # uc | ac | ce | ad | pd | as | cc
formato: tv                      # tv | ova | pelicula | ona
anio: 1995
fecha_inicio: '1995-04-07'
fecha_fin: '1996-03-29'
episodios: 49
estudio: Sunrise
direccion: [Masashi Ikeda, Shinji Takamatsu]
anio_ficcion: AC 195
estado: finalizada               # finalizada | en_emision | anunciada
resumen: Una o dos frases.
relevancia: Por qué importa (una frase).
orden_recomendado: 3             # posición en la ruta recomendada (opcional)
orden_cronologico: 5             # solo UC, posición en cronología interna (opcional)
ruta: empieza-aqui               # empieza-aqui | profundiza | alternativa (opcional)
mobile_suits: [xxxg-01w-wing-gundam]   # ids de mobile-suits/
pilotos: [heero-yuy]                   # ids de pilots/
facciones: [oz]                        # ids de factions/
disponibilidad_mx: []                  # [{ plataforma, url, nota? }]
fuentes:
  - https://en.wikipedia.org/wiki/Mobile_Suit_Gundam_Wing
actualizado: '2026-09-05'
---
Cuerpo en Markdown: contexto, por qué verla, dónde encaja.
```

El `slug` del archivo es el id que usan los demás contenidos para enlazar. Las referencias cruzadas (`mobile_suits`, `pilotos`, `facciones`, `series`, `relacionados`) se resuelven en build; un id inexistente detiene el build con el nombre de la colección y el id.

### Mobile suit — `src/content/mobile-suits/<slug>.md`

Campos: `nombre`, `designacion` (RX-78-2), `universo`, `faccion` (id), `pilotos` (ids), `primera_aparicion` (id de serie), `fabricante?`, `tipo?`, `especificaciones` (lista `{ etiqueta, valor }`, solo datos verificables), `resumen`, `relacionados` (ids de mobile suits), `kits` (ids de `kits/`), más los comunes.

### Personaje — `src/content/pilots/<slug>.md`

`nombre`, `alias` (lista), `universo`, `facciones` (ids), `series` (ids), `mobile_suits` (ids), `rol`, `resumen`, más los comunes.

### Facción — `src/content/factions/<slug>.md`

`nombre`, `universo`, `tipo` (Estado, Fuerza militar, Organización privada…), `series` (ids), `resumen`, más los comunes.

### Universo — `src/content/universes/<id>.md`

Uno por calendario; `abreviatura` debe ser uno de los siete ids. En la home solo aparecen universos con al menos una serie publicada (`universosConContenido()` en `lib/archivo.ts`).

### Artículo — `src/content/articles/<slug>.md`

`titulo`, `resumen`, `autor`, `fecha`, `tema`, `lectura_min`, `destacado` (solo uno en `true`: es el hero de la home), `universos`, `series`, `referencias` (lista `{ titulo, url }`, mínimo una), `borrador`. Cuerpo Markdown con H2/H3; sin H1 (lo pone la plantilla).

### Gunpla — `src/content/gunpla/<slug>.md`

Un archivo por grado: `nombre`, `etiqueta` (HG), `escala`, `anio_lanzamiento`, `dificultad`, `resumen`, `para_quien`, `orden`.

### Directorio (tiendas, kits, noticias, guías, eventos, servicios, comunidad)

Esquemas en `content.config.ts` líneas 1–230. Las tiendas exigen `verificacion.fuentes` (mínimo una) y las noticias `fuente` salvo categoría `directorio`. Los precios solo se publican con fecha de observación.

## Imágenes

Colocar en `src/assets/<coleccion>/` y referenciar en `imagen`. `Figura.astro` usa Astro Assets (dimensiones fijas, sin CLS, formatos modernos). Sin imagen → `ImagenPendiente` con el código del expediente. Nunca subir arte oficial, arte de caja ni capturas de terceros.

## SEO y búsqueda

- Cada página define `titulo` y `descripcion` únicos (`seo` opcional en el frontmatter sobreescribe).
- `noindex` se aplica en `/buscar/`, filtros con query string y listados sin contenido suficiente; `lib/rutas-indexables.ts` genera el sitemap con la misma regla.
- Pagefind indexa solo `main[data-pagefind-body]`; el chrome y los bloques relacionados llevan `data-pagefind-ignore`.
- JSON-LD por tipo de página en `lib/seo.ts`.

## Tema

`data-theme` en `<html>` (`light` | `dark`), persistido en `localStorage.tema`; sin valor sigue `prefers-color-scheme`. Tokens en `styles/global.css`; los colores se usan siempre vía tokens (`text-ink`, `bg-paper`, `border-line`…), nunca hex sueltos.

## Deploy

`git push origin main` → GitHub Actions (`.github/workflows/deploy.yml`, Node 22) → GitHub Pages con CNAME `gundam.mx`. `PUBLIC_SITE_URL` permite compilar para otro dominio sin tocar código.
