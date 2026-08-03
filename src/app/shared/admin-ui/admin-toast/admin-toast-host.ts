import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnDestroy,
  effect,
} from '@angular/core';
import {
  AdminToastService,
  AdminToast,
  AdminToastTone,
} from './admin-toast.service';
import { AdminIcon, type AdminIconName } from '../icons/admin-icon';

interface ToastTimer {
  remainingMs: number;
  lastTick: number;
  raf: number | null;
}

const TONE_ICON: Record<AdminToastTone, AdminIconName> = {
  success: 'check',
  error: 'alert',
  info: 'info',
};

@Component({
  selector: 'app-admin-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminIcon],
  template: `
    <div class="admin-toast-host" aria-live="polite" aria-relevant="additions">
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div
          class="admin-toast"
          [attr.data-tone]="toast.tone"
          [class.admin-toast--paused]="toast.paused"
          role="status"
          (mouseenter)="onEnter(toast)"
          (mouseleave)="onLeave(toast)"
        >
          <span class="admin-toast__icon" aria-hidden="true">
            <app-admin-icon [name]="iconFor(toast.tone)" [size]="15" />
          </span>
          <p class="admin-toast__msg">{{ toast.message }}</p>
          <button
            type="button"
            class="admin-toast__close"
            aria-label="Cerrar"
            (click)="toastSvc.dismiss(toast.id)"
          >
            ×
          </button>
          <div class="admin-toast__track" aria-hidden="true">
            <div
              class="admin-toast__bar"
              [style.transform]="'scaleX(' + toast.progress + ')'"
            ></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }

    .admin-toast-host {
      position: fixed;
      right: 1.15rem;
      bottom: 1.15rem;
      z-index: 3000;
      display: flex;
      flex-direction: column-reverse;
      gap: 0.5rem;
      width: min(22rem, calc(100vw - 2rem));
      pointer-events: none;
    }

    @media (min-width: 1000px) {
      .admin-toast-host {
        right: 2rem;
        bottom: 1.5rem;
      }
    }

    /* Misma familia que modal/tabla admin: blanco, borde fino, sombra del sistema. */
    .admin-toast {
      --toast-fg: var(--color-text);
      pointer-events: auto;
      position: relative;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 0.625rem;
      padding: 0.8125rem 0.75rem 0.9375rem;
      background: var(--color-white);
      border: 1px solid var(--admin-border);
      border-radius: var(--radius-md);
      box-shadow: var(--admin-card-shadow);
      overflow: hidden;
      animation: admin-toast-in 0.2s ease-out;
    }

    .admin-toast[data-tone='success'] {
      --toast-fg: #3d3d3d;
    }

    .admin-toast[data-tone='error'] {
      --toast-fg: var(--color-accent);
    }

    .admin-toast[data-tone='info'] {
      --toast-fg: var(--color-text);
    }

    .admin-toast--paused {
      box-shadow: var(--admin-card-shadow-hover);
    }

    .admin-toast__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--toast-fg);
      flex-shrink: 0;
      opacity: 0.85;
    }

    .admin-toast[data-tone='error'] .admin-toast__icon {
      opacity: 1;
    }

    .admin-toast__msg {
      margin: 0;
      min-width: 0;
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.4;
      letter-spacing: 0;
      color: #333;
    }

    .admin-toast__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: var(--radius-md);
      background: transparent;
      font-size: 1.25rem;
      line-height: 1;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 0;
    }

    .admin-toast__close:hover {
      color: var(--color-accent);
      background: rgba(221, 51, 51, 0.06);
    }

    .admin-toast__close:focus-visible {
      outline: 2px solid var(--color-extra-1);
      outline-offset: 2px;
    }

    .admin-toast__track {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      background: transparent;
    }

    .admin-toast__bar {
      height: 100%;
      width: 100%;
      transform-origin: left center;
      background: var(--admin-border);
    }

    .admin-toast[data-tone='error'] .admin-toast__bar {
      background: rgba(221, 51, 51, 0.35);
    }

    .admin-toast--paused .admin-toast__bar {
      opacity: 0.4;
    }

    @keyframes admin-toast-in {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .admin-toast {
        animation: none;
      }
    }
  `,
})
export class AdminToastHost implements OnDestroy {
  readonly toastSvc = inject(AdminToastService);
  private readonly timers = new Map<number, ToastTimer>();

  constructor() {
    effect(() => {
      const ids = new Set(this.toastSvc.toasts().map((t) => t.id));
      for (const id of [...this.timers.keys()]) {
        if (!ids.has(id)) this.clearTimer(id);
      }
      for (const toast of this.toastSvc.toasts()) {
        if (!this.timers.has(toast.id)) {
          this.startTimer(toast);
        }
      }
    });
  }

  iconFor(tone: AdminToastTone): AdminIconName {
    return TONE_ICON[tone];
  }

  ngOnDestroy(): void {
    for (const id of [...this.timers.keys()]) {
      this.clearTimer(id);
    }
  }

  onEnter(toast: AdminToast): void {
    this.toastSvc.setPaused(toast.id, true);
    const timer = this.timers.get(toast.id);
    if (timer) {
      this.tick(toast.id, performance.now());
    }
  }

  onLeave(toast: AdminToast): void {
    this.toastSvc.setPaused(toast.id, false);
    const timer = this.timers.get(toast.id);
    if (timer) {
      timer.lastTick = performance.now();
      this.schedule(toast.id);
    }
  }

  private startTimer(toast: AdminToast): void {
    this.timers.set(toast.id, {
      remainingMs: toast.durationMs,
      lastTick: performance.now(),
      raf: null,
    });
    this.schedule(toast.id);
  }

  private schedule(id: number): void {
    const timer = this.timers.get(id);
    if (!timer) return;
    if (timer.raf !== null) cancelAnimationFrame(timer.raf);
    timer.raf = requestAnimationFrame((now) => this.tick(id, now));
  }

  private tick(id: number, now: number): void {
    const timer = this.timers.get(id);
    const toast = this.toastSvc.toasts().find((t) => t.id === id);
    if (!timer || !toast) {
      this.clearTimer(id);
      return;
    }

    if (!toast.paused) {
      const delta = now - timer.lastTick;
      timer.remainingMs -= delta;
      timer.lastTick = now;
      const progress = timer.remainingMs / toast.durationMs;
      this.toastSvc.setProgress(id, progress);
      if (timer.remainingMs <= 0) {
        this.toastSvc.dismiss(id);
        this.clearTimer(id);
        return;
      }
    } else {
      timer.lastTick = now;
    }

    timer.raf = requestAnimationFrame((t) => this.tick(id, t));
  }

  private clearTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer?.raf !== null && timer?.raf !== undefined) {
      cancelAnimationFrame(timer.raf);
    }
    this.timers.delete(id);
  }
}
