import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/app-error';
import { verifyAccessToken, type AccessTokenPayload } from '../../services/tokens/jwt-service';

export interface AuthenticatedRequest extends Request {
  auth?: AccessTokenPayload;
}

export function authenticateRequest(request: Request, _response: Response, next: NextFunction): void {
  const authorizationHeader = request.header('authorization');

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    next(new AppError('Authentication is required.', 401, { code: 'authentication_required' }));
    return;
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();

  if (!token) {
    next(new AppError('Authentication is required.', 401, { code: 'authentication_required' }));
    return;
  }

  try {
    (request as AuthenticatedRequest).auth = verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuth(request: Request): AccessTokenPayload {
  const auth = (request as AuthenticatedRequest).auth;

  if (!auth) {
    throw new AppError('Authentication is required.', 401, { code: 'authentication_required' });
  }

  return auth;
}
