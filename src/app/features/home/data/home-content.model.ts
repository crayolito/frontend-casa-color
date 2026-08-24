export type HomeTextPosition = 'top' | 'middle' | 'bottom';
export type HomeScheme = 'dark' | 'light';
export type HomeDestinationType = 'category' | 'catalog' | 'product';

export interface HomeDestination {
  type: HomeDestinationType;
  id: number;
  slug: string;
  name: string;
}

/** Forma legacy / UI del header (el backend ahora manda shape plano). */
export interface HomeLogo {
  type: 'icon' | 'image';
  iconName?: string;
  imageUrl?: string;
  altText?: string;
}

/**
 * Header del home.
 * Backend nuevo: { imageUrl, altText?, link? }.
 * Legacy: { logo: HomeLogo }.
 * El frontend acepta ambos.
 */
export interface HomeHeader {
  imageUrl?: string;
  altText?: string;
  link?: string;
  logo?: HomeLogo;
}

export interface HomeSlide {
  id: string;
  imageUrl: string;
  title?: string;
  buttonText?: string;
  buttonDestination?: HomeDestination;
  /** Legacy: se tolera un ciclo si aún viene del seed viejo. */
  buttonLink?: string;
  textPosition?: HomeTextPosition;
  scheme?: HomeScheme;
}

export interface HomeBanner {
  autoplay: boolean;
  intervalMs: number;
  slides: HomeSlide[];
}

export interface HomeFindProduct {
  title: string;
  imageUrl?: string;
  /** Imagen entre banner y esta sección. */
  decorImageUrl?: string;
  buttonText?: string;
  buttonDestination?: HomeDestination;
  buttonLink?: string;
  sectionBgColor?: string;
  sectionTextColor?: string;
}

export interface HomeCategoryProduct {
  id: number;
  title: string;
  slug: string;
}

export interface HomeCategoryCatalog {
  id: number;
  name: string;
  slug: string;
  products: HomeCategoryProduct[];
}

export interface HomeResolvedCategory {
  categoryId: number;
  name: string;
  slug: string;
  displayOrder: number;
  description: string | null;
  description2: string | null;
  imageUrl: string | null;
  catalogs: HomeCategoryCatalog[];
}

export interface HomeCategories {
  title: string;
  items: HomeResolvedCategory[];
}

export interface HomeSocialLink {
  url?: string;
  show: boolean;
}

export interface HomeSocial {
  whatsapp?: HomeSocialLink;
  instagram: HomeSocialLink;
  tiktok: HomeSocialLink;
  facebook: HomeSocialLink;
  /** Legacy: se tolera un ciclo si aún viene del seed viejo. */
  twitter?: HomeSocialLink;
}

export interface HomeCopyright {
  text: string;
  designBy: string;
  designByHref?: string;
}

export interface HomeFooterColumnLink {
  label: string;
  href: string;
}

export interface HomeFooterColumn {
  type?: 'text' | 'links' | 'html';
  lines?: string[];
  links?: HomeFooterColumnLink[];
  /** Descripción HTML (type=html). */
  html?: string;
}

export interface HomeFooter {
  topImageUrl?: string;
  logoUrl?: string;
  columns?: HomeFooterColumn[];
  /** Color de fondo del bloque rojo del footer. */
  widgetsBgColor?: string;
  /** Color de texto del bloque rojo del footer. */
  widgetsTextColor?: string;
  /** @deprecated Preferí `columns`. */
  address?: string[];
  /** @deprecated Preferí `columns`. */
  phones?: string[];
  /** @deprecated Preferí columns con type links. */
  legalLinks?: Array<{ label: string; href: string }>;
  social: HomeSocial;
  copyright: HomeCopyright;
}

export interface HomeWhatsapp {
  enabled: boolean;
  phone?: string;
  message?: string;
}

export interface HomeFloating {
  whatsapp: HomeWhatsapp;
}

export type HomeNavDestinationType = 'category' | 'catalog' | 'page';

export interface HomeNavDestination {
  type: HomeNavDestinationType;
  slug?: string;
  name?: string;
}

export interface HomeNavSubItem {
  id: string;
  label: string;
  destination?: HomeNavDestination;
}

export interface HomeNavItem {
  id: string;
  label: string;
  destination?: HomeNavDestination;
  children: HomeNavSubItem[];
}

export interface HomeNav {
  items: HomeNavItem[];
}

export interface HomeContent {
  header: HomeHeader;
  banner: HomeBanner;
  findProduct: HomeFindProduct;
  categories: HomeCategories;
  footer: HomeFooter;
  floating?: HomeFloating;
  nav?: HomeNav;
}

export interface HomeCategoryItemWrite {
  categoryId: number;
  displayOrder: number;
  description?: string;
  description2?: string;
  imageUrl?: string;
}

export interface HomeCategoriesWrite {
  title: string;
  items: HomeCategoryItemWrite[];
}

export type HomeSection =
  | 'header'
  | 'banner'
  | 'find-product'
  | 'categories'
  | 'footer'
  | 'floating'
  | 'nav';

/** Páginas fijas del sitio (menú del header). */
export const HOME_PAGE_OPTIONS: Array<{ value: string; label: string; href: string }> = [
  { value: 'contacto', label: 'Contacto', href: '/contacto' },
  { value: 'cartas-de-color', label: 'Cartas de color', href: '/cartas-de-color' },
  { value: 'fichas-tecnicas', label: 'Fichas técnicas', href: '/fichas-tecnicas' },
  { value: 'catalogos', label: 'Catálogos', href: '/catalogos' },
  { value: 'empresa', label: 'Empresa', href: '/empresa' },
];

/** Arma el href público a partir de un destino tipado. */
export function destinationHref(dest?: HomeDestination | null): string | null {
  if (!dest?.type || !dest.slug) {
    return null;
  }
  switch (dest.type) {
    case 'category':
      return `/categoria/${encodeURIComponent(dest.slug)}`;
    case 'catalog':
      return `/catalogo/${encodeURIComponent(dest.slug)}`;
    case 'product':
      return `/producto/${encodeURIComponent(dest.slug)}`;
    default:
      return null;
  }
}

/** Href para destinos del menú del header (incluye páginas fijas). */
export function navDestinationHref(dest?: HomeNavDestination | null): string {
  if (!dest?.type) return '#';
  if (dest.type === 'page') {
    const page = HOME_PAGE_OPTIONS.find((p) => p.value === dest.slug);
    return page?.href ?? (dest.slug ? `/${dest.slug}` : '#');
  }
  if (!dest.slug) return '#';
  if (dest.type === 'category') {
    return `/categoria/${encodeURIComponent(dest.slug)}`;
  }
  if (dest.type === 'catalog') {
    return `/catalogo/${encodeURIComponent(dest.slug)}`;
  }
  return '#';
}

/** Prefer destination; cae a buttonLink legacy si existe. */
export function resolveCtaHref(opts: {
  buttonDestination?: HomeDestination;
  buttonLink?: string;
}): string | null {
  const fromDest = destinationHref(opts.buttonDestination);
  if (fromDest) return fromDest;
  if (opts.buttonLink?.trim()) return opts.buttonLink.trim();
  return null;
}

/** Normaliza header plano o legacy a HomeLogo para el UI. */
export function headerToLogo(header: HomeHeader | null | undefined): HomeLogo | null {
  if (!header) return null;
  if (header.logo) return header.logo;
  if (header.imageUrl) {
    return {
      type: 'image',
      imageUrl: header.imageUrl,
      altText: header.altText,
    };
  }
  return null;
}
