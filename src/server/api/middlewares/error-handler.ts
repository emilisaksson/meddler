import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../utils/app-error';

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: 'The request payload is invalid.',
      code: 'invalid_request',
      details: error.flatten()
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: error.expose ? error.message : 'Something went wrong.',
      code: error.code,
      details: error.expose ? error.details : undefined
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    error: 'An unexpected server error occurred.',
    code: 'internal_server_error'
  });
}
