import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import {
  FichasTecnicasPublic,
  FichasTecnicasSettings,
} from './admin.models';

@Injectable({ providedIn: 'root' })
export class FichasTecnicasApi {
  private readonly api = inject(ApiService);

  getPublic(): Observable<FichasTecnicasPublic> {
    return this.api.get<FichasTecnicasPublic>('/public/fichas-tecnicas');
  }

  upsert(body: FichasTecnicasSettings): Observable<FichasTecnicasPublic> {
    return this.api.put<FichasTecnicasPublic>('/admin/fichas-tecnicas', body);
  }
}
