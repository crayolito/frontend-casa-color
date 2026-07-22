export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWrite {
  name: string;
  slug?: string;
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
}

export interface CatalogWrite {
  categoryId: number;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
}

export type SectionBlock =
  | { type: 'heading' | 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

export interface Product {
  id: number;
  catalogId: number;
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
  sections: Array<{
    id: number;
    title: string;
    icon: string | null;
    content: SectionBlock[];
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
  catalogId: number;
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
    content: SectionBlock[];
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
