import {
  Component,
  ChangeDetectionStrategy,
  computed,
  HostListener,
  inject,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdminButton } from '../../../../shared/admin-ui/admin-button/admin-button';
import { AdminIcon } from '../../../../shared/admin-ui/icons/admin-icon';

const SECTION_LABELS: { match: RegExp; label: string; crumb: string }[] = [
  { match: /^\/admin\/products\/new/, label: 'Nuevo producto', crumb: 'Productos / Nuevo' },
  { match: /^\/admin\/products\/\d+\/edit/, label: 'Editar producto', crumb: 'Productos / Editar' },
  { match: /^\/admin\/products(\/|$)/, label: 'Productos', crumb: 'Productos' },
  { match: /^\/admin\/categories(\/|$)/, label: 'Categorías', crumb: 'Categorías' },
  { match: /^\/admin\/catalogs(\/|$)/, label: 'Catálogos', crumb: 'Catálogos' },
  { match: /^\/admin\/settings(\/|$)/, label: 'Configuración', crumb: 'Configuración' },
];

const COMMANDS = [
  { label: 'Productos', path: '/admin/products', hint: 'Listado' },
  { label: 'Nuevo producto', path: '/admin/products/new', hint: 'Crear' },
  { label: 'Categorías', path: '/admin/categories', hint: 'Listado' },
  { label: 'Catálogos', path: '/admin/catalogs', hint: 'Listado' },
  { label: 'Configuración', path: '/admin/settings', hint: 'Settings' },
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

  readonly email = this.auth.email;
  readonly initials = computed(() => {
    const value = this.email();
    if (!value) {
      return 'CC';
    }
    const local = value.split('@')[0] ?? value;
    const parts = local.split(/[._-]/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return local.slice(0, 2).toUpperCase();
  });

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly section = computed(() => {
    const path = this.url().split('?')[0] ?? '';
    return (
      SECTION_LABELS.find((entry) => entry.match.test(path)) ?? {
        label: 'Panel',
        crumb: 'Panel',
      }
    );
  });

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
