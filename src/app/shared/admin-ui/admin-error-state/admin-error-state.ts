import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
} from '@angular/core';
import { AdminButton } from '../admin-button/admin-button';

@Component({
  selector: 'app-admin-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminButton],
  template: `
    <div class="admin-error-state" role="alert">
      <p class="admin-error-state__message">{{ message() }}</p>

      @if (showCorrelationId() && correlationId(); as corr) {
        <p class="admin-error-state__corr">
          Código de referencia:
          <code>{{ corr }}</code>
          <button
            type="button"
            class="admin-error-state__copy"
            (click)="copyCorrelationId(corr)"
          >
            {{ copied() ? 'Copiado' : 'Copiar' }}
          </button>
          — compartilo con soporte.
        </p>
      }

      @if (showRetry()) {
        <div class="admin-error-state__actions">
          <app-admin-button
            variant="secondary"
            type="button"
            (clicked)="retry.emit()"
          >
            Reintentar
          </app-admin-button>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .admin-error-state {
      padding: 1rem 1.25rem;
      border: 1px solid rgba(221, 51, 51, 0.35);
      border-radius: var(--radius-md);
      background: rgba(221, 51, 51, 0.06);
    }

    .admin-error-state__message {
      margin: 0;
      color: #8a1f1f;
      font-size: 0.9375rem;
      line-height: 1.45;
    }

    .admin-error-state__corr {
      margin: 0.65rem 0 0;
      font-size: 0.8125rem;
      color: var(--color-text-muted);
      line-height: 1.4;
    }

    .admin-error-state__corr code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.78rem;
      background: rgba(0, 0, 0, 0.05);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      user-select: all;
    }

    .admin-error-state__copy {
      margin-left: 0.35rem;
      padding: 0.15rem 0.45rem;
      border: 1px solid var(--admin-border);
      border-radius: 4px;
      background: var(--color-white);
      font-size: 0.75rem;
      cursor: pointer;
    }

    .admin-error-state__copy:hover {
      border-color: rgba(221, 51, 51, 0.45);
      color: var(--color-accent);
    }

    .admin-error-state__copy:focus-visible {
      outline: 2px solid var(--color-extra-1);
      outline-offset: 2px;
    }

    .admin-error-state__actions {
      margin-top: 0.85rem;
    }
  `,
})
export class AdminErrorState {
  readonly message = input.required<string>();
  readonly correlationId = input<string | null>(null);
  readonly showCorrelationId = input(false);
  readonly showRetry = input(true);
  readonly retry = output<void>();

  protected readonly copied = signal(false);

  protected async copyCorrelationId(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.copied.set(true);
      window.setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.copied.set(false);
    }
  }
}
