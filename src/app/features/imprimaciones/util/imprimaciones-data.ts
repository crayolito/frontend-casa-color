/** Datos del clon Imprimaciones (index.html:279-460). */

import { ProductItem } from '../../../shared/ui/product-card/product-item';

export type { ProductItem };

export interface SidebarGroup {
  title: string;
  links: SidebarLink[];
}

export interface SidebarLink {
  label: string;
  href: string;
  current?: boolean;
}

/** index.html:279 — nectar-split-heading h5 */
export const IMPRIMACIONES_HEADING = {
  prefix: 'LÍNEA TECNO | ',
  strong: 'Imprimaciones',
};

/** index.html:290-296 — sidebar vc_col-sm-3 */
export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    title: 'LÍNEA TECNO',
    links: [
      {
        label: 'Imprimaciones',
        href: '/linea-tecno/imprimaciones',
        current: true,
      },
      { label: 'Acabados para metales', href: '#' },
      { label: 'Pavimentos', href: '#' },
      { label: 'Disolventes', href: '#' },
    ],
  },
  {
    title: 'SISTEMA TINTOMÉTRICO TECNO',
    links: [{ label: 'ColorColom Tecno', href: '#' }],
  },
];

const PRODUCT_IMAGE = '/img/productos/envase-colom-industria-375x400.jpg';

const CAT_IMPRIMACIONES = {
  label: 'Imprimaciones',
  href: '#',
};
const CAT_LINEA_TECNO = {
  label: 'Línea Tecno',
  href: '#',
};
const CAT_COLORCOLOM = {
  label: 'ColorColom Tecno',
  href: '#',
};

/** index.html:307-460 — 14 productos, misma imagen placeholder */
export const PRODUCTS: ProductItem[] = [
  {
    title: 'Imprimación alcídica',
    href: '#',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_IMPRIMACIONES, CAT_LINEA_TECNO],
  },
  {
    title: 'Imprimación alcídica antioxidante',
    href: '#',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_IMPRIMACIONES, CAT_LINEA_TECNO],
  },
  {
    title: 'Imprimación alcídica satinada',
    href: '#',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_IMPRIMACIONES, CAT_LINEA_TECNO],
  },
  {
    title: 'Imprimación alcídica Serie 200',
    href: '#',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_IMPRIMACIONES, CAT_LINEA_TECNO],
  },
  {
    title: 'Imprimación bituminosa',
    href: '#',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_IMPRIMACIONES, CAT_LINEA_TECNO],
  },
  {
    title: 'Imprimación epoxi + catalizador',
    href: '#',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_IMPRIMACIONES, CAT_LINEA_TECNO],
  },
  {
    title: 'Imprimación epoxi capa gruesa + catalizador',
    href: '#',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_IMPRIMACIONES, CAT_LINEA_TECNO],
  },
  {
    title: 'Imprimación epoxi zinc + catalizador',
    href: '#',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_IMPRIMACIONES, CAT_LINEA_TECNO],
  },
  {
    title: 'Imprimación fosfatante misil satinado',
    href: '#',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_IMPRIMACIONES, CAT_LINEA_TECNO],
  },
  {
    title: 'Imprimación ignífuga M1',
    href: '#',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_IMPRIMACIONES, CAT_LINEA_TECNO],
  },
  {
    title: 'Imprimación multiadherente al agua',
    href: '#',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_COLORCOLOM, CAT_IMPRIMACIONES, CAT_LINEA_TECNO],
  },
  {
    title: 'Imprimación vinílica todoterreno',
    href: '#',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_IMPRIMACIONES, CAT_LINEA_TECNO],
  },
  {
    title: 'Shop primer',
    href: '#',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_IMPRIMACIONES, CAT_LINEA_TECNO],
  },
  {
    title: 'Wash-Primer + Catalizador',
    href: '#',
    image: PRODUCT_IMAGE,
    imageWidth: 375,
    imageHeight: 400,
    categories: [CAT_IMPRIMACIONES, CAT_LINEA_TECNO],
  },
];
