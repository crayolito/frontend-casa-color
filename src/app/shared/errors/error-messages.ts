import type { AppErrorCode } from '../util/api-errors';

export const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  UNAUTHORIZED: 'Tu sesión expiró. Volvé a iniciar sesión.',
  FORBIDDEN: 'No tenés permiso para hacer esto',
  NOT_FOUND: 'No encontramos lo que buscás',
  PRODUCT_NOT_FOUND: 'Producto no encontrado',
  CATALOG_REQUIRED: 'Seleccioná al menos un catálogo',
  CATALOG_NOT_FOUND: 'Catálogo no encontrado',
  BRANCH_NOT_FOUND: 'Sucursal no encontrada',
  CATEGORY_NOT_FOUND: 'Categoría no encontrada',
  SLUG_TAKEN: 'Ese slug ya está en uso. Probá con otro.',
  SITE_SETTING_NOT_FOUND: 'Configuración no encontrada',
  FICHAS_TECNICAS_INVALID: 'Configurá entre 3 y 4 categorías para Fichas Técnicas',
  COLOR_CARD_NOT_FOUND: 'Carta de color no encontrada',
  COLOR_CARDS_LIMIT: 'Debés tener entre 2 y 4 cartas de color',
  VALIDATION_ERROR: 'Revisá los campos marcados e intentá de nuevo',
  INTERNAL_ERROR: 'Algo salió mal. Intentá de nuevo en unos minutos.',
  NETWORK_ERROR: 'Sin conexión. Revisá tu red e intentá de nuevo.',
  UNKNOWN: 'Algo salió mal. Intentá de nuevo.',
  BULK_FILE_INVALID: 'El archivo no es un Excel válido (.xlsx).',
  BULK_FILE_TOO_LARGE: 'El archivo supera el límite de 10 MB.',
  BULK_ROW_LIMIT_EXCEEDED: 'El archivo supera el límite de 5000 filas.',
  BULK_INVALID_COMMAND: 'Comando de importación inválido.',
  BULK_COMMAND_DISABLED: 'El comando DELETE no está habilitado.',
  BULK_SLUG_REQUIRED: 'La fila necesita un slug.',
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
