import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebar } from './admin-sidebar/admin-sidebar';
import { AdminTopbar } from './admin-topbar/admin-topbar';
import { AdminToastHost } from '../../../shared/admin-ui/admin-toast/admin-toast-host';

@Component({
  selector: 'app-admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AdminSidebar, AdminTopbar, AdminToastHost],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.css',
})
export class AdminShell {
  readonly navOpen = signal(false);
  readonly sidebarCollapsed = signal(false);

  toggleNav(): void {
    this.navOpen.update((open) => !open);
  }

  closeNav(): void {
    this.navOpen.set(false);
  }

  toggleCollapse(): void {
    this.sidebarCollapsed.update((v) => !v);
  }
}
