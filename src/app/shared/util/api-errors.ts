export type AppErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'PRODUCT_NOT_FOUND'
  | 'CATALOG_REQUIRED'
  | 'CATALOG_NOT_FOUND'
  | 'CATEGORY_NOT_FOUND'
  | 'SLUG_TAKEN'
  | 'SITE_SETTING_NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export interface ValidationFieldError {
  field: string;
  code: string;
  message: string;
}

export interface AppError {
  code: AppErrorCode | string;
  message: string;
  status: number;
  correlationId?: string;
  errors?: ValidationFieldError[];
}

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'status' in value
  );
}

export function toAppError(status: number, body: unknown): AppError {
  const fallback: AppError = {
    code:
      status === 401
        ? 'UNAUTHORIZED'
        : status === 403
          ? 'FORBIDDEN'
          : status === 404
            ? 'NOT_FOUND'
            : status >= 500
              ? 'INTERNAL_ERROR'
              : 'UNKNOWN',
    message: 'Something went wrong',
    status,
  };

  if (typeof body !== 'object' || body === null) {
    return fallback;
  }

  const record = body as Record<string, unknown>;

  // RFC 9457 Problem Details
  if (typeof record['code'] === 'string' && typeof record['status'] === 'number') {
    return {
      code: record['code'],
      message:
        typeof record['detail'] === 'string'
          ? record['detail']
          : typeof record['title'] === 'string'
            ? record['title']
            : fallback.message,
      status,
      correlationId:
        typeof record['correlationId'] === 'string'
          ? record['correlationId']
          : undefined,
      errors: Array.isArray(record['errors'])
        ? (record['errors'] as ValidationFieldError[])
        : undefined,
    };
  }

  // Legacy nested shape { error: { code, message } }
  const nested = record['error'];
  if (typeof nested === 'object' && nested !== null) {
    const err = nested as Record<string, unknown>;
    return {
      code: typeof err['code'] === 'string' ? err['code'] : fallback.code,
      message:
        typeof err['message'] === 'string' ? err['message'] : fallback.message,
      status,
    };
  }

  // Nest UnauthorizedException flat shape { error, message }
  if (typeof record['message'] === 'string') {
    return {
      code:
        typeof record['error'] === 'string' ? record['error'] : fallback.code,
      message: record['message'],
      status,
    };
  }

  return fallback;
}
