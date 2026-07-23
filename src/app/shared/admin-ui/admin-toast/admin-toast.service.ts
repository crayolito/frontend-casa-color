import { Injectable, signal } from '@angular/core';

export type AdminToastTone = 'success' | 'error' | 'info';

export interface AdminToast {
  id: number;
  message: string;
  tone: AdminToastTone;
  durationMs: number;
  /** 0..1 remaining; updated by the host while running. */
  progress: number;
  paused: boolean;
}

const DEFAULT_DURATION_MS = 4500;
const MAX_VISIBLE = 4;

@Injectable({ providedIn: 'root' })
export class AdminToastService {
  private nextId = 1;
  readonly toasts = signal<AdminToast[]>([]);

  show(opts: {
    message: string;
    tone?: AdminToastTone;
    durationMs?: number;
  }): void {
    const toast: AdminToast = {
      id: this.nextId++,
      message: opts.message.trim(),
      tone: opts.tone ?? 'info',
      durationMs: opts.durationMs ?? DEFAULT_DURATION_MS,
      progress: 1,
      paused: false,
    };
    if (!toast.message) return;

    this.toasts.update((list) => {
      const next = [...list, toast];
      return next.length > MAX_VISIBLE ? next.slice(-MAX_VISIBLE) : next;
    });
  }

  success(message: string, durationMs?: number): void {
    this.show({ message, tone: 'success', durationMs });
  }

  error(message: string, durationMs?: number): void {
    this.show({ message, tone: 'error', durationMs });
  }

  info(message: string, durationMs?: number): void {
    this.show({ message, tone: 'info', durationMs });
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  setPaused(id: number, paused: boolean): void {
    this.toasts.update((list) =>
      list.map((t) => (t.id === id ? { ...t, paused } : t)),
    );
  }

  setProgress(id: number, progress: number): void {
    this.toasts.update((list) =>
      list.map((t) =>
        t.id === id ? { ...t, progress: Math.max(0, Math.min(1, progress)) } : t,
      ),
    );
  }
}
