import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminIcon, AdminIconName } from '../../../../shared/admin-ui/icons/admin-icon';

interface AdminNavItem {
  label: string;
  path: string;
  icon: AdminIconName;
}

@Component({
  selector: 'app-admin-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, AdminIcon],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {
  readonly items: AdminNavItem[] = [
    { label: 'Productos', path: '/admin/products', icon: 'products' },
    { label: 'Categorías', path: '/admin/categories', icon: 'categories' },
    { label: 'Catálogos', path: '/admin/catalogs', icon: 'catalogs' },
    { label: 'Settings', path: '/admin/settings', icon: 'settings' },
  ];
}
