import {
  Component,
  ChangeDetectionStrategy,
  HostListener,
  inject,
  output,
  signal,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdminButton } from '../../../../shared/admin-ui/admin-button/admin-button';
import { AdminIcon } from '../../../../shared/admin-ui/icons/admin-icon';

const COMMANDS = [
  { label: 'Productos', path: '/admin/products', hint: 'Listado' },
  { label: 'Nuevo producto', path: '/admin/products/new', hint: 'Crear' },
  { label: 'Categorías', path: '/admin/categories', hint: 'Listado' },
  { label: 'Catálogos', path: '/admin/catalogs', hint: 'Listado' },
  { label: 'Inicio', path: '/admin/home', hint: 'Página de inicio' },
  { label: 'Datos del sitio', path: '/admin/settings', hint: 'Ajustes' },
];

@Component({
  selector: 'app-admin-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminButton, AdminIcon],
  templateUrl: './admin-topbar.html',
  styleUrl: './admin-topbar.css',
})
export class AdminTopbar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuToggle = output<void>();
  readonly collapseToggle = output<void>();

  readonly searchOpen = signal(false);
  readonly searchQuery = signal('');

  readonly filteredCommands = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q),
    );
  });

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.searchOpen.update((v) => !v);
      if (this.searchOpen()) this.searchQuery.set('');
    }
    if (event.key === 'Escape' && this.searchOpen()) {
      this.searchOpen.set(false);
    }
  }

  openSearch(): void {
    this.searchOpen.set(true);
    this.searchQuery.set('');
  }

  closeSearch(): void {
    this.searchOpen.set(false);
  }

  goTo(path: string): void {
    this.searchOpen.set(false);
    void this.router.navigateByUrl(path);
  }

  logout(): void {
    this.auth.logout();
  }
}
