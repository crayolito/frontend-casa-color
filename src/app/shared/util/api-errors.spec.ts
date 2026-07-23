import { toAppError } from './api-errors';

describe('toAppError', () => {
  it('parses RFC 9457 Problem Details', () => {
    const result = toAppError(404, {
      type: 'about:blank',
      title: 'No encontrado',
      status: 404,
      detail: 'Producto no encontrado',
      instance: '/admin/products/1',
      code: 'PRODUCT_NOT_FOUND',
      correlationId: 'corr-abc',
    });

    expect(result).toEqual({
      code: 'PRODUCT_NOT_FOUND',
      message: 'Producto no encontrado',
      status: 404,
      correlationId: 'corr-abc',
      errors: undefined,
    });
  });

  it('parses validation errors[]', () => {
    const result = toAppError(422, {
      type: 'about:blank',
      title: 'Validación fallida',
      status: 422,
      detail: 'Uno o más campos no son válidos',
      instance: '/auth/login',
      code: 'VALIDATION_ERROR',
      correlationId: 'corr-val',
      errors: [{ field: 'email', code: 'ISEMAIL', message: 'email must be an email' }],
    });

    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0].field).toBe('email');
  });

  it('still supports legacy nested shape', () => {
    const result = toAppError(409, {
      error: { code: 'SLUG_TAKEN', message: 'Slug taken' },
    });

    expect(result.code).toBe('SLUG_TAKEN');
    expect(result.message).toBe('Slug taken');
  });
});
