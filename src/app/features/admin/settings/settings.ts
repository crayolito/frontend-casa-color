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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteSettingsApi } from '../data/site-settings.api';
import { isAppError } from '../../../shared/util/api-errors';
import {
  ResolvedErrorMessage,
  localErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { AdminPageHeader } from '../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminIconButton } from '../../../shared/admin-ui/admin-icon-button/admin-icon-button';
import { AdminConfirmDialog } from '../../../shared/admin-ui/admin-confirm-dialog/admin-confirm-dialog';
import { AdminTabs, AdminTab } from '../../../shared/admin-ui/admin-tabs/admin-tabs';
import { AdminErrorState } from '../../../shared/admin-ui/admin-error-state/admin-error-state';
import { AdminFormContext } from '../../../shared/admin-ui/admin-form-context/admin-form-context';
import { AdminToastService } from '../../../shared/admin-ui/admin-toast/admin-toast.service';

const KNOWN_KEYS = ['empresa', 'ubicaciones'] as const;

@Component({
  selector: 'app-admin-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AdminPageHeader,
    AdminIconButton,
    AdminConfirmDialog,
    AdminTabs,
    AdminErrorState,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class AdminSettings implements OnInit {
  private readonly api = inject(SiteSettingsApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(AdminToastService);
  private readonly formCtx = inject(AdminFormContext);
  private readonly destroyRef = inject(DestroyRef);

  readonly tabs: AdminTab[] = KNOWN_KEYS.map((key) => ({
    id: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
  }));

  readonly selectedKey = signal<string>('empresa');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly updatedAt = signal<string | null>(null);
  readonly deleteOpen = signal(false);

  private readonly _dirtyTick = signal(0);

  readonly form = this.fb.nonNullable.group({
    key: ['empresa', [Validators.required]],
    valueJson: ['{\n  \n}', [Validators.required]],
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
    this.loadKey('empresa');
  }

  discardChanges(): void {
    this.loadKey(this.selectedKey());
  }

  selectKey(key: string): void {
    this.selectedKey.set(key);
    this.form.patchValue({ key });
    this.loadKey(key);
  }

  loadKey(key: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.get(key).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.updatedAt.set(res.updatedAt);
        this.form.patchValue({
          key: res.key,
          valueJson: JSON.stringify(res.value, null, 2),
        });
        this.form.markAsPristine();
        this._dirtyTick.update((n) => n + 1);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.updatedAt.set(null);
        if (isAppError(err) && err.status === 404) {
          this.form.patchValue({
            key,
            valueJson: '{\n  \n}',
          });
          this.form.markAsPristine();
          this._dirtyTick.update((n) => n + 1);
          this.toast.info(`La sección «${key}» aún no existe. Guardá para crearla.`);
          return;
        }
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  onRetryLoad(): void {
    this.loadKey(this.selectedKey());
  }

  save(): void {
    this.error.set(null);
    const raw = this.form.getRawValue();
    let value: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw.valueJson);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        this.error.set(localErrorMessage('El contenido debe ser un objeto válido'));
        return;
      }
      value = parsed as Record<string, unknown>;
    } catch {
      this.error.set(localErrorMessage('Contenido inválido'));
      return;
    }

    this.saving.set(true);
    this.api.upsert(raw.key.trim(), value).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.updatedAt.set(res.updatedAt);
        this.toast.success('Guardado correctamente');
        this.selectedKey.set(res.key);
        this.form.markAsPristine();
        this._dirtyTick.update((n) => n + 1);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  askDelete(): void {
    this.deleteOpen.set(true);
  }

  confirmDelete(): void {
    const key = this.form.controls.key.value.trim();
    if (!key) {
      return;
    }
    this.saving.set(true);
    this.api.remove(key).subscribe({
      next: () => {
        this.saving.set(false);
        this.deleteOpen.set(false);
        this.toast.success('Eliminado correctamente');
        this.form.patchValue({ valueJson: '{\n  \n}' });
        this.updatedAt.set(null);
        this.form.markAsPristine();
        this._dirtyTick.update((n) => n + 1);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }
}
