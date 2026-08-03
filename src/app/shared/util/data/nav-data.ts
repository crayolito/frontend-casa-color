export interface SubMenuItem {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: SubMenuItem[];
}

export interface MobileNavItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

/** Fallback si `home.nav` llega vacío. Preferir siempre el setting en DB. */
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'PRODUCTOS',
    href: '#',
    children: [
      { label: 'PINTURAS INTERIORES', href: '/categoria/pinturas-interiores' },
      { label: 'PINTURAS EXTERIORES', href: '/categoria/pinturas-exteriores' },
      { label: 'ESMALTES', href: '/categoria/esmaltes' },
      { label: 'MADERAS', href: '/categoria/maderas' },
    ],
  },
  { label: 'CATÁLOGOS', href: '/catalogos' },
  {
    label: 'DOCUMENTACIÓN',
    href: '#',
    children: [
      { label: 'CARTAS DE COLOR', href: '/cartas-de-color' },
      { label: 'FICHAS TÉCNICAS', href: '/fichas-tecnicas' },
    ],
  },
  { label: 'EMPRESA', href: '/empresa' },
  { label: 'CONTACTO', href: '/contacto' },
];

/** Jerarquía del off-canvas mobile (misma estructura que NAV_ITEMS). */
export const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  {
    label: 'PRODUCTOS',
    children: [
      { label: 'PINTURAS INTERIORES', href: '/categoria/pinturas-interiores' },
      { label: 'PINTURAS EXTERIORES', href: '/categoria/pinturas-exteriores' },
      { label: 'ESMALTES', href: '/categoria/esmaltes' },
      { label: 'MADERAS', href: '/categoria/maderas' },
    ],
  },
  { label: 'CATÁLOGOS', href: '/catalogos' },
  {
    label: 'DOCUMENTACIÓN',
    children: [
      { label: 'CARTAS DE COLOR', href: '/cartas-de-color' },
      { label: 'FICHAS TÉCNICAS', href: '/fichas-tecnicas' },
    ],
  },
  { label: 'EMPRESA', href: '/empresa' },
  { label: 'CONTACTO', href: '/contacto' },
];
