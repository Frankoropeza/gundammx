type DatosArticuloRelacionable = {
  titulo: string;
  categoria: string;
  tema: string;
  fecha: Date;
  keyword_principal?: string;
  keywords_secundarias?: string[];
  universos?: string[];
  series?: string[];
};

type ArticuloRelacionable = {
  id: string;
  data: DatosArticuloRelacionable;
};

const PALABRAS_VACIAS = new Set([
  'a', 'al', 'como', 'con', 'cual', 'de', 'del', 'el', 'en', 'es', 'la', 'las', 'lo', 'los',
  'para', 'por', 'que', 'sin', 'su', 'sus', 'tu', 'un', 'una', 'vs', 'y',
]);

function vocabulario(articulo: ArticuloRelacionable) {
  const texto = [
    articulo.data.titulo,
    articulo.data.keyword_principal ?? '',
    ...(articulo.data.keywords_secundarias ?? []),
  ].join(' ');

  return new Set(
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((palabra) => palabra.length > 2 && !PALABRAS_VACIAS.has(palabra)),
  );
}

function coincidencias(a: string[] = [], b: string[] = []) {
  const conjunto = new Set(a);
  return b.filter((valor) => conjunto.has(valor)).length;
}

function puntuacion(actual: ArticuloRelacionable, candidato: ArticuloRelacionable) {
  let total = 0;
  if (actual.data.categoria === candidato.data.categoria) total += 8;
  if (actual.data.tema === candidato.data.tema) total += 5;
  total += coincidencias(actual.data.universos, candidato.data.universos) * 5;
  total += coincidencias(actual.data.series, candidato.data.series) * 6;

  const palabrasActual = vocabulario(actual);
  for (const palabra of vocabulario(candidato)) {
    if (palabrasActual.has(palabra)) total += 2;
  }
  return total;
}

export function seleccionarArticulosRelacionados<T extends ArticuloRelacionable>(
  actual: T,
  candidatos: T[],
  limite = 5,
) {
  return candidatos
    .filter((candidato) => candidato.id !== actual.id)
    .map((candidato) => ({ candidato, puntuacion: puntuacion(actual, candidato) }))
    .sort((a, b) =>
      b.puntuacion - a.puntuacion
      || b.candidato.data.fecha.getTime() - a.candidato.data.fecha.getTime()
      || a.candidato.id.localeCompare(b.candidato.id),
    )
    .slice(0, limite)
    .map(({ candidato }) => candidato);
}
