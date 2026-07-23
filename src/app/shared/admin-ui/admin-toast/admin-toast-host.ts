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
          <span class="admin-toast__rail" aria-hidden="true"></span>
          <span class="admin-toast__icon" aria-hidden="true">
            <app-admin-icon [name]="iconFor(toast.tone)" [size]="16" />
          </span>
          <p class="admin-toast__msg">{{ toast.message }}</p>
          <button
            type="button"
            class="admin-toast__close"
            aria-label="Cerrar"
            (click)="toastSvc.dismiss(toast.id)"
          >
            <app-admin-icon name="x" [size]="13" />
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
      width: min(380px, calc(100vw - 2rem));
      pointer-events: none;
    }

    @media (min-width: 1000px) {
      .admin-toast-host {
        right: 2rem;
        bottom: 1.75rem;
      }
    }

    /* Tono solo como ACENTO, no como fondo. La tarjeta es blanca como el modal. */
    .admin-toast {
      --toast-accent: var(--color-extra-3);
      --toast-accent-soft: rgba(129, 215, 66, 0.14);
      pointer-events: auto;
      position: relative;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: start;
      gap: 0.625rem;
      padding: 0.75rem 0.75rem 0.875rem 0.625rem;
      background: var(--color-white);
      border: 1px solid var(--admin-border);
      border-radius: var(--radius-md);
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.06),
        0 12px 32px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      animation: admin-toast-in 0.28s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .admin-toast[data-tone='success'] {
      --toast-accent: #2d6a0e;
      --toast-accent-soft: rgba(129, 215, 66, 0.18);
    }

    .admin-toast[data-tone='error'] {
      --toast-accent: var(--color-accent);
      --toast-accent-soft: rgba(221, 51, 51, 0.1);
    }

    .admin-toast[data-tone='info'] {
      --toast-accent: #0a6a82;
      --toast-accent-soft: rgba(42, 196, 234, 0.14);
    }

    .admin-toast--paused {
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.06),
        0 12px 32px rgba(0, 0, 0, 0.08),
        0 0 0 1px var(--toast-accent);
    }

    /* Rail fino: identificador del tono, no ruido cromático */
    .admin-toast__rail {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--toast-accent);
      border-radius: var(--radius-md) 0 0 var(--radius-md);
    }

    /* Chip del icono: el único bloque con color, da jerarquía visual */
    .admin-toast__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      margin-top: 0.0625rem;
      border-radius: 50%;
      background: var(--toast-accent-soft);
      color: var(--toast-accent);
      flex-shrink: 0;
    }

    .admin-toast__msg {
      margin: 0;
      align-self: center;
      min-width: 0;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.4;
      color: var(--color-text);
    }

    .admin-toast__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      margin-top: 0.125rem;
      border: 0;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--color-text-muted);
      opacity: 0.55;
      cursor: pointer;
      transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease;
    }

    .admin-toast__close:hover {
      opacity: 1;
      color: var(--toast-accent);
      background: var(--toast-accent-soft);
    }

    .admin-toast__close:focus-visible {
      outline: 2px solid var(--color-extra-1);
      outline-offset: 2px;
      opacity: 1;
    }

    /* Barra de progreso sutil: avisa el tiempo restante sin gritar */
    .admin-toast__track {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 2px;
      background: var(--admin-border);
      opacity: 0.7;
    }

    .admin-toast__bar {
      height: 100%;
      width: 100%;
      transform-origin: left center;
      background: var(--toast-accent);
      opacity: 0.55;
    }

    .admin-toast--paused .admin-toast__bar {
      opacity: 0.25;
    }

    @keyframes admin-toast-in {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
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

