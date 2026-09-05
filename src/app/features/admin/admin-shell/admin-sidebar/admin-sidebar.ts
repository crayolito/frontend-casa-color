import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { adminPath } from '../../../../core/routing/admin-path';
import { HomeApi } from '../../../../features/home/data/home.api';
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
export class AdminSidebar implements OnInit {
  private readonly homeApi = inject(HomeApi);

  readonly open = input(false);
  readonly collapsed = input(false);
  readonly navigated = output<void>();

  readonly logoUrl = signal<string | null>(null);
  readonly logoAlt = signal('Casa Color');

  protected readonly adminPath = adminPath;

  ngOnInit(): void {
    this.homeApi.loadHome().subscribe({
      next: (data) => {
        const header = data.header;
        const url = header.imageUrl || header.logo?.imageUrl;
        if (url) {
          this.logoUrl.set(url);
          this.logoAlt.set(header.altText || header.logo?.altText || 'Casa Color');
        }
      },
    });
  }

  readonly groups: AdminNavGroup[] = [
    {
      label: 'Catálogo',
      items: [
        { label: 'Productos', path: adminPath('products'), icon: 'products' },
        { label: 'Categorías', path: adminPath('categories'), icon: 'categories' },
        { label: 'Catálogos', path: adminPath('catalogs'), icon: 'catalogs' },
        {
          label: 'Importar / Exportar',
          path: adminPath('bulk-data'),
          icon: 'upload',
        },
      ],
    },
    {
      label: 'Páginas',
      items: [
        { label: 'Inicio', path: adminPath('home'), icon: 'home' },
        { label: 'Empresa', path: adminPath('empresa'), icon: 'info' },
        { label: 'Contacto', path: adminPath('contacto'), icon: 'settings' },
        { label: 'Catálogos', path: adminPath('catalogos-page'), icon: 'image' },
        { label: 'Cartas de color', path: adminPath('color-cards'), icon: 'image' },
        { label: 'Fichas técnicas', path: adminPath('fichas-tecnicas'), icon: 'list' },
        {
          label: 'Legales',
          path: adminPath('paginas-legales'),
          icon: 'list',
        },
      ],
    },
  ];

  onNavigate(): void {
    this.navigated.emit();
  }
}
