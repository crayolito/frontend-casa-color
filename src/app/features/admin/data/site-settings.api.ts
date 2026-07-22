import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { SiteSetting } from './admin.models';

@Injectable({ providedIn: 'root' })
export class SiteSettingsApi {
  private readonly api = inject(ApiService);

  get(key: string): Observable<SiteSetting> {
    return this.api.get<SiteSetting>(`/public/site-settings/${key}`);
  }

  upsert(key: string, value: Record<string, unknown>): Observable<SiteSetting> {
    return this.api.put<SiteSetting>(`/admin/site-settings/${key}`, { value });
  }

  remove(key: string): Observable<void> {
    return this.api.delete(`/admin/site-settings/${key}`);
  }
}
