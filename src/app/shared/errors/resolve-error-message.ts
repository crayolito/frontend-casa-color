import { isAppError, type AppError } from '../util/api-errors';
import {
  fallbackMessageForStatus,
  messageForCode,
} from './error-messages';

export interface ResolvedErrorMessage {
  text: string;
  correlationId?: string;
  showCorrelationId: boolean;
  code: string;
  status: number;
}

export function resolveErrorMessage(err: unknown): ResolvedErrorMessage {
  if (isAppError(err)) {
    return resolveFromAppError(err);
  }

  return {
    text: fallbackMessageForStatus(0),
    showCorrelationId: false,
    code: 'UNKNOWN',
    status: 0,
  };
}

export function localErrorMessage(text: string): ResolvedErrorMessage {
  return {
    text,
    showCorrelationId: false,
    code: 'VALIDATION_ERROR',
    status: 422,
  };
}

function resolveFromAppError(err: AppError): ResolvedErrorMessage {
  const fromCatalog = messageForCode(err.code);
  const text = fromCatalog ?? fallbackMessageForStatus(err.status);
  const showCorrelationId =
    err.status >= 500 ||
    err.code === 'INTERNAL_ERROR' ||
    err.code === 'NETWORK_ERROR';

  return {
    text,
    correlationId: showCorrelationId ? err.correlationId : undefined,
    showCorrelationId: showCorrelationId && Boolean(err.correlationId),
    code: err.code,
    status: err.status,
  };
}
