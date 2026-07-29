import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { ContactoPublicPage } from './admin.models';

@Injectable({ providedIn: 'root' })
export class ContactoApi {
  private readonly api = inject(ApiService);

  getPublic(): Observable<ContactoPublicPage> {
    return this.api.get<ContactoPublicPage>('/public/contacto');
  }
}
