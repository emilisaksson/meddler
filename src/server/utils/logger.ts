import type { Request, Response } from 'express';
import { AppError } from './app-error';

type AuthContext = {
  sub?: string;
  email?: string;
};

function getBodyKeys(body: unknown): string[] | undefined {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return undefined;
  }

  return Object.keys(body as Record<string, unknown>);
}

function getAuthContext(request: Request): AuthContext | undefined {
  return (request as Request & { auth?: AuthContext }).auth;
}

export function buildRequestLogContext(
  request: Request,
  response?: Response
): Record<string, unknown> {
  const auth = getAuthContext(request);

  return {
    requestId: response?.locals.requestId ?? request.header('x-request-id') ?? null,
    routeName: response?.locals.routeName ?? null,
    method: request.method,
    path: request.originalUrl,
    params: request.params,
    query: request.query,
    bodyKeys: getBodyKeys(request.body),
    authenticatedUserId: auth?.sub ?? null,
    authenticatedEmail: auth?.email ?? null,
    ip: request.ip,
    userAgent: request.get('user-agent') ?? null
  };
}

export function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof AppError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return {
    value: error
  };
}

function log(
  level: 'info' | 'warn' | 'error',
  message: string,
  context?: Record<string, unknown>
): void {
  const logger = level === 'info' ? console.info : level === 'warn' ? console.warn : console.error;

  logger(message, {
    timestamp: new Date().toISOString(),
    ...(context ?? {})
  });
}

export function logInfo(message: string, context?: Record<string, unknown>): void {
  log('info', message, context);
}

export function logWarn(message: string, context?: Record<string, unknown>): void {
  log('warn', message, context);
}

export function logError(message: string, context?: Record<string, unknown>): void {
  log('error', message, context);
}
