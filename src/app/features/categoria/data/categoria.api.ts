import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { CategoryDetail } from './categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaApi {
  private readonly api = inject(ApiService);

  loadCategoria(slug: string): Observable<CategoryDetail> {
    return this.api.get<CategoryDetail>(
      `/public/categories/${encodeURIComponent(slug)}`,
    );
  }
}
