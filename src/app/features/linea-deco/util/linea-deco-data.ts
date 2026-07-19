export interface CategoryCard {
  title: string;
  href: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
}

/** Textos de la intro en 2 columnas del clon (index.html:290 y 302). */
export const LINEA_DECO_INTRO = {
  left: 'es un mundo de color. Una riqueza de colores que nos inspiran y deleitan. Una línea compuesta por una extensa gama de productos que responden a las necesidades de cualquier decoración o la protección de cualquier superficie del hábitat. Pinturas mates y decorativas, de colores mágicos y sorprendentes.',
  right:
    'Esmaltes y barnices de colores actuales, que combinan con las distintas tendencias y estilos decorativos. Veladuras y tierras florentinas para lucir una alta decoración. Y todos los productos auxiliares necesarios: tintes, decapantes, masillas, sellantes o reparadores, para hacer de la decoración una obra perfecta.',
};

/** Grilla de cards del clon (index.html:310-473): 2 filas × 4 cols, la 8va celda vacía. */
export const CATEGORY_CARDS: CategoryCard[] = [
  {
    title: 'PINTURA MATE Y DECORATIVA',
    href: '#',
    image: '/img/categorias/pintura-mate-decorativa-destacada-1.jpg',
    imageWidth: 2000,
    imageHeight: 1333,
  },
  {
    title: 'TRATAMIENTO DE FACHADAS',
    href: '#',
    image: '/img/categorias/tratamiento-fachadas-destacada.jpg',
    imageWidth: 2000,
    imageHeight: 1333,
  },
  {
    title: 'PINTURA SATINADA',
    href: '#',
    image: '/img/categorias/pintura-satinada-small.jpg',
    imageWidth: 600,
    imageHeight: 400,
  },
  {
    title: 'VIVIENDAS E INSTALACIONES DEPORTIVAS',
    href: '#',
    image: '/img/categorias/viviendas-instalaciones-deportivas-small.jpg',
    imageWidth: 600,
    imageHeight: 400,
  },
  {
    title: 'ESMALTES, IMPRIMACIONES Y BARNICES',
    href: '#',
    image: '/img/categorias/esmaltes-selladoras-barnices-small.jpg',
    imageWidth: 600,
    imageHeight: 400,
  },
  {
    title: 'PRODUCTOS AUXILIARES',
    href: '#',
    image: '/img/categorias/productos-auxiliares-small.jpg',
    imageWidth: 600,
    imageHeight: 400,
  },
  {
    title: 'SISTEMA TINTOMÉTRICO DECO',
    href: '#',
    image: '/img/categorias/sistema-tintometrico-tecno-small-1.jpg',
    imageWidth: 600,
    imageHeight: 400,
  },
];
