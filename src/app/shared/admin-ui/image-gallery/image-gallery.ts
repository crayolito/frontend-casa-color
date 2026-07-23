import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { UploadsService } from '../../../core/uploads/uploads.service';
import { resolveErrorMessage } from '../../errors/resolve-error-message';
import { AdminIcon } from '../icons/admin-icon';

export interface GalleryImage {
  url: string;
  publicId: string;
  isMain: boolean;
  displayOrder: number;
}

@Component({
  selector: 'app-image-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DragDropModule, AdminIcon],
  template: `
    <div class="gallery">
      <div class="gallery__head">
        <h3 class="gallery__title">{{ title() }}</h3>
        <label class="gallery__add">
          <input
            type="file"
            accept="image/*"
            hidden
            multiple
            (change)="onFilesSelected($event)"
            [disabled]="uploading()"
          />
          <app-admin-icon name="upload" />
          {{ uploading() ? 'Subiendo…' : 'Agregar imágenes' }}
        </label>
      </div>

      @if (error(); as err) {
        <p class="gallery__error" role="alert">{{ err }}</p>
      }

      @if (images().length === 0) {
        <div class="gallery__empty">
          <app-admin-icon name="image" [size]="40" />
          <p>Subí imágenes del producto</p>
        </div>
      } @else {
        <ul
          class="gallery__list"
          cdkDropList
          (cdkDropListDropped)="onDrop($event)"
        >
          @for (img of images(); track img.publicId; let i = $index) {
            <li class="gallery__item" cdkDrag>
              <img [src]="img.url" alt="" />
              @if (img.isMain) {
                <span class="gallery__badge">Principal</span>
              }
              <div class="gallery__actions">
                @if (!img.isMain) {
                  <button
                    type="button"
                    class="gallery__btn"
                    aria-label="Marcar como principal"
                    (click)="setMain(i)"
                  >
                    <app-admin-icon name="star" />
                  </button>
                }
                <button
                  type="button"
                  class="gallery__btn gallery__btn--danger"
                  aria-label="Eliminar imagen"
                  (click)="remove(i)"
                >
                  <app-admin-icon name="trash" />
                </button>
              </div>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .gallery__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .gallery__title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 300;
      color: #333;
    }

    .gallery__add {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 40px;
      padding: 0.5rem 1rem;
      border: 2px solid rgba(0, 0, 0, 0.12);
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      color: var(--color-text);
    }

    .gallery__add:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    .gallery__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      border: 2px dashed rgba(0, 0, 0, 0.12);
      color: var(--color-text-muted);
      text-align: center;
    }

    .gallery__empty p {
      margin: 0;
    }

    .gallery__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.75rem;
    }

    .gallery__item {
      position: relative;
      border: 1px solid rgba(0, 0, 0, 0.08);
      background: #fafafa;
      cursor: grab;
    }

    .gallery__item img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      display: block;
    }

    .gallery__badge {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      background: var(--color-accent);
      color: white;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 0.25rem 0.5rem;
    }

    .gallery__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.25rem;
      padding: 0.35rem;
    }

    .gallery__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 0;
      background: transparent;
      color: var(--color-text);
      cursor: pointer;
    }

    .gallery__btn:hover {
      color: var(--color-accent);
    }

    .gallery__btn--danger:hover {
      color: #b82b2b;
    }

    .gallery__error {
      margin: 0 0 0.75rem;
      color: var(--color-accent);
      font-size: 0.8125rem;
      font-weight: 600;
    }
  `,
})
export class ImageGallery {
  private readonly uploads = inject(UploadsService);

  readonly title = input('Imágenes');
  readonly images = input.required<GalleryImage[]>();
  readonly imagesChange = output<GalleryImage[]>();

  readonly uploading = signal(false);
  readonly error = signal<string | null>(null);

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (files.length === 0) return;

    this.uploading.set(true);
    this.error.set(null);

    let pending = files.length;
    const next = [...this.images()];

    for (const file of files) {
      if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
        pending -= 1;
        if (pending === 0) this.uploading.set(false);
        continue;
      }
      this.uploads.uploadFile(file, 'products').subscribe({
        next: (res) => {
          next.push({
            url: res.url,
            publicId: res.publicId,
            isMain: next.length === 0,
            displayOrder: next.length,
          });
          this.emitOrdered(next);
          pending -= 1;
          if (pending === 0) this.uploading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(resolveErrorMessage(err).text);
          pending -= 1;
          if (pending === 0) this.uploading.set(false);
        },
      });
    }
  }

  setMain(index: number): void {
    const next = this.images().map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    this.imagesChange.emit(next);
  }

  remove(index: number): void {
    const next = this.images().filter((_, i) => i !== index);
    if (next.length > 0 && !next.some((i) => i.isMain)) {
      next[0] = { ...next[0], isMain: true };
    }
    this.emitOrdered(next);
  }

  onDrop(event: CdkDragDrop<GalleryImage[]>): void {
    const next = [...this.images()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.emitOrdered(next);
  }

  private emitOrdered(items: GalleryImage[]): void {
    this.imagesChange.emit(
      items.map((img, index) => ({ ...img, displayOrder: index })),
    );
  }
}
