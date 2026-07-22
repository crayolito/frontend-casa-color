import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { AdminButton } from '../admin-button/admin-button';
import { AdminIcon } from '../icons/admin-icon';

@Component({
  selector: 'app-admin-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminButton, AdminIcon],
  template: `
    <div class="admin-filters">
      <div class="admin-filters__fields">
        <ng-content />
      </div>
      <div class="admin-filters__meta">
        @if (total() !== null) {
          <p class="admin-filters__count" aria-live="polite">
            {{ total() }} resultado{{ total() === 1 ? '' : 's' }}
          </p>
        }
        @if (hasActiveFilters()) {
          <app-admin-button type="button" variant="ghost" (clicked)="cleared.emit()">
            <app-admin-icon name="x" />
            Limpiar
          </app-admin-button>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      margin-bottom: 1rem;
    }

    .admin-filters {
      background: var(--color-white);
      padding: 1rem 1.25rem;
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05), 0 4px 20px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .admin-filters__fields {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: flex-end;
    }

    .admin-filters__meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .admin-filters__count {
      margin: 0;
      font-size: 0.8125rem;
      color: var(--color-text-muted);
    }

    :host ::ng-deep .admin-filters__field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 160px;
      flex: 1;
    }

    :host ::ng-deep .admin-filters__label {
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    :host ::ng-deep .admin-filters__input {
      min-height: 40px;
      padding: 0.5rem 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.15);
      border-radius: var(--radius);
      font-family: var(--font-body);
      font-size: 0.9375rem;
      background: var(--color-white);
    }

    :host ::ng-deep .admin-filters__input:focus {
      outline: 2px solid var(--color-extra-1);
      border-color: var(--color-accent);
    }
  `,
})
export class AdminFilters {
  readonly total = input<number | null>(null);
  readonly hasActiveFilters = input(false);
  readonly cleared = output<void>();
}
