import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResult, QueryParams } from './api.service';

export interface PublicCatalog {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  showCoverImage?: boolean;
  pdfUrl: string | null;
  pdfButtonLabel: string;
  productsCount?: number;
  extraCategoryIds: number[];
  extraCategories: Array<{ id: number; name: string; slug: string }>;
  category?: { id: number; name: string; slug: string };
}

@Injectable({ providedIn: 'root' })
export class CatalogsPublicApi {
  private readonly api = inject(ApiService);

  list(
    page = 1,
    limit = 50,
    categoryId?: number,
    search?: string,
  ): Observable<PaginatedResult<PublicCatalog>> {
    const params: QueryParams = { page, limit, categoryId, search };
    return this.api.getList<PublicCatalog>('/public/catalogs', params);
  }

  getBySlug(slug: string): Observable<PublicCatalog> {
    return this.api.get<PublicCatalog>(
      `/public/catalogs/${encodeURIComponent(slug)}`,
    );
  }
}
