import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResult, QueryParams } from '../../../core/http/api.service';
import { Product, ProductWrite } from './admin.models';

export interface ProductListParams {
  page?: number;
  limit?: number;
  catalogId?: number;
  categoryId?: number;
  search?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private readonly api = inject(ApiService);

  list(params: ProductListParams = {}): Observable<PaginatedResult<Product>> {
    const query: QueryParams = {
      page: params.page ?? 1,
      limit: params.limit ?? 16,
      catalogId: params.catalogId,
      categoryId: params.categoryId,
      search: params.search,
      isActive: params.isActive,
    };
    return this.api.getList<Product>('/admin/products', query);
  }

  listPublic(params: ProductListParams = {}): Observable<PaginatedResult<Product>> {
    const query: QueryParams = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      catalogId: params.catalogId,
      categoryId: params.categoryId,
      search: params.search,
    };
    return this.api.getList<Product>('/public/products', query);
  }

  getBySlug(slug: string): Observable<Product> {
    return this.api.get<Product>(`/public/products/${slug}`);
  }

  getById(id: number): Observable<Product> {
    return this.api.get<Product>(`/admin/products/${id}`);
  }

  create(body: ProductWrite): Observable<Product> {
    return this.api.post<Product>('/admin/products', body);
  }

  update(id: number, body: Partial<ProductWrite>): Observable<Product> {
    return this.api.patch<Product>(`/admin/products/${id}`, body);
  }

  remove(id: number): Observable<void> {
    return this.api.delete(`/admin/products/${id}`);
  }
}
