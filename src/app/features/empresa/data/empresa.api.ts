import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { EmpresaContent } from './empresa.model';

@Injectable({ providedIn: 'root' })
export class EmpresaPublicApi {
  private readonly api = inject(ApiService);

  getPublic(): Observable<EmpresaContent> {
    return this.api.get<EmpresaContent>('/public/empresa');
  }
}
