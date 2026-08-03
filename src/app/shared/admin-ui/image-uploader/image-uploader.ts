import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { UploadsService, UploadFolder } from '../../../core/uploads/uploads.service';
import { resolveErrorMessage } from '../../errors/resolve-error-message';
import { AdminIcon } from '../icons/admin-icon';
import { AdminIconButton } from '../admin-icon-button/admin-icon-button';
import {
  ImgFallback,
  ImgFallbackKind,
} from '../../util/img-fallback/img-fallback';

@Component({
  selector: 'app-image-uploader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminIcon, AdminIconButton, ImgFallback],
  template: `
    <div class="uploader">
      <p class="uploader__label">{{ label() }}</p>

      <input
        #fileInput
        type="file"
        accept="image/*"
        hidden
        (change)="onFileSelected($event)"
        [disabled]="uploading()"
      />

      @if (url(); as preview) {
        <div class="uploader__preview">
          <img [src]="preview" [alt]="label()" [appImgFallback]="fallbackKind()" />
          <div class="uploader__preview-actions">
            <button
              type="button"
              class="uploader__change"
              [disabled]="uploading()"
              (click)="fileInput.click()"
            >
              Cambiar
            </button>
            <app-admin-icon-button
              icon="trash"
              label="Quitar"
              variant="danger"
              (clicked)="clear()"
            />
          </div>
        </div>
      } @else {
        <div
          class="uploader__drop"
          role="button"
          tabindex="0"
          [class.uploader__drop--busy]="uploading()"
          [class.uploader__drop--active]="dragOver()"
          [attr.aria-disabled]="uploading()"
          (click)="!uploading() && fileInput.click()"
          (keydown.enter)="!uploading() && fileInput.click()"
          (keydown.space)="$event.preventDefault(); !uploading() && fileInput.click()"
          (dragenter)="onDragEnter($event)"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          @if (uploading()) {
            <span class="uploader__spinner" aria-hidden="true"></span>
            <span>Subiendo…</span>
          } @else {
            <app-admin-icon name="upload" [size]="28" />
            <span>Elegí o arrastrá una imagen</span>
          }
        </div>
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
      transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
    }

    .uploader__drop:hover:not(.uploader__drop--busy),
    .uploader__drop:focus-visible:not(.uploader__drop--busy) {
      border-color: var(--color-accent);
      color: var(--color-accent);
      outline: none;
    }

    .uploader__drop--active:not(.uploader__drop--busy) {
      border-color: var(--color-accent);
      color: var(--color-accent);
      background: rgba(221, 51, 51, 0.06);
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
      font-family: inherit;
    }

    .uploader__change:hover:not(:disabled) {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    .uploader__change:disabled {
      opacity: 0.6;
      cursor: wait;
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
  /** Fallback cuando la preview no carga (default product). */
  readonly fallbackKind = input<ImgFallbackKind>('product');

  readonly urlChange = output<string | null>();
  readonly publicIdChange = output<string | null>();
  readonly uploaded = output<{ url: string; publicId: string }>();

  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);
  readonly dragOver = signal(false);

  private dragDepth = 0;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.upload(file);
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.uploading()) return;
    this.dragDepth += 1;
    this.dragOver.set(true);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (this.dragDepth === 0) {
      this.dragOver.set(false);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragDepth = 0;
    this.dragOver.set(false);
    if (this.uploading()) return;
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    this.upload(file);
  }

  clear(): void {
    this.urlChange.emit(null);
    this.publicIdChange.emit(null);
    this.error.set(null);
  }

  private upload(file: File): void {
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
        this.error.set(resolveErrorMessage(err).text);
      },
    });
  }
}
