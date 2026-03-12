import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const localStorageService = inject(LocalStorageService);
  const tokenData = localStorageService.get('tokenData');

  if (tokenData && tokenData.accessToken) {
    return router.createUrlTree(['/']);
  }

  return true;
};
