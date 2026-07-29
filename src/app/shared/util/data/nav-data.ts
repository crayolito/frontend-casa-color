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

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'DECORACIÓN',
    href: '#',
    children: [{ label: 'LÍNEA DECO', href: '#' }],
  },
  {
    label: 'INDUSTRIA',
    href: '#',
    children: [{ label: 'LÍNEA TECNO', href: '#' }],
  },
  {
    label: 'ARTE',
    href: '#',
    children: [{ label: 'EN DESARROLLO', href: '#' }],
  },
  {
    label: 'DOCUMENTACIÓN',
    href: '#',
    children: [
      { label: 'CARTAS DE COLOR', href: '/cartas-de-color' },
      { label: 'FICHAS TÉCNICAS', href: '/fichas-tecnicas' },
    ],
  },
  { label: 'CONTACTO', href: '/contacto' },
];

/** Jerarquía del off-canvas mobile (misma estructura que NAV_ITEMS). */
export const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { label: 'DECORACIÓN', children: [{ label: 'LÍNEA DECO', href: '#' }] },
  { label: 'INDUSTRIA', children: [{ label: 'LÍNEA TECNO', href: '#' }] },
  { label: 'ARTE', children: [{ label: 'EN DESARROLLO', href: '#' }] },
  {
    label: 'DOCUMENTACIÓN',
    children: [
      { label: 'CARTAS DE COLOR', href: '/cartas-de-color' },
      { label: 'FICHAS TÉCNICAS', href: '/fichas-tecnicas' },
    ],
  },
  { label: 'CONTACTO', href: '/contacto' },
];
