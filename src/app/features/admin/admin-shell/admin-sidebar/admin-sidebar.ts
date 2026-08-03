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
        {
          label: 'Importar / Exportar',
          path: '/admin/bulk-data',
          icon: 'upload',
        },
      ],
    },
    {
      label: 'Páginas',
      items: [
        { label: 'Inicio', path: '/admin/home', icon: 'home' },
        { label: 'Empresa', path: '/admin/empresa', icon: 'info' },
        { label: 'Contacto', path: '/admin/contacto', icon: 'settings' },
        { label: 'Catálogos', path: '/admin/catalogos-page', icon: 'image' },
        { label: 'Cartas de color', path: '/admin/color-cards', icon: 'image' },
        { label: 'Fichas técnicas', path: '/admin/fichas-tecnicas', icon: 'list' },
        {
          label: 'Legales',
          path: '/admin/paginas-legales',
          icon: 'list',
        },
      ],
    },
  ];

  onNavigate(): void {
    this.navigated.emit();
  }
}
