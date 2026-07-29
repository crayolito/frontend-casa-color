import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResult, QueryParams } from './api.service';

export interface PublicCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  description2: string | null;
  imageUrl: string | null;
  catalogsCount?: number;
  catalogs?: Array<{
    id: number;
    name: string;
    slug: string;
    imageUrl: string | null;
    products: Array<{ id: number; title: string; slug: string }>;
  }>;
}

@Injectable({ providedIn: 'root' })
export class CategoriesPublicApi {
  private readonly api = inject(ApiService);

  list(page = 1, limit = 50, search?: string): Observable<PaginatedResult<PublicCategory>> {
    const params: QueryParams = { page, limit, search };
    return this.api.getList<PublicCategory>('/public/categories', params);
  }

  getBySlug(slug: string): Observable<PublicCategory> {
    return this.api.get<PublicCategory>(`/public/categories/${slug}`);
  }
}
