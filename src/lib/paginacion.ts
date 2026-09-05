export const POR_PAGINA = 12;
export const urlPagina = (n: number) => (n <= 1 ? '/noticias/' : `/noticias/pagina/${n}/`);
