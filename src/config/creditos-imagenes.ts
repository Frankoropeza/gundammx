/**
 * Créditos de las imágenes de banco con licencia libre usadas en el sitio.
 *
 * Regla: solo licencias que permiten uso comercial y obra derivada (CC BY, CC BY-SA,
 * CC0, dominio público). Cada imagen se recortó y recomprimió; la atribución es
 * obligatoria y se muestra al pie de cada figura.
 *
 * NO son activos propios: no se usan como logotipo, favicon ni imagen de marca.
 */

export interface CreditoImagen {
  titulo: string;
  autor: string;
  licencia: string;
  licenciaUrl: string;
  fuente: string;
  alt: string;
}

export const CREDITOS: Record<string, CreditoImagen> = {
  'art-donde-ver': {
    titulo: 'Gundam figure at Don Quijote Kaheka',
    autor: 'jdnx',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/21442511@N08/52194570136',
    alt: 'Model kit expuesto en el mostrador de una tienda de hobby.',
  },
  'art-gundam-wing': {
    titulo: 'Wing Zero Kai',
    autor: 'joo0ey',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/37238219@N00/5066980320',
    alt: 'Primer plano de un model kit del Wing Gundam Zero Kai.',
  },
  'art-historia-mexico': {
    titulo: 'GUNDAM!',
    autor: 'joo0ey',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/37238219@N00/3247856863',
    alt: 'Primer plano de un model kit del RX-78-2.',
  },
  'art-orden': {
    titulo: 'BANDAI GUNPLA',
    autor: 'othree',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/12452841@N00/9486175112',
    alt: 'Varios model kits de distintas series expuestos juntos en una vitrina.',
  },
  'art-universal-century': {
    titulo: 'RX-0 Unicorn Gundam (Unicorn Mode)',
    autor: 'Nelo Hotsuma',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/63122283@N06/44100055452',
    alt: 'Model kit del RX-0 Unicorn Gundam en modo unicornio.',
  },
  'gui-donde-comprar': {
    titulo: 'The Gundam Base Tokyo, entrance',
    autor: 'Syced',
    licencia: 'CC0 1.0',
    licenciaUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    fuente: 'https://commons.wikimedia.org/w/index.php?curid=129634893',
    alt: 'Entrada de la tienda The Gundam Base en Tokio.',
  },
  'gui-original': {
    titulo: 'BANDAI GUNPLA RG',
    autor: 'othree',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/12452841@N00/9486171428',
    alt: 'Model kit Real Grade del RX-78-2 expuesto en una vitrina.',
  },
  'gui-precio': {
    titulo: 'BANDAI GUNPLA',
    autor: 'othree',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/12452841@N00/9486179884',
    alt: 'Model kits High Grade expuestos junto a su ficha de precio.',
  },
  'hub-articulos': {
    titulo: 'Airfix Islander pieces & travelling work space, annotated, at the registration table, the day before the contest.',
    autor: 'wbaiv',
    licencia: 'CC BY-SA 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    fuente: 'https://www.flickr.com/photos/9998127@N06/4900843278',
    alt: 'Mesa de trabajo de modelismo con pinturas, piezas y herramientas.',
  },
  'hub-comunidad': {
    titulo: 'Frederic Duch 3D Model1',
    autor: 'Jefferson Lab',
    licencia: 'Dominio público (PDM 1.0)',
    licenciaUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
    fuente: 'https://www.flickr.com/photos/53950384@N02/54719199815',
    alt: 'Dos personas armando un diorama a escala en una mesa de taller.',
  },
  'hub-eventos': {
    titulo: 'GUNPLA EXPO 鋼彈模型博覽會 – TAIWAN 2013',
    autor: 'othree',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/12452841@N00/9483342649',
    alt: 'Primer plano de un model kit expuesto en una exposición de Gunpla.',
  },
  'hub-guias': {
    titulo: 'Clippers, tweezers, scissors, sanding sticks',
    autor: 'wbaiv',
    licencia: 'CC BY-SA 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    fuente: 'https://www.flickr.com/photos/9998127@N06/4569806198',
    alt: 'Herramientas de modelismo sobre una mesa: pinzas, tijeras, limas, cúter y pinturas.',
  },
  'hub-gunpla': {
    titulo: 'Pull the plastic out of the bags',
    autor: 'Kaeru',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/51035756584@N01/48588655',
    alt: 'Runners de plástico de un model kit recién sacados de la bolsa, junto al instructivo.',
  },
  'hub-kits': {
    titulo: 'One or two Gundam models',
    autor: 'DocChewbacca',
    licencia: 'CC BY-SA 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    fuente: 'https://www.flickr.com/photos/49462908@N00/2871304398',
    alt: 'Estantería de tienda llena de cajas de model kits de Gunpla.',
  },
  'hub-mobile-suits': {
    titulo: 'MG MSA-0011(Ext) Ex-S Gundam',
    autor: 'Mathias Appel',
    licencia: 'CC0 1.0',
    licenciaUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    fuente: 'https://www.flickr.com/photos/91501748@N07/8566837608',
    alt: 'Model kit Master Grade del Ex-S Gundam fotografiado sobre fondo negro.',
  },
  'hub-noticias': {
    titulo: 'MG MSN-001A1 Delta Plus',
    autor: 'Mathias Appel',
    licencia: 'CC0 1.0',
    licenciaUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    fuente: 'https://www.flickr.com/photos/91501748@N07/8566832944',
    alt: 'Model kit Master Grade del Delta Plus fotografiado sobre fondo negro.',
  },
  'hub-personajes': {
    titulo: 'Singapore Gundam Model Kit Challenge 2008 - Hallelujah Rescue Campaign',
    autor: 'animaster',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/19043905@N06/3037571181',
    alt: 'Diorama con dos model kits en una escena de combate sobre ruinas.',
  },
  'hub-series': {
    titulo: 'BANDAI GUNPLA HG',
    autor: 'othree',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/12452841@N00/9486180634',
    alt: 'Vitrina con varios model kits de la línea High Grade expuestos.',
  },
  'hub-tiendas': {
    titulo: 'Gundam Model Kit Challenge - Takashimaya Singapore',
    autor: 'animaster',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/19043905@N06/3045931836',
    alt: 'Interior de una tienda de hobby con vitrinas de model kits.',
  },
  'hub-universos': {
    titulo: 'Causeway Bay Gundam EXPO Event',
    autor: 'Marco Hazard',
    licencia: 'CC BY-SA 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    fuente: 'https://www.flickr.com/photos/42405591@N02/20817729638',
    alt: 'Estatua a escala real del RX-0 Unicorn Gundam instalada en la vía pública.',
  },
  'ms-exia': {
    titulo: 'GUNDAM EXIA (REAL GRADE KIT)',
    autor: 'fotowesley',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/48923585@N06/14238127994',
    alt: 'Model kit Real Grade del GN-001 Gundam Exia.',
  },
  'ms-nu': {
    titulo: 'Nu Gundam',
    autor: 'tsuihin - TimoStudios',
    licencia: 'CC BY-SA 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    fuente: 'https://www.flickr.com/photos/19136074@N06/3118122178',
    alt: 'Model kit del RX-93 Nu Gundam armado.',
  },
  'ms-sazabi': {
    titulo: 'Sazabi',
    autor: 'othree',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/12452841@N00/14981199119',
    alt: 'Model kit del MSN-04 Sazabi armado.',
  },
  'ms-wing': {
    titulo: 'Wing GUNDAM',
    autor: 'othree',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/12452841@N00/14981296288',
    alt: 'Model kit del XXXG-01W Wing Gundam armado.',
  },
  'ms-zaku-ii': {
    titulo: 'MS-06S Zaku II',
    autor: 'JohnWCoke',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/86371376@N05/7912612886',
    alt: 'Model kit del MS-06S Zaku II armado.',
  },
  'ms-zeta': {
    titulo: 'Zeta Elevates',
    autor: 'JohnWCoke',
    licencia: 'CC BY 2.0',
    licenciaUrl: 'https://creativecommons.org/licenses/by/2.0/',
    fuente: 'https://www.flickr.com/photos/86371376@N05/8001402471',
    alt: 'Model kit del MSZ-006 Zeta Gundam armado.',
  },
};
