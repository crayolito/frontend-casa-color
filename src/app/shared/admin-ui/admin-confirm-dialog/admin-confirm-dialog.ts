import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { AdminModal } from '../admin-modal/admin-modal';
import { AdminButton } from '../admin-button/admin-button';

@Component({
  selector: 'app-admin-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminModal, AdminButton],
  template: `
    <app-admin-modal
      [open]="open()"
      [title]="title()"
      (closed)="cancelled.emit()"
    >
      <p class="admin-confirm__message">{{ message() }}</p>
      @if (warning(); as warn) {
        <p class="admin-confirm__warning" role="status">{{ warn }}</p>
      }
      <div class="admin-confirm__actions">
        <app-admin-button variant="secondary" type="button" (clicked)="cancelled.emit()">
          Cancelar
        </app-admin-button>
        <app-admin-button
          variant="danger"
          type="button"
          [loading]="loading()"
          (clicked)="confirmed.emit()"
        >
          {{ confirmLabel() }}
        </app-admin-button>
      </div>
    </app-admin-modal>
  `,
  styles: `
    .admin-confirm__message {
      margin: 0 0 1rem;
      color: var(--color-text);
      line-height: 1.5;
    }

    .admin-confirm__warning {
      margin: 0 0 1.25rem;
      padding: 0.75rem 1rem;
      background: rgba(221, 51, 51, 0.08);
      color: var(--color-accent);
      font-size: 0.875rem;
      font-weight: 600;
    }

    .admin-confirm__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
  `,
})
export class AdminConfirmDialog {
  readonly open = input(false);
  readonly title = input('Confirmar');
  readonly message = input.required<string>();
  readonly warning = input<string | null>(null);
  readonly confirmLabel = input('Eliminar');
  readonly loading = input(false);
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
