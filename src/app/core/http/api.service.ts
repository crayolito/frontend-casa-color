import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedMeta;
}

interface DataEnvelope<T> {
  data: T;
}

interface ListEnvelope<T> {
  data: T[];
  meta: PaginatedMeta;
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http
      .get<DataEnvelope<T>>(`${this.baseUrl}${path}`, {
        params: this.toHttpParams(params),
      })
      .pipe(map((res) => res.data));
  }

  getList<T>(path: string, params?: QueryParams): Observable<PaginatedResult<T>> {
    return this.http
      .get<ListEnvelope<T>>(`${this.baseUrl}${path}`, {
        params: this.toHttpParams(params),
      })
      .pipe(map((res) => ({ data: res.data, meta: res.meta })));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<DataEnvelope<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map((res) => res.data));
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .patch<DataEnvelope<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map((res) => res.data));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .put<DataEnvelope<T>>(`${this.baseUrl}${path}`, body)
      .pipe(map((res) => res.data));
  }

  delete(path: string): Observable<void> {
    return this.http.delete(`${this.baseUrl}${path}`, {
      observe: 'response',
    }).pipe(map(() => undefined));
  }

  private toHttpParams(params?: QueryParams): HttpParams | undefined {
    if (!params) {
      return undefined;
    }
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }
      httpParams = httpParams.set(key, String(value));
    }
    return httpParams;
  }
}
