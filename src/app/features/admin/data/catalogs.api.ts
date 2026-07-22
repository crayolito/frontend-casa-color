import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResult, QueryParams } from '../../../core/http/api.service';
import { Catalog, CatalogWrite } from './admin.models';

@Injectable({ providedIn: 'root' })
export class CatalogsApi {
  private readonly api = inject(ApiService);

  list(
    page = 1,
    limit = 20,
    categoryId?: number,
    search?: string,
  ): Observable<PaginatedResult<Catalog>> {
    const params: QueryParams = { page, limit, categoryId, search };
    return this.api.getList<Catalog>('/public/catalogs', params);
  }

  create(body: CatalogWrite): Observable<Catalog> {
    return this.api.post<Catalog>('/admin/catalogs', body);
  }

  update(id: number, body: Partial<CatalogWrite>): Observable<Catalog> {
    return this.api.patch<Catalog>(`/admin/catalogs/${id}`, body);
  }

  remove(id: number): Observable<void> {
    return this.api.delete(`/admin/catalogs/${id}`);
  }
}
