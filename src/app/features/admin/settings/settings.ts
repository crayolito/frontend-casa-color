import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteSettingsApi } from '../data/site-settings.api';
import { isAppError } from '../../../shared/util/api-errors';
import { AdminPageHeader } from '../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminButton } from '../../../shared/admin-ui/admin-button/admin-button';
import { AdminConfirmDialog } from '../../../shared/admin-ui/admin-confirm-dialog/admin-confirm-dialog';

const KNOWN_KEYS = ['contact', 'social', 'banner', 'home'] as const;

@Component({
  selector: 'app-admin-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AdminPageHeader,
    AdminButton,
    AdminConfirmDialog,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class AdminSettings implements OnInit {
  private readonly api = inject(SiteSettingsApi);
  private readonly fb = inject(FormBuilder);

  readonly knownKeys = KNOWN_KEYS;
  readonly selectedKey = signal<string>('contact');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly flash = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly updatedAt = signal<string | null>(null);
  readonly deleteOpen = signal(false);

  readonly form = this.fb.nonNullable.group({
    key: ['contact', [Validators.required]],
    valueJson: ['{\n  \n}', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadKey('contact');
  }

  selectKey(key: string): void {
    this.selectedKey.set(key);
    this.form.patchValue({ key });
    this.loadKey(key);
  }

  loadKey(key: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.flash.set(null);
    this.api.get(key).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.updatedAt.set(res.updatedAt);
        this.form.patchValue({
          key: res.key,
          valueJson: JSON.stringify(res.value, null, 2),
        });
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.updatedAt.set(null);
        if (isAppError(err) && err.status === 404) {
          this.form.patchValue({
            key,
            valueJson: '{\n  \n}',
          });
          this.flash.set(`La key «${key}» aún no existe. Guardá para crearla.`);
          return;
        }
        this.error.set(isAppError(err) ? err.message : 'Error al cargar');
      },
    });
  }

  save(): void {
    this.error.set(null);
    const raw = this.form.getRawValue();
    let value: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw.valueJson);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        this.error.set('El value debe ser un objeto JSON');
        return;
      }
      value = parsed as Record<string, unknown>;
    } catch {
      this.error.set('JSON inválido');
      return;
    }

    this.saving.set(true);
    this.api.upsert(raw.key.trim(), value).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.updatedAt.set(res.updatedAt);
        this.flash.set('Setting guardado');
        this.selectedKey.set(res.key);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(isAppError(err) ? err.message : 'Error al guardar');
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
        this.flash.set('Setting eliminado');
        this.form.patchValue({ valueJson: '{\n  \n}' });
        this.updatedAt.set(null);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(isAppError(err) ? err.message : 'Error al eliminar');
      },
    });
  }
}
