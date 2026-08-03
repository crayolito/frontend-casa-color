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
import { BranchesApi } from '../data/branches.api';
import { Branch } from '../data/admin.models';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { AdminButton } from '../../../shared/admin-ui/admin-button/admin-button';
import { AdminIconButton } from '../../../shared/admin-ui/admin-icon-button/admin-icon-button';
import { AdminModal } from '../../../shared/admin-ui/admin-modal/admin-modal';
import { AdminFormField } from '../../../shared/admin-ui/admin-form-field/admin-form-field';
import { AdminConfirmDialog } from '../../../shared/admin-ui/admin-confirm-dialog/admin-confirm-dialog';
import { AdminIcon } from '../../../shared/admin-ui/icons/admin-icon';
import { ImageUploader } from '../../../shared/admin-ui/image-uploader/image-uploader';
import { AdminErrorState } from '../../../shared/admin-ui/admin-error-state/admin-error-state';
import { BranchPickerMap } from './ui/branch-picker-map/branch-picker-map';
import { AdminToastService } from '../../../shared/admin-ui/admin-toast/admin-toast.service';

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
  selector: 'app-contacto-branches-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DragDropModule,
    AdminButton,
    AdminIconButton,
    AdminModal,
    AdminFormField,
    AdminConfirmDialog,
    AdminIcon,
    ImageUploader,
    AdminErrorState,
    BranchPickerMap,
  ],
  templateUrl: './contacto-branches-editor.html',
  styleUrl: './contacto-branches-editor.css',
})
export class ContactoBranchesEditor {
  private readonly api = inject(BranchesApi);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(AdminToastService);

  readonly rows = signal<Branch[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly reloadToken = signal(0);

  readonly modalOpen = signal(false);
  readonly editing = signal<Branch | null>(null);
  readonly deleteTarget = signal<Branch | null>(null);
  readonly deleteMessage = computed(() => {
    const target = this.deleteTarget();
    return target ? `¿Eliminar «${target.name}»?` : '';
  });

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    addressLines: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    hours: ['', [Validators.required]],
    imageUrl: [''],
    lat: [SANTA_CRUZ.lat, [Validators.required]],
    lng: [SANTA_CRUZ.lng, [Validators.required]],
  });

  constructor() {
    toObservable(this.reloadToken)
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() =>
          this.api.list(1, 100).pipe(
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
            [...res.data].sort((a, b) => a.sortOrder - b.sortOrder),
          );
        },
      });
  }

  reload(): void {
    this.reloadToken.update((n) => n + 1);
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
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  onImageChange(url: string | null): void {
    this.form.controls.imageUrl.setValue(url ?? '');
    this.form.controls.imageUrl.markAsDirty();
    this.form.markAsDirty();
  }

  onMapPosition(pos: { lat: number; lng: number }): void {
    this.form.controls.lat.setValue(pos.lat, { emitEvent: false });
    this.form.controls.lng.setValue(pos.lng, { emitEvent: false });
    this.form.controls.lat.markAsDirty();
    this.form.controls.lng.markAsDirty();
  }

  drop(event: CdkDragDrop<Branch[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const next = [...this.rows()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.rows.set(next);

    const updates = next.map((branch, index) =>
      this.api.update(branch.id, { sortOrder: index }),
    );
    this.saving.set(true);
    forkJoin(updates).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.rows.set(saved);
        this.toast.success('Orden de sucursales actualizado');
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
    const addressLines = textareaToLines(raw.addressLines);
    const hours = textareaToLines(raw.hours);
    if (addressLines.length === 0 || hours.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const editing = this.editing();
    const body = {
      name: raw.name.trim(),
      addressLines,
      phone: raw.phone.trim(),
      email: raw.email.trim(),
      hours,
      lat: Number(raw.lat),
      lng: Number(raw.lng),
      imageUrl: raw.imageUrl.trim() || null,
      // El orden se gestiona por drag & drop en la lista, no en el form.
      sortOrder: editing?.sortOrder ?? this.rows().length,
    };

    this.saving.set(true);
    const req = editing
      ? this.api.update(editing.id, body)
      : this.api.create(body);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.toast.success(editing ? 'Sucursal actualizada' : 'Sucursal creada');
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
        this.toast.success('Sucursal eliminada');
        this.reload();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }
}
