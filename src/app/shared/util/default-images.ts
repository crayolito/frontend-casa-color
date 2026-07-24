/** Placeholders locales cuando el admin no cargó imagen. */
export const DEFAULT_IMAGES = {
  logo: '/img/casa-color-logo.jpg',
  product: '/img/img-auxiliar.jpg',
  category: '/img/img-auxiliar2.jpg',
  catalog: '/img/img-auxiliar2.jpg',
} as const;

export function withLogoFallback(url?: string | null): string {
  return url?.trim() ? url : DEFAULT_IMAGES.logo;
}

export function withProductFallback(url?: string | null): string {
  return url?.trim() ? url : DEFAULT_IMAGES.product;
}

export function withCategoryFallback(url?: string | null): string {
  return url?.trim() ? url : DEFAULT_IMAGES.category;
}

export function withCatalogFallback(url?: string | null): string {
  return url?.trim() ? url : DEFAULT_IMAGES.catalog;
}
