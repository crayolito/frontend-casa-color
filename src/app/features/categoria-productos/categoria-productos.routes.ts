import { Routes } from '@angular/router';
import { CategoriaProductos } from './feature/categoria-productos';

export const CATEGORIA_PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    component: CategoriaProductos,
    data: { archiveMode: 'category' },
  },
];

export const CATALOGO_PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    component: CategoriaProductos,
    data: { archiveMode: 'catalog' },
  },
];
