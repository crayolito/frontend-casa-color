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
import { BranchesApi } from '../data/branches.api';
import { Branch } from '../data/admin.models';
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
import { AdminErrorState } from '../../../shared/admin-ui/admin-error-state/admin-error-state';
import { BranchPickerMap } from './ui/branch-picker-map/branch-picker-map';

const SANTA_CRUZ = { lat: -17.7833, lng: -63.1821 };

function linesToTextarea(lines: string[]): string {
  return lines.join('\n');
}

function textareaToLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

@Component({
  selector: 'app-admin-branches',
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
    AdminErrorState,
    BranchPickerMap,
    ImgFallback,
  ],
  templateUrl: './branches.html',
  styleUrl: './branches.css',
})
export class AdminBranches {
  private readonly api = inject(BranchesApi);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = signal<Branch[]>([]);
  readonly meta = signal<PaginatedMeta | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly flash = signal<string | null>(null);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly reloadToken = signal(0);

  readonly modalOpen = signal(false);
  readonly editing = signal<Branch | null>(null);
  readonly deleteTarget = signal<Branch | null>(null);
  readonly deleteMessage = computed(() => {
    const target = this.deleteTarget();
    return target ? `¿Eliminar «${target.name}»?` : '';
  });
  readonly page = signal(1);
  readonly emptyMessage = computed(() => 'No hay sucursales todavía');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    addressLines: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    hours: ['', [Validators.required]],
    imageUrl: [''],
    lat: [SANTA_CRUZ.lat, [Validators.required]],
    lng: [SANTA_CRUZ.lng, [Validators.required]],
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
      name: '',
      addressLines: '',
      phone: '',
      email: '',
      hours: '',
      imageUrl: '',
      lat: SANTA_CRUZ.lat,
      lng: SANTA_CRUZ.lng,
      sortOrder: 0,
    });
    this.modalOpen.set(true);
  }

  openEdit(row: Branch): void {
    this.editing.set(row);
    this.form.reset({
      name: row.name,
      addressLines: linesToTextarea(row.addressLines),
      phone: row.phone,
      email: row.email,
      hours: linesToTextarea(row.hours),
      imageUrl: row.imageUrl ?? '',
      lat: row.lat,
      lng: row.lng,
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

  onMapPosition(pos: { lat: number; lng: number }): void {
    this.form.controls.lat.setValue(pos.lat);
    this.form.controls.lng.setValue(pos.lng);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const addressLines = textareaToLines(raw.addressLines);
    const hours = textareaToLines(raw.hours);
    if (addressLines.length === 0 || hours.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const body = {
      name: raw.name.trim(),
      addressLines,
      phone: raw.phone.trim(),
      email: raw.email.trim(),
      hours,
      lat: Number(raw.lat),
      lng: Number(raw.lng),
      imageUrl: raw.imageUrl.trim() || null,
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
        this.flash.set(editing ? 'Sucursal actualizada' : 'Sucursal creada');
        this.reload();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  askDelete(row: Branch): void {
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
        this.flash.set('Sucursal eliminada');
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
