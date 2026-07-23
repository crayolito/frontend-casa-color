import {
  ERROR_MESSAGES,
  fallbackMessageForStatus,
  messageForCode,
} from './error-messages';
import {
  localErrorMessage,
  resolveErrorMessage,
} from './resolve-error-message';
import type { AppError } from '../util/api-errors';

describe('error catalog', () => {
  it('maps known codes to Spanish messages', () => {
    expect(messageForCode('INVALID_CREDENTIALS')).toBe('Credenciales inválidas');
    expect(messageForCode('SLUG_TAKEN')).toBe(
      'Ese slug ya está en uso. Probá con otro.',
    );
    expect(messageForCode('PRODUCT_NOT_FOUND')).toBe('Producto no encontrado');
    expect(ERROR_MESSAGES['INTERNAL_ERROR']).toContain('Algo salió mal');
  });

  it('falls back by HTTP status for unknown codes', () => {
    expect(fallbackMessageForStatus(500)).toBe(ERROR_MESSAGES['INTERNAL_ERROR']);
    expect(fallbackMessageForStatus(0)).toBe(ERROR_MESSAGES['NETWORK_ERROR']);
    expect(fallbackMessageForStatus(403)).toBe(ERROR_MESSAGES['FORBIDDEN']);
  });

  it('resolveErrorMessage uses catalog and hides correlationId on 4xx', () => {
    const err: AppError = {
      code: 'SLUG_TAKEN',
      message: 'raw from server',
      status: 409,
      correlationId: 'corr-hidden',
    };

    const resolved = resolveErrorMessage(err);

    expect(resolved.text).toBe(ERROR_MESSAGES['SLUG_TAKEN']);
    expect(resolved.showCorrelationId).toBe(false);
    expect(resolved.correlationId).toBeUndefined();
  });

  it('resolveErrorMessage shows correlationId on 5xx', () => {
    const err: AppError = {
      code: 'INTERNAL_ERROR',
      message: 'Ocurrió un error inesperado',
      status: 500,
      correlationId: 'corr-visible',
    };

    const resolved = resolveErrorMessage(err);

    expect(resolved.text).toBe(ERROR_MESSAGES['INTERNAL_ERROR']);
    expect(resolved.showCorrelationId).toBe(true);
    expect(resolved.correlationId).toBe('corr-visible');
  });

  it('resolveErrorMessage falls back for unknown code', () => {
    const err: AppError = {
      code: 'BRAND_NEW_CODE',
      message: 'whatever',
      status: 400,
    };

    const resolved = resolveErrorMessage(err);

    expect(resolved.text).toBe(ERROR_MESSAGES['UNKNOWN']);
  });

  it('localErrorMessage builds a presentable validation error', () => {
    expect(localErrorMessage('JSON inválido').text).toBe('JSON inválido');
  });
});
