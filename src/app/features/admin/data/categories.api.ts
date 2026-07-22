import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResult, QueryParams } from '../../../core/http/api.service';
import { Category, CategoryWrite } from './admin.models';

@Injectable({ providedIn: 'root' })
export class CategoriesApi {
  private readonly api = inject(ApiService);

  list(
    page = 1,
    limit = 20,
    search?: string,
  ): Observable<PaginatedResult<Category>> {
    const params: QueryParams = { page, limit, search };
    return this.api.getList<Category>('/public/categories', params);
  }

  create(body: CategoryWrite): Observable<Category> {
    return this.api.post<Category>('/admin/categories', body);
  }

  update(id: number, body: Partial<CategoryWrite>): Observable<Category> {
    return this.api.patch<Category>(`/admin/categories/${id}`, body);
  }

  remove(id: number): Observable<void> {
    return this.api.delete(`/admin/categories/${id}`);
  }
}
