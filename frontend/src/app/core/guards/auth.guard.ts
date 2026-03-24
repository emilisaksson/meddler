import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../services/auth-store.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  await authStore.hydrate();

  if (!authStore.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  if (authStore.requiresProfileCompletion() && !state.url.startsWith('/complete-profile')) {
    return router.createUrlTree(['/complete-profile'], {
      queryParams: {
        redirect: state.url
      }
    });
  }

  return true;
};
