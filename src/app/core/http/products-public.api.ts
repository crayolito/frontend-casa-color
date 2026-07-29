import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResult, QueryParams } from './api.service';

export interface PublicProductCatalogRef {
  id: number;
  name: string;
  slug?: string;
  categoryId: number;
  categoryName: string;
  categorySlug?: string;
}

export interface PublicProduct {
  id: number;
  catalogId: number;
  catalogs: PublicProductCatalogRef[];
  title: string;
  slug: string;
  description: string | null;
  mainImageUrl: string | null;
  technicalSheetUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  presentations: Array<{
    id: number;
    value: string;
    displayOrder: number;
  }>;
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

export interface PublicProductListParams {
  page?: number;
  limit?: number;
  catalogId?: number;
  categoryId?: number;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsPublicApi {
  private readonly api = inject(ApiService);

  list(params: PublicProductListParams = {}): Observable<PaginatedResult<PublicProduct>> {
    const query: QueryParams = {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      catalogId: params.catalogId,
      categoryId: params.categoryId,
      search: params.search,
    };
    return this.api.getList<PublicProduct>('/public/products', query);
  }

  getBySlug(slug: string): Observable<PublicProduct> {
    return this.api.get<PublicProduct>(`/public/products/${slug}`);
  }
}
