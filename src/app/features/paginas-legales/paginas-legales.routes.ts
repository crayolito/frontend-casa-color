import { Routes } from '@angular/router';
import { PaginaLegal } from './feature/pagina-legal';

export const AVISO_LEGAL_ROUTES: Routes = [
  {
    path: '',
    component: PaginaLegal,
    data: { legalKey: 'aviso-legal', title: 'Aviso Legal' },
  },
];

export const POLITICA_DATOS_ROUTES: Routes = [
  {
    path: '',
    component: PaginaLegal,
    data: { legalKey: 'politica-datos', title: 'Política de Datos' },
  },
];
