import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../services/auth-store.service';

export const guestGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  await authStore.hydrate();

  if (!authStore.isAuthenticated()) {
    return true;
  }

  return authStore.requiresProfileCompletion()
    ? router.createUrlTree(['/complete-profile'])
    : router.createUrlTree(['/conversations']);
};
