import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  signal,
  computed,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  combineLatest,
  of,
  switchMap,
  tap,
  catchError,
} from 'rxjs';
import { ColorCardsApi } from '../data/color-cards.api';
import { ColorCard } from '../data/admin.models';
import { PaginatedMeta } from '../../../core/http/api.service';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { AdminPageHeader } from '../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminButton } from '../../../shared/admin-ui/admin-button/admin-button';
import { AdminModal } from '../../../shared/admin-ui/admin-modal/admin-modal';
import { AdminFormField } from '../../../shared/admin-ui/admin-form-field/admin-form-field';
import { AdminConfirmDialog } from '../../../shared/admin-ui/admin-confirm-dialog/admin-confirm-dialog';
import { AdminIcon } from '../../../shared/admin-ui/icons/admin-icon';
import { ImageUploader } from '../../../shared/admin-ui/image-uploader/image-uploader';
import { ImgFallback } from '../../../shared/util/img-fallback/img-fallback';
import { PdfUploader } from '../../../shared/admin-ui/pdf-uploader/pdf-uploader';
import { AdminErrorState } from '../../../shared/admin-ui/admin-error-state/admin-error-state';

@Component({
  selector: 'app-admin-color-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AdminPageHeader,
    AdminButton,
    AdminModal,
    AdminFormField,
    AdminConfirmDialog,
    AdminIcon,
    ImageUploader,
    PdfUploader,
    AdminErrorState,
    ImgFallback,
  ],
  templateUrl: './color-cards.html',
  styleUrl: './color-cards.css',
})
export class AdminColorCards {
  private readonly api = inject(ColorCardsApi);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = signal<ColorCard[]>([]);
  readonly meta = signal<PaginatedMeta | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly flash = signal<string | null>(null);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly reloadToken = signal(0);

  readonly modalOpen = signal(false);
  readonly editing = signal<ColorCard | null>(null);
  readonly deleteTarget = signal<ColorCard | null>(null);
  readonly deleteMessage = computed(() => {
    const target = this.deleteTarget();
    return target ? `¿Eliminar «${this.cardTitle(target)}»?` : '';
  });
  readonly page = signal(1);

  readonly emptyMessage = computed(() => 'No hay cartas de color todavía');

  readonly form = this.fb.nonNullable.group({
    titlePrefix: ['', [Validators.required, Validators.maxLength(100)]],
    titleStrong: ['', [Validators.required, Validators.maxLength(100)]],
    descriptionHtml: [''],
    buttonLabel: ['', [Validators.required, Validators.maxLength(80)]],
    imageUrl: [''],
    pdfUrl: [''],
    sortOrder: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    combineLatest([
      toObservable(this.page),
      toObservable(this.reloadToken),
    ])
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(([page]) =>
          this.api.list(page, 20).pipe(
            catchError((err: unknown) => {
              this.error.set(resolveErrorMessage(err));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (!res) return;
          this.rows.set(res.data);
          this.meta.set(res.meta);
        },
      });
  }

  reload(): void {
    this.reloadToken.update((n) => n + 1);
  }

  onRetryLoad(): void {
    this.reload();
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({
      titlePrefix: '',
      titleStrong: '',
      descriptionHtml: '',
      buttonLabel: 'Descargar carta',
      imageUrl: '',
      pdfUrl: '',
      sortOrder: 0,
    });
    this.modalOpen.set(true);
  }

  openEdit(row: ColorCard): void {
    this.editing.set(row);
    this.form.reset({
      titlePrefix: row.titlePrefix,
      titleStrong: row.titleStrong,
      descriptionHtml: row.descriptionHtml ?? '',
      buttonLabel: row.buttonLabel,
      imageUrl: row.imageUrl ?? '',
      pdfUrl: row.pdfUrl ?? '',
      sortOrder: row.sortOrder,
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  onImageChange(url: string | null): void {
    this.form.controls.imageUrl.setValue(url ?? '');
  }

  onPdfChange(url: string | null): void {
    this.form.controls.pdfUrl.setValue(url ?? '');
  }

  cardTitle(row: ColorCard): string {
    return `${row.titlePrefix}${row.titleStrong}`.trim();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const body = {
      titlePrefix: raw.titlePrefix.trim(),
      titleStrong: raw.titleStrong.trim(),
      descriptionHtml: raw.descriptionHtml.trim() || null,
      buttonLabel: raw.buttonLabel.trim(),
      imageUrl: raw.imageUrl.trim() || null,
      pdfUrl: raw.pdfUrl.trim() || null,
      sortOrder: Number(raw.sortOrder) || 0,
    };
    this.saving.set(true);
    const editing = this.editing();
    const req = editing
      ? this.api.update(editing.id, body)
      : this.api.create(body);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.flash.set(editing ? 'Carta actualizada' : 'Carta creada');
        this.reload();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  askDelete(row: ColorCard): void {
    this.deleteTarget.set(row);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.saving.set(true);
    this.api.remove(target.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.deleteTarget.set(null);
        this.flash.set('Carta eliminada');
        this.reload();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }
}
