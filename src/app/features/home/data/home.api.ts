import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import {
  HomeContent,
  HomeSection,
} from './home-content.model';

@Injectable({ providedIn: 'root' })
export class HomeApi {
  private readonly api = inject(ApiService);

  readonly content = signal<HomeContent | null>(null);
  readonly loading = signal(false);
  readonly error = signal<unknown | null>(null);

  loadHome(): Observable<HomeContent> {
    this.loading.set(true);
    this.error.set(null);
    // Cache-bust: evita que el navegador reutilice un GET viejo tras un PUT del admin.
    return this.api
      .get<HomeContent>('/public/home', { _ts: Date.now() })
      .pipe(
        tap((data) => this.content.set(data)),
        finalize(() => this.loading.set(false)),
      );
  }

  upsertSection(
    section: HomeSection,
    body: Record<string, unknown>,
  ): Observable<{ key: string; value: Record<string, unknown>; updatedAt: string }> {
    return this.api.put(`/admin/home/${section}`, body);
  }
}
