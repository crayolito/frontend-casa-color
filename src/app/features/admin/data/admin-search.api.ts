import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';

export interface AdminSearchProductHit {
  id: number;
  title: string;
  slug: string;
  isActive: boolean;
}

export interface AdminSearchCatalogHit {
  id: number;
  name: string;
  slug: string;
}

export interface AdminSearchCategoryHit {
  id: number;
  name: string;
  slug: string;
}

export interface AdminSearchResult {
  products: AdminSearchProductHit[];
  catalogs: AdminSearchCatalogHit[];
  categories: AdminSearchCategoryHit[];
}

@Injectable({ providedIn: 'root' })
export class AdminSearchApi {
  private readonly api = inject(ApiService);

  search(q: string): Observable<AdminSearchResult> {
    return this.api.get<AdminSearchResult>('/admin/search', { q });
  }
}
