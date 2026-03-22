import { HttpInterceptorFn } from '@angular/common/http';
import { getStoredAccessToken } from '../auth/auth-storage';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const accessToken = getStoredAccessToken();

  if (!accessToken) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  );
};
