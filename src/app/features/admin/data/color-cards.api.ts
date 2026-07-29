import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResult, QueryParams } from '../../../core/http/api.service';
import { ColorCard, ColorCardWrite } from './admin.models';

@Injectable({ providedIn: 'root' })
export class ColorCardsApi {
  private readonly api = inject(ApiService);

  listPublic(
    page = 1,
    limit = 50,
  ): Observable<PaginatedResult<ColorCard>> {
    const params: QueryParams = { page, limit };
    return this.api.getList<ColorCard>('/public/color-cards', params);
  }

  list(
    page = 1,
    limit = 20,
  ): Observable<PaginatedResult<ColorCard>> {
    const params: QueryParams = { page, limit };
    return this.api.getList<ColorCard>('/admin/color-cards', params);
  }

  create(body: ColorCardWrite): Observable<ColorCard> {
    return this.api.post<ColorCard>('/admin/color-cards', body);
  }

  update(id: number, body: Partial<ColorCardWrite>): Observable<ColorCard> {
    return this.api.patch<ColorCard>(`/admin/color-cards/${id}`, body);
  }

  remove(id: number): Observable<void> {
    return this.api.delete(`/admin/color-cards/${id}`);
  }
}
