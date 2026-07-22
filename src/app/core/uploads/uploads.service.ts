import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UploadFolder =
  | 'products'
  | 'categories'
  | 'catalogs'
  | 'finishes'
  | 'colors';

export interface UploadResult {
  url: string;
  publicId: string;
}

interface SignatureData {
  signature: string;
  timestamp: number;
  publicId: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

@Injectable({ providedIn: 'root' })
export class UploadsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  uploadFile(file: File, folder: UploadFolder): Observable<UploadResult> {
    return this.http
      .post<{ data: SignatureData }>(`${this.baseUrl}/admin/uploads/signature`, {
        fileName: file.name,
        folder,
      })
      .pipe(
        switchMap((res) => {
          const sig = res.data;
          const form = new FormData();
          form.append('file', file);
          form.append('api_key', sig.apiKey);
          form.append('timestamp', String(sig.timestamp));
          form.append('signature', sig.signature);
          form.append('public_id', sig.publicId);
          form.append('folder', sig.folder);

          const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`;
          return this.http.post<{ secure_url: string; public_id: string }>(
            uploadUrl,
            form,
          );
        }),
        map((cloud) => ({
          url: cloud.secure_url,
          publicId: cloud.public_id,
        })),
      );
  }
}
