/**
 * Path markup de íconos admin (sin wrapper <svg>).
 * Set cohesivo estilo Lucide: stroke-width 2, caps/joins round.
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
  | 'home'
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
  | 'info'
  | 'grip-vertical'
  | 'link'
  | 'palette'
  | 'download'
  | 'layout-grid';

const S =
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

export const ADMIN_ICON_PATHS: Record<AdminIconName, string> = {
  search: `
    <circle cx="11" cy="11" r="8" ${S} />
    <path d="m21 21-4.3-4.3" ${S} />
  `,
  plus: `
    <path d="M5 12h14" ${S} />
    <path d="M12 5v14" ${S} />
  `,
  edit: `
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" ${S} />
    <path d="m15 5 4 4" ${S} />
  `,
  trash: `
    <path d="M3 6h18" ${S} />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" ${S} />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" ${S} />
    <line x1="10" x2="10" y1="11" y2="17" ${S} />
    <line x1="14" x2="14" y1="11" y2="17" ${S} />
  `,
  logout: `
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" ${S} />
    <polyline points="16 17 21 12 16 7" ${S} />
    <line x1="21" x2="9" y1="12" y2="12" ${S} />
  `,
  categories: `
    <path d="M4 6h16" ${S} />
    <path d="M4 12h16" ${S} />
    <path d="M4 18h10" ${S} />
  `,
  catalogs: `
    <rect width="7" height="7" x="3" y="3" rx="1" ${S} />
    <rect width="7" height="7" x="14" y="3" rx="1" ${S} />
    <rect width="7" height="7" x="14" y="14" rx="1" ${S} />
    <rect width="7" height="7" x="3" y="14" rx="1" ${S} />
  `,
  products: `
    <path d="m7.5 4.27 9 5.15" ${S} />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" ${S} />
    <path d="m3.3 7 8.7 5 8.7-5" ${S} />
    <path d="M12 22V12" ${S} />
  `,
  settings: `
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" ${S} />
    <circle cx="12" cy="12" r="3" ${S} />
  `,
  home: `
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" ${S} />
    <polyline points="9 22 9 12 15 12 15 22" ${S} />
  `,
  image: `
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" ${S} />
    <circle cx="9" cy="9" r="2" ${S} />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" ${S} />
  `,
  x: `
    <path d="M18 6 6 18" ${S} />
    <path d="m6 6 12 12" ${S} />
  `,
  lock: `
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" ${S} />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" ${S} />
  `,
  upload: `
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" ${S} />
    <polyline points="17 8 12 3 7 8" ${S} />
    <line x1="12" x2="12" y1="3" y2="15" ${S} />
  `,
  star: `
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" ${S} />
  `,
  menu: `
    <line x1="4" x2="20" y1="12" y2="12" ${S} />
    <line x1="4" x2="20" y1="6" y2="6" ${S} />
    <line x1="4" x2="20" y1="18" y2="18" ${S} />
  `,
  eye: `
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" ${S} />
    <circle cx="12" cy="12" r="3" ${S} />
  `,
  'eye-off': `
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" ${S} />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" ${S} />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" ${S} />
    <path d="m2 2 20 20" ${S} />
  `,
  'panel-left': `
    <rect width="18" height="18" x="3" y="3" rx="2" ${S} />
    <path d="M9 3v18" ${S} />
  `,
  list: `
    <path d="M3 12h.01" ${S} />
    <path d="M3 18h.01" ${S} />
    <path d="M3 6h.01" ${S} />
    <path d="M8 12h13" ${S} />
    <path d="M8 18h13" ${S} />
    <path d="M8 6h13" ${S} />
  `,
  check: `
    <path d="M20 6 9 17l-5-5" ${S} />
  `,
  alert: `
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" ${S} />
    <path d="M12 9v4" ${S} />
    <path d="M12 17h.01" ${S} />
  `,
  info: `
    <circle cx="12" cy="12" r="10" ${S} />
    <path d="M12 16v-4" ${S} />
    <path d="M12 8h.01" ${S} />
  `,
  'grip-vertical': `
    <circle cx="9" cy="12" r="1" ${S} />
    <circle cx="9" cy="5" r="1" ${S} />
    <circle cx="9" cy="19" r="1" ${S} />
    <circle cx="15" cy="12" r="1" ${S} />
    <circle cx="15" cy="5" r="1" ${S} />
    <circle cx="15" cy="19" r="1" ${S} />
  `,
  link: `
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" ${S} />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" ${S} />
  `,
  palette: `
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" ${S} />
  `,
  download: `
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" ${S} />
    <polyline points="7 10 12 15 17 10" ${S} />
    <line x1="12" x2="12" y1="15" y2="3" ${S} />
  `,
  'layout-grid': `
    <rect width="7" height="7" x="3" y="3" rx="1" ${S} />
    <rect width="7" height="7" x="14" y="3" rx="1" ${S} />
    <rect width="7" height="7" x="14" y="14" rx="1" ${S} />
    <rect width="7" height="7" x="3" y="14" rx="1" ${S} />
  `,
};
