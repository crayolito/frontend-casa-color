import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
  readonly open = input(false);
  readonly collapsed = input(false);
  readonly navigated = output<void>();

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
        { label: 'Inicio', path: '/admin/home', icon: 'home' },
        { label: 'Datos del sitio', path: '/admin/settings', icon: 'settings' },
      ],
    },
  ];

  onNavigate(): void {
    this.navigated.emit();
  }
}
