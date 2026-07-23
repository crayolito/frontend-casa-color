import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';

export type AdminButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

@Component({
  selector: 'app-admin-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="admin-btn"
      [class]="variantClass()"
      [attr.type]="type()"
      [disabled]="disabled() || loading()"
      (click)="clicked.emit()"
    >
      @if (loading()) {
        <span class="admin-btn__spinner" aria-hidden="true"></span>
      }
      <ng-content />
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .admin-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: 40px;
      padding: 0.625rem 1.25rem;
      border: 1px solid transparent;
      border-radius: var(--radius-md);
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease,
        box-shadow 0.2s ease;
    }

    .admin-btn:focus-visible {
      outline: 2px solid var(--color-extra-1);
      outline-offset: 2px;
    }

    .admin-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .admin-btn--primary {
      background: var(--color-accent);
      color: var(--color-white);
      border-color: var(--color-accent);
      box-shadow: 0 1px 2px rgba(221, 51, 51, 0.2);
    }

    .admin-btn--primary:hover:not(:disabled) {
      background: #b82b2b;
      border-color: #b82b2b;
    }

    .admin-btn--secondary {
      background: var(--color-white);
      color: var(--color-text);
      border-color: var(--admin-border);
    }

    .admin-btn--secondary:hover:not(:disabled) {
      border-color: rgba(221, 51, 51, 0.45);
      color: var(--color-accent);
      background: rgba(221, 51, 51, 0.03);
    }

    .admin-btn--danger {
      background: var(--color-accent);
      color: var(--color-white);
      border-color: var(--color-accent);
    }

    .admin-btn--danger:hover:not(:disabled) {
      background: #b82b2b;
      border-color: #b82b2b;
    }

    .admin-btn--ghost {
      background: transparent;
      color: var(--color-text);
      border-color: transparent;
    }

    .admin-btn--ghost:hover:not(:disabled) {
      color: var(--color-accent);
      background: rgba(221, 51, 51, 0.06);
    }

    .admin-btn__spinner {
      width: 14px;
      height: 14px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: admin-spin 0.6s linear infinite;
    }

    @keyframes admin-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class AdminButton {
  readonly variant = input<AdminButtonVariant>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly clicked = output<void>();

  protected variantClass(): string {
    return `admin-btn--${this.variant()}`;
  }
}
