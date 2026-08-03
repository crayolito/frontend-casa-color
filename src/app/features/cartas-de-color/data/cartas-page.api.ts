import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';

export interface CartasPageContent {
  heroImageUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class CartasPageApi {
  private readonly api = inject(ApiService);

  getPublic(): Observable<CartasPageContent> {
    return this.api.get<CartasPageContent>('/public/cartas-page');
  }

  upsert(body: CartasPageContent): Observable<CartasPageContent> {
    return this.api.put<CartasPageContent>('/admin/cartas-page', body);
  }
}
