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
        path: 'settings',
        loadComponent: () =>
          import('./settings/settings').then((m) => m.AdminSettings),
      },
    ],
  },
];
