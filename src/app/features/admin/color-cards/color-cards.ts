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
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  of,
  switchMap,
  tap,
  catchError,
  forkJoin,
} from 'rxjs';
import { ColorCardsApi } from '../data/color-cards.api';
import { ColorCard } from '../data/admin.models';
import { CartasPageApi } from '../../cartas-de-color/data/cartas-page.api';
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
import { AdminIconButton } from '../../../shared/admin-ui/admin-icon-button/admin-icon-button';
import { ImageUploader } from '../../../shared/admin-ui/image-uploader/image-uploader';
import { AdminErrorState } from '../../../shared/admin-ui/admin-error-state/admin-error-state';
import { AdminToastService } from '../../../shared/admin-ui/admin-toast/admin-toast.service';
import { AdminHtmlEditor } from '../../../shared/admin-ui/admin-html-editor/admin-html-editor';

const MIN_CARDS = 2;
const MAX_CARDS = 4;

@Component({
  selector: 'app-admin-color-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DragDropModule,
    AdminPageHeader,
    AdminButton,
    AdminIconButton,
    AdminModal,
    AdminFormField,
    AdminConfirmDialog,
    AdminIcon,
    ImageUploader,
    AdminErrorState,
    AdminHtmlEditor,
  ],
  templateUrl: './color-cards.html',
  styleUrl: './color-cards.css',
})
export class AdminColorCards {
  private readonly api = inject(ColorCardsApi);
  private readonly pageApi = inject(CartasPageApi);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(AdminToastService);

  readonly rows = signal<ColorCard[]>([]);
  readonly heroImageUrl = signal<string | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly savingHero = signal(false);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly reloadToken = signal(0);

  readonly modalOpen = signal(false);
  readonly editing = signal<ColorCard | null>(null);
  readonly deleteTarget = signal<ColorCard | null>(null);
  readonly deleteMessage = computed(() => {
    const target = this.deleteTarget();
    return target ? `¿Eliminar «${this.cardTitle(target)}»?` : '';
  });

  readonly cardCount = computed(() => this.rows().length);
  readonly canAdd = computed(() => this.cardCount() < MAX_CARDS);
  readonly canRemove = computed(() => this.cardCount() > MIN_CARDS);
  readonly countLabel = computed(
    () => `${this.cardCount()} de ${MAX_CARDS} cartas (mín. ${MIN_CARDS})`,
  );

  readonly form = this.fb.nonNullable.group({
    titlePrefix: ['', [Validators.required, Validators.maxLength(100)]],
    titleStrong: ['', [Validators.required, Validators.maxLength(100)]],
    descriptionHtml: [''],
    buttonLabel: ['', [Validators.required, Validators.maxLength(80)]],
    imageUrl: [''],
    pdfUrl: [''],
  });

  constructor() {
    toObservable(this.reloadToken)
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() =>
          forkJoin({
            cards: this.api.list(1, MAX_CARDS),
            page: this.pageApi.getPublic().pipe(
              catchError(() => of({ heroImageUrl: null as string | null })),
            ),
          }).pipe(
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
          this.rows.set(
            [...res.cards.data].sort((a, b) => a.sortOrder - b.sortOrder),
          );
          this.heroImageUrl.set(res.page.heroImageUrl);
        },
      });
  }

  reload(): void {
    this.reloadToken.update((n) => n + 1);
  }

  onRetryLoad(): void {
    this.reload();
  }

  onHeroChange(url: string | null): void {
    this.heroImageUrl.set(url);
    this.savingHero.set(true);
    this.pageApi.upsert({ heroImageUrl: url }).subscribe({
      next: (saved) => {
        this.savingHero.set(false);
        this.heroImageUrl.set(saved.heroImageUrl);
        this.toast.success(
          url ? 'Imagen principal actualizada' : 'Imagen principal quitada',
        );
      },
      error: (err: unknown) => {
        this.savingHero.set(false);
        this.error.set(resolveErrorMessage(err));
        this.reload();
      },
    });
  }

  openCreate(): void {
    if (!this.canAdd()) {
      this.toast.error(`Máximo ${MAX_CARDS} cartas de color.`);
      return;
    }
    this.editing.set(null);
    this.form.reset({
      titlePrefix: '',
      titleStrong: '',
      descriptionHtml: '',
      buttonLabel: 'Descargar carta',
      imageUrl: '',
      pdfUrl: '',
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
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  onImageChange(url: string | null): void {
    this.form.controls.imageUrl.setValue(url ?? '');
    this.form.controls.imageUrl.markAsDirty();
  }

  onDescriptionChange(html: string): void {
    this.form.controls.descriptionHtml.setValue(html);
    this.form.controls.descriptionHtml.markAsDirty();
  }

  cardTitle(row: ColorCard): string {
    return `${row.titlePrefix}${row.titleStrong}`.trim();
  }

  drop(event: CdkDragDrop<ColorCard[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const next = [...this.rows()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.rows.set(next);

    const updates = next.map((card, index) =>
      this.api.update(card.id, { sortOrder: index }),
    );
    this.saving.set(true);
    forkJoin(updates).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.rows.set(saved);
        this.toast.success('Orden actualizado');
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
        this.reload();
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const editing = this.editing();
    const body = {
      titlePrefix: raw.titlePrefix.trim(),
      titleStrong: raw.titleStrong.trim(),
      descriptionHtml: raw.descriptionHtml.trim() || null,
      buttonLabel: raw.buttonLabel.trim(),
      imageUrl: raw.imageUrl.trim() || null,
      pdfUrl: raw.pdfUrl.trim() || null,
      ...(editing ? {} : { sortOrder: this.rows().length }),
    };
    this.saving.set(true);
    const req = editing
      ? this.api.update(editing.id, body)
      : this.api.create(body);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.toast.success(editing ? 'Carta actualizada' : 'Carta creada');
        this.reload();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  askDelete(row: ColorCard): void {
    if (!this.canRemove()) {
      this.toast.error(`Mínimo ${MIN_CARDS} cartas de color.`);
      return;
    }
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
        this.toast.success('Carta eliminada');
        this.reload();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }
}
