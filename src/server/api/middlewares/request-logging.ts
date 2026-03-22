import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { buildRequestLogContext, logError, logInfo, logWarn } from '../../utils/logger';

export function requestLogging(request: Request, response: Response, next: NextFunction): void {
  const requestIdHeader = request.header('x-request-id');
  const requestId = requestIdHeader?.trim() || randomUUID();
  const startedAt = process.hrtime.bigint();

  response.locals.requestId = requestId;
  response.setHeader('x-request-id', requestId);

  response.on('finish', () => {
    if (!request.originalUrl.startsWith('/api')) {
      return;
    }

    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const context = {
      ...buildRequestLogContext(request, response),
      statusCode: response.statusCode,
      durationMs: Number(durationMs.toFixed(2))
    };

    if (response.statusCode >= 500) {
      logError('API request failed.', context);
      return;
    }

    if (response.statusCode >= 400) {
      logWarn('API request completed with client error.', context);
      return;
    }

    logInfo('API request completed.', context);
  });

  next();
}
