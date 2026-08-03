export interface CategoriaProduct {
  id: number;
  title: string;
  slug: string;
}

export interface CategoriaCatalog {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  products: CategoriaProduct[];
}

export interface CategoryDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  description2: string | null;
  coverImageUrl: string | null;
  cardImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  catalogsCount?: number;
  catalogs: CategoriaCatalog[];
}
