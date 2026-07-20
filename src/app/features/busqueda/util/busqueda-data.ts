/** Datos mockup para la página de búsqueda. */

export type SearchResultType = 'Product' | 'Page';

export interface SearchResultItem {
  title: string;
  href: string;
  image?: string;
  type: SearchResultType;
}

/** Mockup genérico — término hardcodeado para el h1 del clon. */
export const SEARCH_TERM = 'pintura';

export const SEARCH_RESULT_COUNT = 13;

const PRODUCT_IMAGE = '/img/productos/envase-colom-industria-375x400.jpg';

/** Mockup: 3 productos con imagen + 2 páginas sin imagen. */
export const MOCK_RESULTS: SearchResultItem[] = [
  {
    title: 'Acrílico Color',
    href: '/producto/acrilico-color',
    image: PRODUCT_IMAGE,
    type: 'Product',
  },
  {
    title: 'Imprimación alcídica',
    href: '#',
    image: PRODUCT_IMAGE,
    type: 'Product',
  },
  {
    title: 'Esmalte sintético',
    href: '#',
    image: '/img/productos/envase-colom-esmalte-sintetico-4l-375x400.jpg',
    type: 'Product',
  },
  {
    title: 'Inicio',
    href: '/',
    type: 'Page',
  },
  {
    title: 'FICHAS TÉCNICAS',
    href: '/fichas-tecnicas-2',
    type: 'Page',
  },
];
