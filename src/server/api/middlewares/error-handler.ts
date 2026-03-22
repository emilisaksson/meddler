import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../utils/app-error';
import {
  buildRequestLogContext,
  logError,
  logWarn,
  serializeError
} from '../../utils/logger';

export function errorHandler(
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction
): void {
  if (error instanceof ZodError) {
    logWarn('Request validation failed.', {
      ...buildRequestLogContext(request, response),
      statusCode: 400,
      error: {
        name: error.name,
        message: error.message,
        details: error.flatten()
      }
    });

    response.status(400).json({
      error: 'The request payload is invalid.',
      code: 'invalid_request',
      details: error.flatten()
    });
    return;
  }

  if (error instanceof AppError) {
    const context = {
      ...buildRequestLogContext(request, response),
      statusCode: error.statusCode,
      error: serializeError(error)
    };

    if (error.statusCode >= 500) {
      logError('Application error while handling request.', context);
    } else {
      logWarn('Application error while handling request.', context);
    }

    response.status(error.statusCode).json({
      error: error.expose ? error.message : 'Something went wrong.',
      code: error.code,
      details: error.expose ? error.details : undefined
    });
    return;
  }

  logError('Unhandled error while handling request.', {
    ...buildRequestLogContext(request, response),
    statusCode: 500,
    error: serializeError(error)
  });

  response.status(500).json({
    error: 'An unexpected server error occurred.',
    code: 'internal_server_error'
  });
}
