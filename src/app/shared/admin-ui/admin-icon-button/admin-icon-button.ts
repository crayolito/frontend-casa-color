import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { AdminIcon, type AdminIconName } from '../icons/admin-icon';

export type AdminIconButtonVariant = 'default' | 'danger';

@Component({
  selector: 'app-admin-icon-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminIcon],
  template: `
    <button
      type="button"
      class="admin-icon-btn"
      [class.admin-icon-btn--danger]="variant() === 'danger'"
      [attr.aria-label]="label()"
      [title]="label()"
      [disabled]="disabled()"
      (click)="clicked.emit()"
    >
      <app-admin-icon [name]="icon()" [size]="size()" />
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .admin-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--color-text);
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: color 0.15s ease, background 0.15s ease;
    }

    .admin-icon-btn:hover:not(:disabled) {
      color: var(--color-accent);
      background: rgba(221, 51, 51, 0.08);
    }

    .admin-icon-btn--danger:hover:not(:disabled) {
      color: #b82b2b;
      background: rgba(221, 51, 51, 0.1);
    }

    .admin-icon-btn:focus-visible {
      outline: 2px solid var(--color-extra-1);
      outline-offset: 2px;
    }

    .admin-icon-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export class AdminIconButton {
  readonly icon = input.required<AdminIconName>();
  readonly label = input.required<string>();
  readonly variant = input<AdminIconButtonVariant>('default');
  readonly size = input(18);
  readonly disabled = input(false);
  readonly clicked = output<void>();
}
