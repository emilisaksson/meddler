import type { Request, Response } from 'express';

export function apiNotFoundHandler(_request: Request, response: Response): void {
  response.locals.routeName = 'api.notFound';
  response.status(404).json({
    error: 'API route not found.',
    code: 'route_not_found'
  });
}
