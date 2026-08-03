import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CatalogosPageApi,
  CatalogosPageContent,
} from '../../catalogos/data/catalogos-page.api';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { AdminPageHeader } from '../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminFormField } from '../../../shared/admin-ui/admin-form-field/admin-form-field';
import { ImageUploader } from '../../../shared/admin-ui/image-uploader/image-uploader';
import { AdminErrorState } from '../../../shared/admin-ui/admin-error-state/admin-error-state';
import { AdminFormContext } from '../../../shared/admin-ui/admin-form-context/admin-form-context';
import { AdminToastService } from '../../../shared/admin-ui/admin-toast/admin-toast.service';

@Component({
  selector: 'app-admin-catalogos-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AdminPageHeader,
    AdminFormField,
    ImageUploader,
    AdminErrorState,
  ],
  templateUrl: './catalogos-page.html',
  styleUrl: './catalogos-page.css',
})
export class AdminCatalogosPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CatalogosPageApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(AdminToastService);
  private readonly formCtx = inject(AdminFormContext);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<ResolvedErrorMessage | null>(null);

  private readonly _dirtyTick = signal(0);

  readonly form = this.fb.nonNullable.group({
    imageUrl: [''],
    pdfUrl: [''],
    pdfButtonLabel: [
      'DESCARGAR',
      [Validators.required, Validators.maxLength(50)],
    ],
  });

  readonly formDirty = computed(() => {
    this._dirtyTick();
    return this.form.dirty;
  });

  ngOnInit(): void {
    this.formCtx.register(
      {
        dirty: this.formDirty,
        saving: this.saving,
        save: () => this.save(),
        discard: () => this.discardChanges(),
      },
      this.destroyRef,
    );
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this._dirtyTick.update((n) => n + 1));
    this.load();
  }

  discardChanges(): void {
    this.load();
  }

  onImageChange(url: string | null): void {
    this.form.controls.imageUrl.setValue(url ?? '');
    this.form.controls.imageUrl.markAsDirty();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api
      .getPublic()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (content) => {
          this.loading.set(false);
          this.applyContent(content);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.error.set(resolveErrorMessage(err));
        },
      });
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.error('Revisá el texto del botón.');
      return;
    }

    const raw = this.form.getRawValue();
    const body: CatalogosPageContent = {
      imageUrl: raw.imageUrl.trim() || null,
      pdfUrl: raw.pdfUrl.trim() || null,
      pdfButtonLabel: raw.pdfButtonLabel.trim() || 'DESCARGAR',
    };

    this.saving.set(true);
    this.error.set(null);
    this.api
      .upsert(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          this.saving.set(false);
          this.toast.success('Página catálogos guardada.');
          this.applyContent(saved);
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.error.set(resolveErrorMessage(err));
        },
      });
  }

  private applyContent(content: CatalogosPageContent): void {
    this.form.patchValue({
      imageUrl: content.imageUrl ?? '',
      pdfUrl: content.pdfUrl ?? '',
      pdfButtonLabel: content.pdfButtonLabel || 'DESCARGAR',
    });
    this.form.markAsPristine();
    this._dirtyTick.update((n) => n + 1);
  }
}
