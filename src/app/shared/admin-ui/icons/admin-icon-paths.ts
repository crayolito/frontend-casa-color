/**
 * Path markup de íconos admin (sin wrapper <svg>).
 * Separado del componente para no ensuciar el template con paths largos.
 *
 * Deuda: SVGs inline siguen en header/search-overlay/mobile-menu/
 * contact-info-block/hero-slider/fichas-toggle y catalogos.css (frontend público).
 */
export type AdminIconName =
  | 'search'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'logout'
  | 'categories'
  | 'catalogs'
  | 'products'
  | 'settings'
  | 'image'
  | 'x'
  | 'lock'
  | 'upload'
  | 'star'
  | 'menu'
  | 'eye'
  | 'eye-off'
  | 'panel-left'
  | 'list'
  | 'check'
  | 'alert'
  | 'info';

export const ADMIN_ICON_PATHS: Record<AdminIconName, string> = {
  search: `
    <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" />
    <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  `,
  plus: `
    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  `,
  edit: `
    <path d="M4 20h4l10-10-4-4L4 16v4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M13 7l4 4" stroke="currentColor" stroke-width="1.5" />
  `,
  trash: `
    <path d="M4 7h16M9 7V5h6v2M8 7l1 12h6l1-12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  `,
  logout: `
    <path d="M10 7V5a2 2 0 012-2h6a2 2 0 012 2v14a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M15 12H4m0 0l3-3m-3 3l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  `,
  categories: `
    <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  `,
  catalogs: `
    <rect x="4" y="4" width="7" height="7" stroke="currentColor" stroke-width="1.5" />
    <rect x="13" y="4" width="7" height="7" stroke="currentColor" stroke-width="1.5" />
    <rect x="4" y="13" width="7" height="7" stroke="currentColor" stroke-width="1.5" />
    <rect x="13" y="13" width="7" height="7" stroke="currentColor" stroke-width="1.5" />
  `,
  products: `
    <path d="M4 8l8-4 8 4v8l-8 4-8-4V8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M12 12v8M4 8l8 4 8-4" stroke="currentColor" stroke-width="1.5" />
  `,
  settings: `
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  `,
  image: `
    <rect x="3" y="5" width="18" height="14" rx="0" stroke="currentColor" stroke-width="1.5" />
    <circle cx="9" cy="10" r="1.5" stroke="currentColor" stroke-width="1.5" />
    <path d="M3 16l5-4 4 3 3-2 6 3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
  `,
  x: `
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  `,
  lock: `
    <rect x="5" y="11" width="14" height="10" stroke="currentColor" stroke-width="1.5" />
    <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  `,
  upload: `
    <path d="M12 16V5m0 0l-4 4m4-4l4 4M4 19h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  `,
  star: `
    <path d="M12 3l2.5 6.5H21l-5 4 2 6.5L12 16l-6 4 2-6.5-5-4h6.5L12 3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
  `,
  menu: `
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  `,
  eye: `
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" />
  `,
  'eye-off': `
    <path d="M3 3l18 18M10.5 10.5a3 3 0 004 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M6.5 6.8C4.2 8.3 2.5 11 2.5 12s3.5 7 9.5 7c1.7 0 3.2-.4 4.5-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M14.1 9.1A3 3 0 0012 9c-1.7 0-3 1.3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M17.5 6.5C19 7.8 20.5 10 21.5 12c0 0-1.2 2.5-3.2 4.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  `,
  'panel-left': `
    <rect x="3" y="4" width="18" height="16" rx="1" stroke="currentColor" stroke-width="1.5" />
    <path d="M9 4v16" stroke="currentColor" stroke-width="1.5" />
  `,
  list: `
    <path d="M8 6h12M8 12h12M8 18h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <circle cx="4" cy="6" r="1" fill="currentColor" />
    <circle cx="4" cy="12" r="1" fill="currentColor" />
    <circle cx="4" cy="18" r="1" fill="currentColor" />
  `,
  check: `
    <path d="M5 12l4.5 4.5L19 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  `,
  alert: `
    <path d="M12 4l9 16H3L12 4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M12 10v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <circle cx="12" cy="16.5" r="0.75" fill="currentColor" />
  `,
  info: `
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.5" />
    <path d="M12 11v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <circle cx="12" cy="8" r="0.9" fill="currentColor" />
  `,
};
