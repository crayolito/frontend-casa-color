import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResult, QueryParams } from '../../../core/http/api.service';
import { Branch, BranchWrite } from './admin.models';

@Injectable({ providedIn: 'root' })
export class BranchesApi {
  private readonly api = inject(ApiService);

  listPublic(
    page = 1,
    limit = 50,
  ): Observable<PaginatedResult<Branch>> {
    const params: QueryParams = { page, limit };
    return this.api.getList<Branch>('/public/branches', params);
  }

  list(
    page = 1,
    limit = 20,
  ): Observable<PaginatedResult<Branch>> {
    const params: QueryParams = { page, limit };
    return this.api.getList<Branch>('/admin/branches', params);
  }

  create(body: BranchWrite): Observable<Branch> {
    return this.api.post<Branch>('/admin/branches', body);
  }

  update(id: number, body: Partial<BranchWrite>): Observable<Branch> {
    return this.api.patch<Branch>(`/admin/branches/${id}`, body);
  }

  remove(id: number): Observable<void> {
    return this.api.delete(`/admin/branches/${id}`);
  }
}
