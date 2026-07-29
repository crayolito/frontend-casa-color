import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';
import { fromEvent } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { AdminSidebar } from './admin-sidebar/admin-sidebar';
import { AdminTopbar } from './admin-topbar/admin-topbar';
import { AdminToastHost } from '../../../shared/admin-ui/admin-toast/admin-toast-host';

const AUTO_COLLAPSE_MIN = 1680;

@Component({
  selector: 'app-admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AdminSidebar, AdminTopbar, AdminToastHost],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShell implements OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly navOpen = signal(false);
  readonly sidebarCollapsed = signal(false);
  /** Si el usuario tocó el collapse manualmente, no auto-ajustar. */
  private userToggled = false;

  ngOnInit(): void {
    this.syncCollapseToViewport();
    fromEvent(this.document.defaultView ?? window, 'resize', { passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncCollapseToViewport());
  }

  toggleNav(): void {
    this.navOpen.update((open) => !open);
  }

  closeNav(): void {
    this.navOpen.set(false);
  }

  toggleCollapse(): void {
    this.userToggled = true;
    this.sidebarCollapsed.update((v) => !v);
  }

  private syncCollapseToViewport(): void {
    if (this.userToggled) return;
    const width = this.document.defaultView?.innerWidth ?? 0;
    // En viewports muy anchos dejamos sidebar expandida (más aire al contenido centrado).
    // En laptop típico (≤1679) colapsamos para centrar mejor el content.
    this.sidebarCollapsed.set(width > 0 && width < AUTO_COLLAPSE_MIN);
  }
}
