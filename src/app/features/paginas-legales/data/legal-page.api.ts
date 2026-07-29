import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SiteSettingsApi } from '../../admin/data/site-settings.api';
import {
  LegalPageKey,
  LegalPageSettings,
  parseLegalPageSettings,
} from './legal-page.model';

export interface LegalPageResult {
  settings: LegalPageSettings;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class LegalPageApi {
  private readonly siteSettings = inject(SiteSettingsApi);

  get(key: LegalPageKey): Observable<LegalPageResult> {
    return this.siteSettings.get(key).pipe(
      map((res) => ({
        settings: parseLegalPageSettings(res.value, key),
        updatedAt: res.updatedAt,
      })),
    );
  }

  upsert(
    key: LegalPageKey,
    value: LegalPageSettings,
  ): Observable<LegalPageResult> {
    return this.siteSettings
      .upsert(key, { title: value.title, bodyHtml: value.bodyHtml })
      .pipe(
        map((res) => ({
          settings: parseLegalPageSettings(res.value, key),
          updatedAt: res.updatedAt,
        })),
      );
  }
}
