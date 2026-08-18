export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  description2: string | null;
  coverImageUrl: string | null;
  cardImageUrl: string | null;
  showCoverImage?: boolean;
  createdAt: string;
  updatedAt: string;
  catalogsCount?: number;
}

export interface CategoryWrite {
  name: string;
  slug?: string;
  description?: string;
  description2?: string;
  coverImageUrl?: string;
  cardImageUrl?: string;
  showCoverImage?: boolean;
}

export interface Catalog {
  id: number;
  categoryId: number | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  showCoverImage?: boolean;
  pdfUrl: string | null;
  pdfButtonLabel: string;
  createdAt: string;
  updatedAt: string;
  extraCategoryIds: number[];
  extraCategories: Array<{ id: number; name: string; slug: string }>;
  productsCount?: number;
}

export interface CatalogWrite {
  categoryId?: number | null;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  showCoverImage?: boolean;
  pdfUrl?: string | null;
  pdfButtonLabel?: string;
  extraCategoryIds?: number[];
}

export interface ProductCatalogRef {
  id: number;
  name: string;
  slug?: string;
  categoryId: number | null;
  categoryName: string;
  categorySlug?: string;
}

export interface Product {
  id: number;
  catalogId: number | null;
  catalogs: ProductCatalogRef[];
  title: string;
  slug: string;
  description: string | null;
  mainImageUrl: string | null;
  technicalSheetUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  presentations: Array<{ id: number; value: string; displayOrder: number }>;
  finishes: Array<{
    id: number;
    name: string;
    imageUrl: string | null;
    displayOrder: number;
  }>;
  colors: Array<{
    id: number;
    name: string;
    hexCode: string | null;
    imageUrl: string | null;
    displayOrder: number;
  }>;
  colorsCount?: number;
  sections: Array<{
    id: number;
    title: string;
    icon: string | null;
    titleColor: string | null;
    content: string;
    displayOrder: number;
  }>;
  images: Array<{
    id: number;
    url: string;
    publicId: string;
    isMain: boolean;
    displayOrder: number;
  }>;
}

export interface ProductWrite {
  catalogId?: number;
  catalogIds?: number[];
  title: string;
  slug?: string;
  description?: string;
  mainImageUrl?: string;
  technicalSheetUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
  presentations?: Array<{ value: string; displayOrder?: number }>;
  finishes?: Array<{ name: string; imageUrl?: string; displayOrder?: number }>;
  colors?: Array<{
    name: string;
    hexCode?: string;
    imageUrl?: string;
    displayOrder?: number;
  }>;
  sections?: Array<{
    title: string;
    icon?: string;
    titleColor?: string;
    content: string;
    displayOrder?: number;
  }>;
  images?: Array<{
    url: string;
    publicId?: string;
    isMain?: boolean;
    displayOrder?: number;
  }>;
}

export interface ColorCard {
  id: number;
  imageUrl: string | null;
  titlePrefix: string;
  titleStrong: string;
  descriptionHtml: string | null;
  buttonLabel: string;
  pdfUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ColorCardWrite {
  imageUrl?: string | null;
  titlePrefix: string;
  titleStrong: string;
  descriptionHtml?: string | null;
  buttonLabel: string;
  pdfUrl?: string | null;
  sortOrder?: number;
}

export interface FichasTecnicasCategoryConfig {
  categoryId: number;
  imageUrl: string | null;
  label: string;
}

export interface FichasTecnicasSettings {
  heroImageUrl: string | null;
  heading: string;
  categories: FichasTecnicasCategoryConfig[];
}

export interface FichasTecnicasProduct {
  id: number;
  title: string;
  slug: string;
  technicalSheetUrl: string;
}

export interface FichasTecnicasCatalog {
  id: number;
  name: string;
  slug: string;
  products: FichasTecnicasProduct[];
}

export interface FichasTecnicasCategoryPublic {
  categoryId: number;
  label: string;
  imageUrl: string | null;
  slug: string;
  name: string;
  catalogs: FichasTecnicasCatalog[];
}

export interface FichasTecnicasPublic {
  heroImageUrl: string | null;
  heading: string;
  categories: FichasTecnicasCategoryPublic[];
}

export interface Branch {
  id: number;
  name: string;
  addressLines: string[];
  phone: string;
  email: string;
  hours: string[];
  lat: number;
  lng: number;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BranchWrite {
  name: string;
  addressLines: string[];
  phone: string;
  email: string;
  hours: string[];
  lat: number;
  lng: number;
  imageUrl?: string | null;
  sortOrder?: number;
}

export interface ContactoSettings {
  heroImageUrl: string;
  centralAddressLines: string[];
  centralPhone: string;
  centralWhatsapp: string;
  centralEmail: string;
  attentionLabel: string;
  infoRequestLabel: string;
}

export interface EmpresaHero {
  imageUrl: string;
}

export interface EmpresaSection {
  id: string;
  title: string;
  titleColor?: string;
  descriptionHtml: string;
  largeImageUrl?: string;
  sideImageUrl?: string;
  sortOrder: number;
}

export interface EmpresaContent {
  hero: EmpresaHero;
  sections: EmpresaSection[];
}

/** Contenido de una página legal (aviso-legal / politica-datos). */
export interface LegalPageSettings {
  title: string;
  bodyHtml: string;
}

export interface ContactoPublicPage {
  settings: ContactoSettings;
  branches: Branch[];
}

export interface SiteSetting {
  key: string;
  value: Record<string, unknown>;
  updatedAt: string;
}

/** Íconos fijos del producto público para el picker de secciones. */
export const PRODUCT_SECTION_ICONS = [
  { key: 'descripcion', path: '/img/productos/icono-descripcion-100px.png', label: 'Descripción' },
  { key: 'presentacion', path: '/img/productos/icono-presentacion-100px.png', label: 'Presentación' },
  { key: 'acabados', path: '/img/productos/icono-acabados-100px.png', label: 'Acabados' },
  { key: 'color', path: '/img/productos/icono-color-100px.png', label: 'Color' },
  { key: 'usos', path: '/img/productos/icono-usos-100px.png', label: 'Usos' },
  { key: 'preparacion', path: '/img/productos/icono-preparacion-100px.png', label: 'Preparación' },
  { key: 'conservacion', path: '/img/productos/icono-conservacion-100px.png', label: 'Conservación' },
  { key: 'aplicacion', path: '/img/productos/icono-aplicacion-100px.png', label: 'Aplicación' },
  { key: 'caracteristicas', path: '/img/productos/icono-caracteristicas-100px.png', label: 'Características' },
  { key: 'seguridad', path: '/img/productos/icono-seguridad-100px.png', label: 'Seguridad' },
] as const;
