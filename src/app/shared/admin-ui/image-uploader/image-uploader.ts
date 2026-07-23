import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { UploadsService, UploadFolder } from '../../../core/uploads/uploads.service';
import { isAppError } from '../../util/api-errors';
import { AdminIcon } from '../icons/admin-icon';
import { AdminButton } from '../admin-button/admin-button';

@Component({
  selector: 'app-image-uploader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminIcon, AdminButton],
  template: `
    <div class="uploader">
      <p class="uploader__label">{{ label() }}</p>

      @if (url(); as preview) {
        <div class="uploader__preview">
          <img [src]="preview" [alt]="label()" />
          <div class="uploader__preview-actions">
            <label class="uploader__change">
              <input
                type="file"
                accept="image/*"
                hidden
                (change)="onFileSelected($event)"
                [disabled]="uploading()"
              />
              Cambiar
            </label>
            <app-admin-button type="button" variant="ghost" (clicked)="clear()">
              <app-admin-icon name="trash" />
              Quitar
            </app-admin-button>
          </div>
        </div>
      } @else {
        <label
          class="uploader__drop"
          [class.uploader__drop--busy]="uploading()"
        >
          <input
            type="file"
            accept="image/*"
            hidden
            (change)="onFileSelected($event)"
            [disabled]="uploading()"
          />
          @if (uploading()) {
            <span class="uploader__spinner" aria-hidden="true"></span>
            <span>Subiendo…</span>
          } @else {
            <app-admin-icon name="upload" [size]="28" />
            <span>Elegí o arrastrá una imagen</span>
          }
        </label>
      }

      @if (error(); as err) {
        <p class="uploader__error" role="alert">{{ err }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .uploader__label {
      margin: 0 0 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-text);
    }

    .uploader__drop {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: 140px;
      padding: 1.25rem;
      border: 2px dashed var(--admin-border);
      border-radius: var(--radius-md);
      background: #fafafa;
      color: var(--color-text-muted);
      cursor: pointer;
      text-align: center;
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      transition: border-color 0.2s ease, color 0.2s ease;
    }

    .uploader__drop:hover:not(.uploader__drop--busy) {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    .uploader__drop--busy {
      cursor: wait;
      opacity: 0.8;
    }

    .uploader__preview {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .uploader__preview img {
      max-width: 100%;
      max-height: 220px;
      object-fit: contain;
      background: #f8f8f8;
      border: 1px solid var(--admin-border);
      border-radius: var(--radius-md);
    }

    .uploader__preview-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .uploader__change {
      display: inline-flex;
      align-items: center;
      min-height: 40px;
      padding: 0.5rem 1rem;
      border: 1px solid var(--admin-border);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      color: var(--color-text);
      background: var(--color-white);
    }

    .uploader__change:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    .uploader__error {
      margin: 0.5rem 0 0;
      font-size: 0.8125rem;
      color: var(--color-accent);
      font-weight: 600;
    }

    .uploader__spinner {
      width: 22px;
      height: 22px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class ImageUploader {
  private readonly uploads = inject(UploadsService);

  readonly label = input('Imagen');
  readonly folder = input.required<UploadFolder>();
  readonly url = input<string | null>(null);
  readonly publicId = input<string | null>(null);

  readonly urlChange = output<string | null>();
  readonly publicIdChange = output<string | null>();
  readonly uploaded = output<{ url: string; publicId: string }>();

  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('Solo se permiten imágenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('Máximo 5 MB');
      return;
    }

    this.uploading.set(true);
    this.error.set(null);
    this.uploads.uploadFile(file, this.folder()).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.urlChange.emit(res.url);
        this.publicIdChange.emit(res.publicId);
        this.uploaded.emit(res);
      },
      error: (err: unknown) => {
        this.uploading.set(false);
        this.error.set(
          isAppError(err) ? err.message : 'No se pudo subir la imagen',
        );
      },
    });
  }

  clear(): void {
    this.urlChange.emit(null);
    this.publicIdChange.emit(null);
    this.error.set(null);
  }
}
