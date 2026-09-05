import { Routes } from '@angular/router';
import { PublicLayout } from './core/ui/public-layout/public-layout';
import { NotFound } from './core/ui/not-found/not-found';
import { ADMIN_BASE_SEGMENT } from './core/routing/admin-path';

export const routes: Routes = [
  // Panel ANTES del layout público: el `**` del PublicLayout no puede
  // capturar /ccadm/* (eso rompía el login mostrando 404).
  {
    path: ADMIN_BASE_SEGMENT,
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
        data: { title: 'Inicio' },
      },
      {
        path: 'cartas-de-color',
        loadChildren: () =>
          import('./features/cartas-de-color/cartas-de-color.routes').then(
            (m) => m.CARTAS_DE_COLOR_ROUTES,
          ),
        data: { title: 'Cartas de color' },
      },
      {
        path: 'catalogos',
        loadChildren: () =>
          import('./features/catalogos/catalogos.routes').then(
            (m) => m.CATALOGOS_ROUTES,
          ),
        data: { title: 'Catálogos' },
      },
      {
        path: 'fichas-tecnicas',
        loadChildren: () =>
          import('./features/fichas-tecnicas/fichas-tecnicas.routes').then(
            (m) => m.FICHAS_TECNICAS_ROUTES,
          ),
        data: { title: 'Fichas técnicas' },
      },
      {
        path: 'producto/:slug',
        loadChildren: () =>
          import('./features/producto/producto.routes').then(
            (m) => m.PRODUCTO_ROUTES,
          ),
      },
      {
        path: 'contacto',
        loadChildren: () =>
          import('./features/contacto/contacto.routes').then(
            (m) => m.CONTACTO_ROUTES,
          ),
        data: { title: 'Contacto' },
      },
      {
        path: 'empresa',
        loadChildren: () =>
          import('./features/empresa/empresa.routes').then(
            (m) => m.EMPRESA_ROUTES,
          ),
        data: { title: 'Empresa' },
      },
      {
        path: 'search',
        loadChildren: () =>
          import('./features/busqueda/busqueda.routes').then(
            (m) => m.BUSQUEDA_ROUTES,
          ),
        data: { title: 'Búsqueda' },
      },
      {
        path: 'categoria/:slug/productos',
        loadChildren: () =>
          import(
            './features/categoria-productos/categoria-productos.routes'
          ).then((m) => m.CATEGORIA_PRODUCTOS_ROUTES),
      },
      {
        path: 'categoria/:slug',
        loadChildren: () =>
          import('./features/categoria/categoria.routes').then(
            (m) => m.CATEGORIA_ROUTES,
          ),
      },
      {
        path: 'catalogo/:slug/productos',
        loadChildren: () =>
          import(
            './features/categoria-productos/categoria-productos.routes'
          ).then((m) => m.CATALOGO_PRODUCTOS_ROUTES),
      },
      {
        path: 'catalogo/:slug',
        loadChildren: () =>
          import('./features/catalogo-detalle/catalogo-detalle.routes').then(
            (m) => m.CATALOGO_DETALLE_ROUTES,
          ),
      },
      {
        path: 'aviso-legal',
        loadChildren: () =>
          import('./features/paginas-legales/paginas-legales.routes').then(
            (m) => m.AVISO_LEGAL_ROUTES,
          ),
      },
      {
        path: 'politica-de-datos',
        loadChildren: () =>
          import('./features/paginas-legales/paginas-legales.routes').then(
            (m) => m.POLITICA_DATOS_ROUTES,
          ),
      },
      {
        path: '**',
        component: NotFound,
        data: { title: 'Página no encontrada' },
      },
    ],
  },
];
