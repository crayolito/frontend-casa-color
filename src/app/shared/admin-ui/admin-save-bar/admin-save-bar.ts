import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { AdminButton } from '../admin-button/admin-button';

@Component({
  selector: 'app-admin-save-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminButton],
  template: `
    @if (dirty()) {
      <div class="admin-save-bar" role="status" aria-live="polite">
        <div class="admin-save-bar__inner">
          <p class="admin-save-bar__title">{{ title() }}</p>
          <div class="admin-save-bar__actions">
            <app-admin-button
              type="button"
              variant="ghost"
              (clicked)="discard.emit()"
            >
              Descartar
            </app-admin-button>
            <app-admin-button
              type="button"
              variant="primary"
              [loading]="saving()"
              (clicked)="save.emit()"
            >
              Guardar
            </app-admin-button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .admin-save-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 30;
      background: var(--color-white);
      border-top: 1px solid rgba(221, 51, 51, 0.25);
      box-shadow: var(--admin-card-shadow-hover);
      animation: admin-save-bar-in 0.25s ease-out;
    }

    .admin-save-bar__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--admin-gap-lg);
      max-width: 75rem;
      margin-inline: auto;
      padding: 0.75rem 1.15rem;
      box-sizing: border-box;
    }

    .admin-save-bar__title {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text);
    }

    .admin-save-bar__title::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      background: var(--color-accent);
      border-radius: 50%;
      flex-shrink: 0;
    }

    .admin-save-bar__actions {
      display: flex;
      align-items: center;
      gap: var(--admin-gap);
      flex-shrink: 0;
    }

    @media (min-width: 1000px) {
      .admin-save-bar__inner {
        padding: 0.75rem 2rem;
      }
    }

    @media (min-width: 1440px) {
      .admin-save-bar__inner {
        max-width: 80rem;
        padding: 0.75rem 2.5rem;
      }
    }

    @media (min-width: 1680px) {
      .admin-save-bar__inner {
        max-width: 82.5rem;
        padding: 0.75rem 3rem;
      }
    }

    @media (max-width: 640px) {
      .admin-save-bar__inner {
        flex-direction: column;
        align-items: stretch;
        gap: var(--admin-gap);
      }

      .admin-save-bar__actions {
        flex-direction: column;
        width: 100%;
      }
    }

    @keyframes admin-save-bar-in {
      from {
        transform: translateY(100%);
      }

      to {
        transform: translateY(0);
      }
    }
  `,
})
export class AdminSaveBar {
  readonly dirty = input(false);
  readonly saving = input(false);
  readonly title = input('Cambios sin guardar');
  readonly save = output<void>();
  readonly discard = output<void>();
}
