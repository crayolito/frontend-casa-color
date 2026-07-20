import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'linea-deco',
    loadChildren: () =>
      import('./features/linea-deco/linea-deco.routes').then(
        (m) => m.LINEA_DECO_ROUTES,
      ),
  },
  {
    path: 'linea-tecno/imprimaciones',
    loadChildren: () =>
      import('./features/imprimaciones/imprimaciones.routes').then(
        (m) => m.IMPRIMACIONES_ROUTES,
      ),
  },
  {
    path: 'cartas-de-color',
    loadChildren: () =>
      import('./features/cartas-de-color/cartas-de-color.routes').then(
        (m) => m.CARTAS_DE_COLOR_ROUTES,
      ),
  },
  {
    path: 'producto/acrilico-color',
    loadChildren: () =>
      import('./features/producto/producto.routes').then(
        (m) => m.PRODUCTO_ROUTES,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
