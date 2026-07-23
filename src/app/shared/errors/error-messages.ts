import type { AppErrorCode } from '../util/api-errors';

export const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  UNAUTHORIZED: 'Tu sesión expiró. Volvé a iniciar sesión.',
  FORBIDDEN: 'No tenés permiso para hacer esto',
  NOT_FOUND: 'No encontramos lo que buscás',
  PRODUCT_NOT_FOUND: 'Producto no encontrado',
  CATALOG_REQUIRED: 'Seleccioná al menos un catálogo',
  CATALOG_NOT_FOUND: 'Catálogo no encontrado',
  CATEGORY_NOT_FOUND: 'Categoría no encontrada',
  SLUG_TAKEN: 'Ese slug ya está en uso. Probá con otro.',
  SITE_SETTING_NOT_FOUND: 'Configuración no encontrada',
  VALIDATION_ERROR: 'Revisá los campos marcados e intentá de nuevo',
  INTERNAL_ERROR: 'Algo salió mal. Intentá de nuevo en unos minutos.',
  NETWORK_ERROR: 'Sin conexión. Revisá tu red e intentá de nuevo.',
  UNKNOWN: 'Algo salió mal. Intentá de nuevo.',
};

export function messageForCode(code: AppErrorCode | string): string | undefined {
  return ERROR_MESSAGES[code];
}

export function fallbackMessageForStatus(status: number): string {
  if (status === 0) {
    return ERROR_MESSAGES['NETWORK_ERROR'];
  }
  if (status === 401) {
    return ERROR_MESSAGES['UNAUTHORIZED'];
  }
  if (status === 403) {
    return ERROR_MESSAGES['FORBIDDEN'];
  }
  if (status === 404) {
    return ERROR_MESSAGES['NOT_FOUND'];
  }
  if (status === 422) {
    return ERROR_MESSAGES['VALIDATION_ERROR'];
  }
  if (status === 429) {
    return 'Demasiados intentos. Esperá un momento e intentá de nuevo.';
  }
  if (status >= 500) {
    return ERROR_MESSAGES['INTERNAL_ERROR'];
  }
  return ERROR_MESSAGES['UNKNOWN'];
}
