import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SiteSettingsApi } from '../data/site-settings.api';
import { ContactoSettings } from '../data/admin.models';
import { isAppError } from '../../../shared/util/api-errors';
import {
  ResolvedErrorMessage,
  localErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { AdminPageHeader } from '../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminButton } from '../../../shared/admin-ui/admin-button/admin-button';
import { AdminFormField } from '../../../shared/admin-ui/admin-form-field/admin-form-field';
import { AdminErrorState } from '../../../shared/admin-ui/admin-error-state/admin-error-state';
import { ImageUploader } from '../../../shared/admin-ui/image-uploader/image-uploader';

const CONTACTO_KEY = 'contacto';

const DEFAULTS: ContactoSettings = {
  heroImageUrl: '',
  centralAddressLines: [
    'Av. Cristo Redentor 2850',
    'Equipetrol Norte',
    'Santa Cruz de la Sierra',
    'BOLIVIA',
  ],
  centralPhone: '+591 3 344-1200',
  centralWhatsapp: '59133441200',
  centralEmail: 'info@pinturas-colom.bo',
  attentionLabel: 'Atención al Cliente',
  infoRequestLabel: 'Solicitud de Información',
};

function linesToTextarea(lines: string[]): string {
  return lines.join('\n');
}

function textareaToLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function parseSettings(value: Record<string, unknown>): ContactoSettings {
  const addressLines = Array.isArray(value['centralAddressLines'])
    ? (value['centralAddressLines'] as unknown[]).filter(
        (l): l is string => typeof l === 'string',
      )
    : DEFAULTS.centralAddressLines;

  return {
    heroImageUrl:
      typeof value['heroImageUrl'] === 'string'
        ? value['heroImageUrl']
        : DEFAULTS.heroImageUrl,
    centralAddressLines:
      addressLines.length > 0 ? addressLines : DEFAULTS.centralAddressLines,
    centralPhone:
      typeof value['centralPhone'] === 'string'
        ? value['centralPhone']
        : DEFAULTS.centralPhone,
    centralWhatsapp:
      typeof value['centralWhatsapp'] === 'string'
        ? value['centralWhatsapp']
        : DEFAULTS.centralWhatsapp,
    centralEmail:
      typeof value['centralEmail'] === 'string'
        ? value['centralEmail']
        : DEFAULTS.centralEmail,
    attentionLabel:
      typeof value['attentionLabel'] === 'string'
        ? value['attentionLabel']
        : DEFAULTS.attentionLabel,
    infoRequestLabel:
      typeof value['infoRequestLabel'] === 'string'
        ? value['infoRequestLabel']
        : DEFAULTS.infoRequestLabel,
  };
}

@Component({
  selector: 'app-admin-contacto-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AdminPageHeader,
    AdminButton,
    AdminFormField,
    AdminErrorState,
    ImageUploader,
  ],
  templateUrl: './contacto-settings.html',
  styleUrl: './contacto-settings.css',
})
export class AdminContactoSettings implements OnInit {
  private readonly api = inject(SiteSettingsApi);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly flash = signal<string | null>(null);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly updatedAt = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    heroImageUrl: [''],
    centralAddressLines: [
      linesToTextarea(DEFAULTS.centralAddressLines),
      [Validators.required],
    ],
    centralPhone: [DEFAULTS.centralPhone, [Validators.required]],
    centralWhatsapp: [DEFAULTS.centralWhatsapp, [Validators.required]],
    centralEmail: [
      DEFAULTS.centralEmail,
      [Validators.required, Validators.email],
    ],
    attentionLabel: [DEFAULTS.attentionLabel, [Validators.required]],
    infoRequestLabel: [DEFAULTS.infoRequestLabel, [Validators.required]],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.flash.set(null);
    this.api.get(CONTACTO_KEY).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.updatedAt.set(res.updatedAt);
        this.patchForm(parseSettings(res.value));
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.updatedAt.set(null);
        if (isAppError(err) && err.status === 404) {
          this.patchForm(DEFAULTS);
          this.flash.set(
            'La configuración de contacto aún no existe. Guardá para crearla.',
          );
          return;
        }
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  onRetryLoad(): void {
    this.load();
  }

  onHeroChange(url: string | null): void {
    this.form.controls.heroImageUrl.setValue(url ?? '');
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const centralAddressLines = textareaToLines(raw.centralAddressLines);
    if (centralAddressLines.length === 0) {
      this.error.set(localErrorMessage('La dirección central es requerida'));
      return;
    }

    const value: ContactoSettings = {
      heroImageUrl: raw.heroImageUrl.trim(),
      centralAddressLines,
      centralPhone: raw.centralPhone.trim(),
      centralWhatsapp: raw.centralWhatsapp.trim().replace(/\D/g, ''),
      centralEmail: raw.centralEmail.trim(),
      attentionLabel: raw.attentionLabel.trim(),
      infoRequestLabel: raw.infoRequestLabel.trim(),
    };

    this.saving.set(true);
    this.error.set(null);
    this.api.upsert(CONTACTO_KEY, { ...value }).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.updatedAt.set(res.updatedAt);
        this.flash.set('Guardado correctamente');
        this.patchForm(parseSettings(res.value));
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  private patchForm(settings: ContactoSettings): void {
    this.form.patchValue({
      heroImageUrl: settings.heroImageUrl,
      centralAddressLines: linesToTextarea(settings.centralAddressLines),
      centralPhone: settings.centralPhone,
      centralWhatsapp: settings.centralWhatsapp,
      centralEmail: settings.centralEmail,
      attentionLabel: settings.attentionLabel,
      infoRequestLabel: settings.infoRequestLabel,
    });
  }
}
