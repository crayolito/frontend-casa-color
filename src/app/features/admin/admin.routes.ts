import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '../../core/auth/auth.guard';
import { AdminShell } from './admin-shell/admin-shell';
import { AdminLogin } from './login/login';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    component: AdminLogin,
  },
  {
    path: '',
    canActivate: [authGuard],
    component: AdminShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      {
        path: 'categories',
        loadComponent: () =>
          import('./categories/categories').then((m) => m.AdminCategories),
      },
      {
        path: 'catalogs',
        loadComponent: () =>
          import('./catalogs/catalogs').then((m) => m.AdminCatalogs),
      },
      {
        path: 'bulk-data',
        loadComponent: () =>
          import('./bulk-data/bulk-data').then((m) => m.AdminBulkData),
      },
      {
        path: 'catalogos-page',
        loadComponent: () =>
          import('./catalogos-page/catalogos-page').then(
            (m) => m.AdminCatalogosPage,
          ),
      },
      {
        path: 'color-cards',
        loadComponent: () =>
          import('./color-cards/color-cards').then((m) => m.AdminColorCards),
      },
      {
        path: 'fichas-tecnicas',
        loadComponent: () =>
          import('./fichas-tecnicas/fichas-tecnicas').then(
            (m) => m.AdminFichasTecnicas,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./products/list/products-list').then((m) => m.AdminProductsList),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./products/form/product-form').then((m) => m.AdminProductForm),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./products/form/product-form').then((m) => m.AdminProductForm),
      },
      {
        path: 'branches',
        pathMatch: 'full',
        redirectTo: 'contacto',
      },
      {
        path: 'contacto',
        loadComponent: () =>
          import('./contacto-settings/contacto-settings').then(
            (m) => m.AdminContactoSettings,
          ),
      },
      {
        path: 'empresa',
        loadComponent: () =>
          import('./empresa/empresa').then((m) => m.AdminEmpresa),
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./home/admin-home').then((m) => m.AdminHome),
      },
      {
        path: 'paginas-legales',
        loadComponent: () =>
          import('./paginas-legales/paginas-legales').then(
            (m) => m.AdminPaginasLegales,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/settings').then((m) => m.AdminSettings),
      },
    ],
  },
];
