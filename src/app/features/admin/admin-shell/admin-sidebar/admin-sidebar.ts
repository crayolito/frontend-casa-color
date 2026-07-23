import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdminIcon, AdminIconName } from '../../../../shared/admin-ui/icons/admin-icon';

interface AdminNavItem {
  label: string;
  path: string;
  icon: AdminIconName;
}

interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

@Component({
  selector: 'app-admin-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, AdminIcon],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {
  private readonly auth = inject(AuthService);

  readonly open = input(false);
  readonly collapsed = input(false);
  readonly navigated = output<void>();

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

  readonly groups: AdminNavGroup[] = [
    {
      label: 'Catálogo',
      items: [
        { label: 'Productos', path: '/admin/products', icon: 'products' },
        { label: 'Categorías', path: '/admin/categories', icon: 'categories' },
        { label: 'Catálogos', path: '/admin/catalogs', icon: 'catalogs' },
      ],
    },
    {
      label: 'Configuración',
      items: [
        { label: 'Settings', path: '/admin/settings', icon: 'settings' },
      ],
    },
  ];

  onNavigate(): void {
    this.navigated.emit();
  }
}
