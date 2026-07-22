export type AppErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export interface AppError {
  code: AppErrorCode | string;
  message: string;
  status: number;
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
    code: status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : 'UNKNOWN',
    message: 'Something went wrong',
    status,
  };

  if (typeof body !== 'object' || body === null) {
    return fallback;
  }

  const record = body as Record<string, unknown>;
  const nested = record['error'];

  if (typeof nested === 'object' && nested !== null) {
    const err = nested as Record<string, unknown>;
    return {
      code: typeof err['code'] === 'string' ? err['code'] : fallback.code,
      message: typeof err['message'] === 'string' ? err['message'] : fallback.message,
      status,
    };
  }

  // Nest UnauthorizedException shape sometimes uses { error, message }
  if (typeof record['message'] === 'string') {
    return {
      code: typeof record['error'] === 'string' ? record['error'] : fallback.code,
      message: record['message'],
      status,
    };
  }

  return fallback;
}
