export interface Category {
  id: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  catalogsCount?: number;
}

export interface CategoryWrite {
  name: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
}

export interface Catalog {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  extraCategoryIds: number[];
  extraCategories: Array<{ id: number; name: string; slug: string }>;
}

export interface CatalogWrite {
  categoryId: number;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  extraCategoryIds?: number[];
}

export interface ProductCatalogRef {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
}

export interface Product {
  id: number;
  catalogId: number;
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
    publicId: string;
    isMain?: boolean;
    displayOrder?: number;
  }>;
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
