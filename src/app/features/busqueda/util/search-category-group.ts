import { PublicCatalog } from '../../../core/http/catalogs-public.api';
import { PublicCategory } from '../../../core/http/categories-public.api';

export interface SearchCategoryCatalog {
  id: number;
  name: string;
  slug: string;
}

export interface SearchCategoryGroup {
  id: number;
  name: string;
  slug: string;
  catalogs: SearchCategoryCatalog[];
}

export function groupByCategoryId(
  categories: PublicCategory[],
  catalogs: PublicCatalog[],
): SearchCategoryGroup[] {
  const byCategory = new Map<number, SearchCategoryCatalog[]>();

  for (const cat of catalogs) {
    if (!cat.slug) continue;
    const list = byCategory.get(cat.categoryId) ?? [];
    list.push({ id: cat.id, name: cat.name, slug: cat.slug });
    byCategory.set(cat.categoryId, list);
  }

  return categories
    .filter((c) => !!c.slug)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      catalogs: byCategory.get(c.id) ?? [],
    }));
}
