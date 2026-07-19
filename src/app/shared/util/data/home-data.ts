export interface NavItem {
  label: string;
  href: string;
  megaMenu?: CategoryLine;
}

export type ProductLine = 'art' | 'deco' | 'tecno';
export type HeroTextPosition = 'top' | 'middle' | 'bottom';
export type HeroScheme = 'dark' | 'light';

export interface HeroSlide {
  line: ProductLine;
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
  textPosition: HeroTextPosition;
  /** 'dark' = fondo oscuro con texto blanco; 'light' = fondo claro con texto oscuro */
  scheme: HeroScheme;
  backgroundImage: string;
}

export interface CategoryGroup {
  title: string;
  products: string[];
}

export interface CategoryLine {
  title: string;
  description: string;
  logo: string;
  href: string;
  groups: CategoryGroup[];
}

export interface FooterData {
  logo: string;
  address: string[];
  phones: string[];
  legalLinks: { label: string; href: string }[];
  copyright: {
    line1: string;
    designByText: string;
    designByHref: string;
    designByLabel: string;
  };
}

export interface MobileNavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

export const CATEGORY_LINES: CategoryLine[] = [
  {
    title: 'Decoración',
    description:
      'Línea Deco es un mundo de color. Una riqueza de colores que nos inspiran y deleitan.',
    logo: '/img/logos/logo-linea-deco.jpg',
    href: '#',
    groups: [
      {
        title: 'MATE Y DECORATIVA',
        products: [
          'Acrílico',
          'Acrílico Color',
          'Acrílico SP 300 Blanco',
          'EMI/25',
          'Hidrófugo',
          'Plástico para Picar',
          'Rugoso',
          'S200',
          'Tinmate',
        ],
      },
      {
        title: 'TRATAMIENTO DE FACHADAS',
        products: [
          'Emulsión Hidrófuga',
          'Especial Fachadas',
          'Liso Ecológico',
          'Liso Elástico',
          'Mayencolor Liso',
          'Mayencolor Rugoso',
          'Pintura Fachadas al Pliolite',
          'Revestimiento Liso Fachadas',
          'Rugoso Elástico',
        ],
      },
      {
        title: 'PINTURA SATINADA',
        products: [
          'Mate Premium',
          'Satinada Alto Brillo',
          'Satinada Premium',
          'Seda Sport',
          'Tinsatín',
        ],
      },
      {
        title: 'VIVIENDAS E INSTALACIONES DEPORTIVAS',
        products: [
          'Antigoteras',
          'Clorocaucho Piscinas',
          'Fibraelastik',
          'Impermeabilizante 130',
          'Impermeabilizante Elastik Premium',
          'Impermeabilizante Membrana de Poliuretano',
          'Instalaciones Deportivas',
          'Master Antimanchas',
          'Piscinas 230 al Agua',
        ],
      },
      {
        title: 'ESMALTES, SELLADORAS Y BARNICES',
        products: [
          'Imprimación Alcídica',
          'Imprimación Sintética Plus',
          'Imprimación Vinílica Todoterreno',
          'Esmalte Sintético',
          'Imprimación Multiadherente al Agua',
          'Esmalte Forja',
          'Esmalte Martelé',
          'Barniz Marino',
          'Barniz Metales',
          'Barniz Interior',
          'Barniz Exterior',
          'Tapaporos Nitro 160',
          'Acabado Nitro',
          'Aceite de Teka',
          'Aceite de Linaza',
          'Selladora Tixotrópica',
          'Selladora Tridente',
        ],
      },
      {
        title: 'PRODUCTOS AUXILIARES',
        products: [
          'Aditivo Antisilicona',
          'Barniz Fijador',
          'Betún de Judea',
          'Colomplast al Uso',
          'Colomplast Exterior',
          'Colomplast Fibra al Uso',
          'Colomplast Interior',
          'Colomplast Renovación',
          'Convertox',
          'Decapante Líquido',
          'Disolución Antioxidante',
          'Disolución Directa al Óxido',
          'Fondo Penetrante',
          'Hidrofugante',
          'Latex 2000',
          'Latex Concentrado',
          'Matizante Universal',
          'Pasta Decapante N',
          'Protector de Film',
          'Reparador Acrílico',
          'Tintes Lys al Agua',
          'Tintes Universales',
        ],
      },
      {
        title: 'SISTEMA TINTOMÉTRICO',
        products: ['ColorColom Deco'],
      },
    ],
  },
  {
    title: 'Industria',
    description:
      'La línea Tecno aporta soluciones al profesional, con productos de calidad y garantizados.',
    logo: '/img/logos/logo-linea-tecno.jpg',
    href: '#',
    groups: [
      {
        title: 'IMPRIMACIONES',
        products: [
          'Imprimación Alcídica Serie 200',
          'Imprimación Alcídica',
          'Imprimación Alcídica Satinada',
          'Imprimación Alcídica Antioxidante',
          'Imprimación Ignífuga M1',
          'Imprimación Fosfatante Misil Satinado',
          'Shop Primer',
          'Wash Primer + Catalizador',
          'Imprimación Bituminosa',
          'Imprimación Epoxi + Catalizador',
          'Imprimación Epoxi Zinc + Catalizador',
          'Imprimación Epoxi Capa Gruesa + Catalizador',
          'Imprimación Vinílica Todoterreno',
        ],
      },
      {
        title: 'ACABADOS PARA METALES',
        products: [
          'Esmalte Secado Rápido',
          'Esmalte Secado Rápido Antioxidante',
          'Esmalte Tornado',
          'Esmalte Tornado Antioxidante',
          'Esmalte Sintético',
          'Esmalte Sintético Antioxidante',
          'Esmalte Estructuras Bravo',
          'Esmalte Clorocaucho',
          'Esmalte Multiadherente',
          'Esmalte Ignífugo',
          'Esmalte Uretanado',
          'Esmalte Forja',
          'Esmalte Poliuretano Spol 1',
          'Esmalte Poliuretano Spol 2 + Catalizador',
          'Esmalte Poliuretano Galvanizado + Catalizador',
          'Esmalte Acabado Epoxi + Catalizador',
          'Aluminio PR 250-300ºC',
          'Anticalórico 500ºC Aluminio',
          'Anticalórico 500ºC Negro',
        ],
      },
      {
        title: 'PAVIMENTOS',
        products: [
          'Clorocaucho Suelos',
          'Señalización Acrílica',
          'Barniz Acrílico',
          'Barniz Antipolvo Epoxi + Catalizador',
          'Fijador Epoxi Suelos + Catalizador',
          'Epoxi Suelos + Catalizador',
          'Epoxi Suelos LK + Catalizador',
          'Epoxi Suelos 100% + Catalizador',
          'Epoxi Suelos al Agua + Catalizador',
          'Epoxi Autonivelante + Catalizador',
          'Metacrílico',
          'Poliuretano Suelos + Catalizador',
          'Barniz Poliuretano Suelos + Catalizador',
        ],
      },
      {
        title: 'DISOLVENTES',
        products: [
          'Disolvente Universal',
          'Disolvente Limpieza',
          'Disolvente Epoxi',
          'Disolvente NP',
          'Disolvente SAC',
          'Disolvente Esmaltes Sintéticos',
          'Disolvente Desodorizado',
          'Disolvente Misil',
        ],
      },
      {
        title: 'SISTEMA TINTOMÉTRICO',
        products: ['ColorColom Tecno'],
      },
    ],
  },
  {
    title: 'Arte',
    description:
      'Línea Art es la gama más completa de productos para la ornamentación y el arte del mercado.',
    logo: '/img/logos/logo-linea-art.jpg',
    href: '#',
    groups: [
      { title: 'PINTURAS', products: ['En desarrollo'] },
      { title: 'AUXILIARES AL AGUA', products: ['En desarrollo'] },
      { title: 'AUXILIARES SINTÉTICOS', products: ['En desarrollo'] },
      { title: 'PINCELES', products: ['En desarrollo'] },
      { title: 'EXPOSITORES', products: ['En desarrollo'] },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'DECORACIÓN',
    href: '#',
    megaMenu: CATEGORY_LINES[0],
  },
  {
    label: 'INDUSTRIA',
    href: '#',
    megaMenu: CATEGORY_LINES[1],
  },
  {
    label: 'ARTE',
    href: '#',
    megaMenu: CATEGORY_LINES[2],
  },
  { label: 'DOCUMENTACIÓN', href: '#' },
  { label: 'EMPRESA', href: '#' },
  { label: 'CONTACTO', href: '#' },
];

/* 9 slides reales del sitio original: cada línea tiene 3 variantes con
   imagen, posición de texto y esquema de color propios. Art nunca lleva CTA. */
export const HERO_SLIDES: HeroSlide[] = [
  {
    line: 'art',
    title: 'Línea Art',
    textPosition: 'top',
    scheme: 'dark',
    backgroundImage: '/img/slides/slide-linea-art-9.jpg',
  },
  {
    line: 'deco',
    title: 'Línea Deco',
    ctaLabel: 'Ver gama',
    ctaHref: '#',
    textPosition: 'top',
    scheme: 'dark',
    backgroundImage: '/img/slides/slide-linea-deco-4.jpg',
  },
  {
    line: 'tecno',
    title: 'Línea Tecno',
    ctaLabel: 'Ver gama',
    ctaHref: '#',
    textPosition: 'top',
    scheme: 'dark',
    backgroundImage: '/img/slides/slide-linea-tecno-1.jpg',
  },
  {
    line: 'art',
    title: 'Línea Art',
    textPosition: 'bottom',
    scheme: 'dark',
    backgroundImage: '/img/slides/slide-linea-art-8.jpg',
  },
  {
    line: 'deco',
    title: 'Línea Deco',
    ctaLabel: 'Ver gama',
    ctaHref: '#',
    textPosition: 'top',
    scheme: 'dark',
    backgroundImage: '/img/slides/linea-deco-imagen-destacada.jpg',
  },
  {
    line: 'tecno',
    title: 'Línea Tecno',
    ctaLabel: 'Ver gama',
    ctaHref: '#',
    textPosition: 'middle',
    scheme: 'light',
    backgroundImage: '/img/slides/slide-linea-tecno-2.jpg',
  },
  {
    line: 'art',
    title: 'Línea Art',
    textPosition: 'bottom',
    scheme: 'light',
    backgroundImage: '/img/slides/slide-linea-art-7.jpg',
  },
  {
    line: 'deco',
    title: 'Línea Deco',
    ctaLabel: 'Ver gama',
    ctaHref: '#',
    textPosition: 'bottom',
    scheme: 'dark',
    backgroundImage: '/img/slides/slide-linea-deco-5.jpg',
  },
  {
    line: 'tecno',
    title: 'Línea Tecno',
    ctaLabel: 'Ver gama',
    ctaHref: '#',
    textPosition: 'middle',
    scheme: 'dark',
    backgroundImage: '/img/slides/slide-linea-tecno-4.jpg',
  },
];

export const FOOTER_DATA: FooterData = {
  logo: '/img/logos/logo-colom-small-white.png',
  address: [
    'Polígono Industrial Sur 8',
    'Avenida Sonella 127',
    '12200 ONDA',
    'Castellón · Spain',
  ],
  phones: ['964 431 110', '964 444 145', '964 521 387'],
  legalLinks: [
    { label: 'Empresa', href: '#' },
    { label: 'Aviso Legal', href: '#' },
    { label: 'Política Protección de Datos', href: '#' },
    { label: 'Contacto', href: '#' },
  ],
  copyright: {
    line1: 'Copyright © 2016 HIJO DE GUILLERMO COLOM, S.A. |  All Rights Reserved',
    designByText: 'Design by',
    designByHref: 'https://cuadernavia.com/',
    designByLabel: 'Cuaderna Vía',
  },
};

/** Jerarquía del off-canvas mobile del original (no reusa megaMenu del desktop). */
export const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { label: 'DECORACIÓN', children: [{ label: 'LÍNEA DECO', href: '#' }] },
  { label: 'INDUSTRIA', children: [{ label: 'LÍNEA TECNO', href: '#' }] },
  { label: 'ARTE', children: [{ label: 'EN DESARROLLO', href: '#' }] },
  {
    label: 'DOCUMENTACIÓN',
    children: [
      { label: 'CATÁLOGOS', href: '#' },
      { label: 'CARTAS DE COLOR', href: '#' },
      { label: 'FICHAS TÉCNICAS', href: '#' },
    ],
  },
  { label: 'EMPRESA', href: '#' },
  { label: 'CONTACTO', href: '#' },
];
