import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { EmpresaContent } from './admin.models';

@Injectable({ providedIn: 'root' })
export class EmpresaApi {
  private readonly api = inject(ApiService);

  getPublic(): Observable<EmpresaContent> {
    return this.api.get<EmpresaContent>('/public/empresa');
  }

  upsert(body: EmpresaContent): Observable<EmpresaContent> {
    return this.api.put<EmpresaContent>('/admin/empresa', body);
  }
}
