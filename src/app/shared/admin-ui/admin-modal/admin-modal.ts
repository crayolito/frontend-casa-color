import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  effect,
  inject,
  DestroyRef,
} from '@angular/core';
import { AdminScrollLockService } from '../admin-scroll-lock.service';

@Component({
  selector: 'app-admin-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="admin-modal" role="presentation">
        <button
          type="button"
          class="admin-modal__backdrop"
          aria-label="Cerrar"
          (click)="closed.emit()"
        ></button>
        <div
          class="admin-modal__panel"
          [class.admin-modal__panel--wide]="wide()"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
        >
          <header class="admin-modal__header">
            <h2 class="admin-modal__title" [id]="titleId">{{ title() }}</h2>
            <button
              type="button"
              class="admin-modal__close"
              aria-label="Cerrar diálogo"
              (click)="closed.emit()"
            >
              ×
            </button>
          </header>
          <div class="admin-modal__body">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .admin-modal {
      position: fixed;
      inset: 0;
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .admin-modal__backdrop {
      position: absolute;
      inset: 0;
      border: 0;
      background: rgba(0, 0, 0, 0.45);
      cursor: pointer;
    }

    .admin-modal__panel {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 560px;
      max-height: 90vh;
      overflow: hidden;
      background: var(--color-white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--admin-border);
      box-shadow: var(--admin-card-shadow-hover);
    }

    .admin-modal__panel--wide {
      max-width: 42rem;
    }

    .admin-modal__header {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--admin-border);
    }

    .admin-modal__title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 300;
      color: #333;
    }

    .admin-modal__close {
      border: 0;
      background: transparent;
      font-size: 1.5rem;
      line-height: 1;
      color: var(--color-text);
      cursor: pointer;
      padding: 0.25rem;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
    }

    .admin-modal__close:hover {
      color: var(--color-accent);
      background: rgba(221, 51, 51, 0.06);
    }

    .admin-modal__body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 1.5rem;
      -webkit-overflow-scrolling: touch;
    }
  `,
})
export class AdminModal {
  private readonly scrollLock = inject(AdminScrollLockService);
  private readonly destroyRef = inject(DestroyRef);
  private holdingLock = false;

  readonly open = input(false);
  readonly title = input.required<string>();
  /** Modal más ancho (formularios con editor HTML, etc.). */
  readonly wide = input(false);
  readonly closed = output<void>();

  protected readonly titleId = `admin-modal-title-${Math.random().toString(36).slice(2, 9)}`;

  constructor() {
    effect(() => {
      const isOpen = this.open();
      if (isOpen && !this.holdingLock) {
        this.scrollLock.acquire();
        this.holdingLock = true;
      } else if (!isOpen && this.holdingLock) {
        this.scrollLock.release();
        this.holdingLock = false;
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.holdingLock) {
        this.scrollLock.release();
        this.holdingLock = false;
      }
    });
  }
}
