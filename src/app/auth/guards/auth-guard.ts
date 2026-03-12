import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const localStorageService = inject(LocalStorageService);
  const tokenData = localStorageService.get('tokenData');

  if (tokenData && tokenData.accessToken) {
    return true;
  }

  return router.createUrlTree(['auth/login']);
};
