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
import { isAppError } from '../../../shared/util/api-errors';
import {
  ResolvedErrorMessage,
  localErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { AdminPageHeader } from '../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminTabs, AdminTab } from '../../../shared/admin-ui/admin-tabs/admin-tabs';
import { AdminErrorState } from '../../../shared/admin-ui/admin-error-state/admin-error-state';
import { AdminHtmlEditor } from '../../../shared/admin-ui/admin-html-editor/admin-html-editor';
import { AdminFormContext } from '../../../shared/admin-ui/admin-form-context/admin-form-context';
import { LegalPageApi } from '../../paginas-legales/data/legal-page.api';
import {
  LEGAL_PAGE_DEFAULTS,
  LEGAL_PAGE_LABELS,
  LegalPageKey,
  LegalPageSettings,
  isLegalPageKey,
} from '../../paginas-legales/data/legal-page.model';
import { AdminToastService } from '../../../shared/admin-ui/admin-toast/admin-toast.service';

const KNOWN_KEYS: LegalPageKey[] = ['aviso-legal', 'politica-datos'];

@Component({
  selector: 'app-admin-paginas-legales',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AdminPageHeader,
    AdminTabs,
    AdminErrorState,
    AdminHtmlEditor,
  ],
  templateUrl: './paginas-legales.html',
  styleUrl: './paginas-legales.css',
})
export class AdminPaginasLegales implements OnInit {
  private readonly api = inject(LegalPageApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(AdminToastService);
  private readonly formCtx = inject(AdminFormContext);
  private readonly destroyRef = inject(DestroyRef);

  readonly tabs: AdminTab[] = KNOWN_KEYS.map((key) => ({
    id: key,
    label: LEGAL_PAGE_LABELS[key],
  }));

  readonly selectedKey = signal<LegalPageKey>('aviso-legal');
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly updatedAt = signal<string | null>(null);

  private readonly _dirtyTick = signal(0);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    bodyHtml: [''],
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
    this.loadKey('aviso-legal');
  }

  discardChanges(): void {
    this.loadKey(this.selectedKey());
  }

  selectKey(key: string): void {
    if (!isLegalPageKey(key)) return;
    this.selectedKey.set(key);
    this.loadKey(key);
  }

  loadKey(key: LegalPageKey): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.get(key).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.updatedAt.set(res.updatedAt);
        this.patchForm(res.settings);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.updatedAt.set(null);
        if (isAppError(err) && err.status === 404) {
          this.patchForm(LEGAL_PAGE_DEFAULTS[key]);
          this.toast.info(
            `La página «${LEGAL_PAGE_LABELS[key]}» aún no existe. Guardá para crearla.`,
          );
          return;
        }
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  onRetryLoad(): void {
    this.loadKey(this.selectedKey());
  }

  onBodyHtmlChange(html: string): void {
    this.form.controls.bodyHtml.setValue(html);
    this.form.controls.bodyHtml.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(localErrorMessage('Completá el título de la página'));
      return;
    }

    const key = this.selectedKey();
    const raw = this.form.getRawValue();
    const value: LegalPageSettings = {
      title: raw.title.trim() || LEGAL_PAGE_DEFAULTS[key].title,
      bodyHtml: raw.bodyHtml,
    };

    this.saving.set(true);
    this.error.set(null);
    this.api.upsert(key, value).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.updatedAt.set(res.updatedAt);
        this.toast.success('Guardado correctamente');
        this.patchForm(res.settings);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  private patchForm(settings: LegalPageSettings): void {
    this.form.patchValue({
      title: settings.title,
      bodyHtml: settings.bodyHtml,
    });
    this.form.markAsPristine();
    this._dirtyTick.update((n) => n + 1);
  }
}
