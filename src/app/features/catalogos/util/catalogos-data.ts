/** Datos del clon Línea Tecno (clon_colom_listacatalogos/index.html:259-879). */

import { ProductItem } from '../../../shared/ui/product-card/product-item';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface OrderbyOption {
  value: string;
  label: string;
  selected?: boolean;
}

/** index.html:259 — h1.page-title */
export const HEADING = 'Línea Tecno';

/** index.html:271 — woocommerce-breadcrumb */
export const BREADCRUMB: BreadcrumbItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Línea Tecno' },
];

/** index.html:269-270 */
export const RESULT_COUNT = 'Mostrando los 55 resultados';

/** index.html:260-266 — select orderby (visual, no funcional) */
export const ORDERBY_OPTIONS: OrderbyOption[] = [
  { value: 'menu_order', label: 'Orden predeterminado', selected: true },
  { value: 'popularity', label: 'Ordenar por popularidad' },
  { value: 'date', label: 'Ordenar por los últimos' },
  { value: 'price', label: 'Ordenar por precio: bajo a alto' },
  { value: 'price-desc', label: 'Ordenar por precio: alto a bajo' },
];

const PRODUCT_IMAGE = '/img/productos/envase-colom-industria-375x400.jpg';

/** index.html:274-879 — 55 productos */
export const PRODUCTS: ProductItem[] = [
  {
    title: 'Aluminio PR 250-300ºC',
    href: '/producto/aluminio-pr-250-300/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Anticalórico 500ºC Aluminio',
    href: '/producto/anticalorico-500-aluminio/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Anticalórico 500ºC Negro',
    href: '/producto/anticalorico-500-negro/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Barniz acrílico',
    href: '/producto/barniz-acrilico/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Línea Tecno', href: '#' },
    { label: 'Pavimentos', href: '#' }
    ],
  },
  {
    title: 'Barniz antipolvo epoxi + Catalizador',
    href: '/producto/barniz-antipolvo-epoxi-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Línea Tecno', href: '#' },
    { label: 'Pavimentos', href: '#' }
    ],
  },
  {
    title: 'Barniz poliuretano suelos + catalizador',
    href: '/producto/barniz-poliuretano-suelos-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Línea Tecno', href: '#' },
    { label: 'Pavimentos', href: '#' }
    ],
  },
  {
    title: 'Clorocaucho suelos',
    href: '/producto/clorocaucho-suelos/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Línea Tecno', href: '#' },
    { label: 'Pavimentos', href: '#' }
    ],
  },
  {
    title: 'Disolvente desodorizado',
    href: '/producto/disolvente-desodorizado/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Disolventes', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Disolvente epoxi',
    href: '/producto/disolvente-epoxi/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Disolventes', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Disolvente esmaltes sintéticos',
    href: '/producto/disolvente-esmaltes-sinteticos/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Disolventes', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Disolvente limpieza',
    href: '/producto/disolvente-limpieza/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Disolventes', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Disolvente misil',
    href: '/producto/disolvente-misil/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Disolventes', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Disolvente NP',
    href: '/producto/disolvente-np/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Disolventes', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Disolvente SAC',
    href: '/producto/disolvente-sac/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Disolventes', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Disolvente universal',
    href: '/producto/disolvente-universal/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Disolventes', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Epoxi autonivelante + Catalizador',
    href: '/producto/epoxi-autonivelante-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Línea Tecno', href: '#' },
    { label: 'Pavimentos', href: '#' }
    ],
  },
  {
    title: 'Epoxi suelos + Catalizador',
    href: '/producto/epoxi-suelos-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Línea Tecno', href: '#' },
    { label: 'Pavimentos', href: '#' }
    ],
  },
  {
    title: 'Epoxi suelos 100% + Catalizador',
    href: '/producto/epoxi-suelos-100-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Línea Tecno', href: '#' },
    { label: 'Pavimentos', href: '#' }
    ],
  },
  {
    title: 'Epoxi suelos al agua + Catalizador',
    href: '/producto/epoxi-suelos-agua-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Línea Tecno', href: '#' },
    { label: 'Pavimentos', href: '#' }
    ],
  },
  {
    title: 'Epoxi suelos LK + Catalizador',
    href: '/producto/epoxi-suelos-lk-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Línea Tecno', href: '#' },
    { label: 'Pavimentos', href: '#' }
    ],
  },
  {
    title: 'Esmalte acabado epoxi + catalizador',
    href: '/producto/esmalte-acabado-epoxi-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte clorocaucho',
    href: '/producto/esmalte-clorocaucho/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte estructuras bravo',
    href: '/producto/esmalte-estructuras-bravo/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte forja',
    href: '/producto/esmalte-forja-tecno/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte ignífugo',
    href: '/producto/esmalte-ignifugo/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte martelé',
    href: '/producto/esmalte-martele-tecno/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte multiadherente',
    href: '/producto/esmalte-multiadherente/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte poliuretano galvanizado + catalizador',
    href: '/producto/esmalte-poliuretano-galvanizado-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte poliuretano spol 1',
    href: '/producto/esmalte-poliuretano-spol-1/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte poliuretano spol 2 + catalizador',
    href: '/producto/esmalte-poliuretano-spol-2-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte secado rápido',
    href: '/producto/esmalte-secado-rapido/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte secado rápido antioxidante',
    href: '/producto/esmalte-secado-rapido-antioxidante/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte sintético',
    href: '/producto/esmalte-sintetico-2/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte sintético antioxidante',
    href: '/producto/esmalte-sintetico-antioxidante/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte tornado',
    href: '/producto/esmalte-tornado/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte tornado antioxidante',
    href: '/producto/esmalte-tornado-antioxidante/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Esmalte uretanado',
    href: '/producto/esmalte-uretanado/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Acabados para metales', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Fijador epoxi suelos + Catalizador',
    href: '/producto/fijador-expoxi-suelos-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Línea Tecno', href: '#' },
    { label: 'Pavimentos', href: '#' }
    ],
  },
  {
    title: 'Imprimación alcídica',
    href: '/producto/imprimacion-alcidica-tecno/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Imprimaciones', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Imprimación alcídica antioxidante',
    href: '/producto/imprimacion-alcidica-antioxidante/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Imprimaciones', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Imprimación alcídica satinada',
    href: '/producto/imprimacion-alcidica-satinada/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Imprimaciones', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Imprimación alcídica Serie 200',
    href: '/producto/imprimacion-alcidica-serie-200/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Imprimaciones', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Imprimación bituminosa',
    href: '/producto/imprimacion-bituminosa/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Imprimaciones', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Imprimación epoxi + catalizador',
    href: '/producto/imprimacion-epoxi-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Imprimaciones', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Imprimación epoxi capa gruesa + catalizador',
    href: '/producto/imprimacion-epoxi-capa-gruesa-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Imprimaciones', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Imprimación epoxi zinc + catalizador',
    href: '/producto/imprimacion-epoxi-zinc-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Imprimaciones', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Imprimación fosfatante misil satinado',
    href: '/producto/imprimacion-fosfatante-misil-satinado/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Imprimaciones', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Imprimación ignífuga M1',
    href: '/producto/imprimacion-ignifuga-m1/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Imprimaciones', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Imprimación multiadherente al agua',
    href: '/producto/imprimacion-multiadherente-agua-tecno/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'ColorColom Tecno', href: '#' },
    { label: 'Imprimaciones', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Imprimación vinílica todoterreno',
    href: '/producto/imprimacion-vinilica-todoterreno-tecno/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Imprimaciones', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Metacrílico',
    href: '/producto/metacrilico/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Línea Tecno', href: '#' },
    { label: 'Pavimentos', href: '#' }
    ],
  },
  {
    title: 'Poliuretano suelos + catalizador',
    href: '/producto/poliuretano-suelos-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Línea Tecno', href: '#' },
    { label: 'Pavimentos', href: '#' }
    ],
  },
  {
    title: 'Señalización acrílica',
    href: '/producto/senalizacion-acrilica/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Línea Tecno', href: '#' },
    { label: 'Pavimentos', href: '#' }
    ],
  },
  {
    title: 'Shop primer',
    href: '/producto/shop-primer/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Imprimaciones', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  },
  {
    title: 'Wash-Primer + Catalizador',
    href: '/producto/wash-primer-catalizador/',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [
    { label: 'Imprimaciones', href: '#' },
    { label: 'Línea Tecno', href: '#' }
    ],
  }
];

