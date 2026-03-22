import type { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<unknown>;

export function asyncHandler(handler: AsyncRouteHandler): ReturnType<typeof createAsyncHandler>;
export function asyncHandler(
  routeName: string,
  handler: AsyncRouteHandler
): ReturnType<typeof createAsyncHandler>;
export function asyncHandler(
  routeNameOrHandler: string | AsyncRouteHandler,
  maybeHandler?: AsyncRouteHandler
) {
  const routeName = typeof routeNameOrHandler === 'string' ? routeNameOrHandler : null;
  const handler = typeof routeNameOrHandler === 'function' ? routeNameOrHandler : maybeHandler;

  if (!handler) {
    throw new Error('asyncHandler requires a route handler.');
  }

  return createAsyncHandler(routeName, handler);
}

function createAsyncHandler(routeName: string | null, handler: AsyncRouteHandler) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (routeName) {
      response.locals.routeName = routeName;
    }

    void handler(request, response, next).catch(next);
  };
}
