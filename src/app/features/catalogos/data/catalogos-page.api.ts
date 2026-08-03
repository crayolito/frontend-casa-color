import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';

export interface CatalogosPageContent {
  imageUrl: string | null;
  pdfUrl: string | null;
  pdfButtonLabel: string;
}

@Injectable({ providedIn: 'root' })
export class CatalogosPageApi {
  private readonly api = inject(ApiService);

  getPublic(): Observable<CatalogosPageContent> {
    return this.api.get<CatalogosPageContent>('/public/catalogos-page');
  }

  upsert(body: CatalogosPageContent): Observable<CatalogosPageContent> {
    return this.api.put<CatalogosPageContent>('/admin/catalogos-page', body);
  }
}
