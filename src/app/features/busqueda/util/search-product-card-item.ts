import { PublicCatalog } from '../../../core/http/catalogs-public.api';
import { PublicCategory } from '../../../core/http/categories-public.api';
import { PublicProduct } from '../../../core/http/products-public.api';
import { DEFAULT_IMAGES } from '../../../shared/util/default-images';

export type SearchProductCardType = 'producto' | 'categoria' | 'catalogo';

export interface SearchProductCardItem {
  title: string;
  href: string;
  image?: string;
  type: SearchProductCardType;
}

const BADGE_ES: Record<SearchProductCardType, string> = {
  producto: 'Producto',
  categoria: 'Categoría',
  catalogo: 'Catálogo',
};

export function searchProductCardBadge(type: SearchProductCardType): string {
  return BADGE_ES[type];
}

export function mapProductToSearchCard(p: PublicProduct): SearchProductCardItem {
  const main =
    p.images?.find((i) => i.isMain)?.url ??
    p.images?.[0]?.url ??
    p.mainImageUrl ??
    DEFAULT_IMAGES.product;
  return {
    title: p.title,
    href: `/producto/${p.slug}`,
    image: main,
    type: 'producto',
  };
}

export function mapCategoryToSearchCard(c: PublicCategory): SearchProductCardItem {
  return {
    title: c.name,
    href: `/categoria/${c.slug}`,
    image: c.imageUrl?.trim() || DEFAULT_IMAGES.category,
    type: 'categoria',
  };
}

export function mapCatalogToSearchCard(c: PublicCatalog): SearchProductCardItem {
  return {
    title: c.name,
    href: `/catalogo/${c.slug}`,
    image: c.imageUrl?.trim() || DEFAULT_IMAGES.catalog,
    type: 'catalogo',
  };
}

/** Prefijo tipado: categorías luego catálogos, tope 12, match por nombre. */
export function buildTypedPrefix(
  q: string,
  categories: PublicCategory[],
  catalogs: PublicCatalog[],
  limit = 12,
): SearchProductCardItem[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];

  const cats = categories
    .filter((c) => c.slug && c.name.toLowerCase().includes(needle))
    .map(mapCategoryToSearchCard);
  const catsRemaining = Math.max(0, limit - cats.length);
  const catsLogs = catalogs
    .filter((c) => c.slug && c.name.toLowerCase().includes(needle))
    .slice(0, catsRemaining)
    .map(mapCatalogToSearchCard);

  return [...cats, ...catsLogs].slice(0, limit);
}
