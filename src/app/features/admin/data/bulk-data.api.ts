import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, QueryParams } from '../../../core/http/api.service';

export type BulkEntity = 'categories' | 'catalogs' | 'products';

export type BulkSheetName = 'Categories' | 'Catalogs' | 'Products';
export type BulkCommand = 'NEW' | 'MERGE' | 'UPDATE' | 'DELETE' | 'IGNORE';

export interface ImportRowResult {
  sheet: BulkSheetName;
  row: number;
  slug: string | null;
  command: BulkCommand;
  status: 'success' | 'error' | 'skipped';
  code?: string;
  message?: string;
}

export interface ImportResult {
  summary: {
    total: number;
    succeeded: number;
    failed: number;
    skipped: number;
  };
  rows: ImportRowResult[];
}

export type BulkExportParams = QueryParams & {
  slugs?: string;
  categoryId?: number;
  catalogId?: number;
};

@Injectable({ providedIn: 'root' })
export class BulkDataApi {
  private readonly api = inject(ApiService);

  downloadTemplate(entity: BulkEntity): Observable<Blob> {
    return this.api.getBlob(`/admin/bulk-data/template/${entity}`);
  }

  downloadExport(
    entity: BulkEntity,
    params?: BulkExportParams,
  ): Observable<Blob> {
    return this.api.getBlob(`/admin/bulk-data/export/${entity}`, params);
  }

  import(entity: BulkEntity, file: File): Observable<ImportResult> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.api.postFormData<ImportResult>(
      `/admin/bulk-data/import/${entity}`,
      form,
    );
  }
}
