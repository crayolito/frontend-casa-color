import { Injectable, signal } from '@angular/core';

/**
 * Ref-counted lock for the admin shell scroll container.
 * Modals acquire on open and release on close so stacked dialogs stay correct.
 */
@Injectable({ providedIn: 'root' })
export class AdminScrollLockService {
  private count = 0;
  readonly locked = signal(false);

  acquire(): void {
    this.count += 1;
    this.locked.set(true);
  }

  release(): void {
    this.count = Math.max(0, this.count - 1);
    this.locked.set(this.count > 0);
  }
}
