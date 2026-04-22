import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { TokenService } from '../services/token';

export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const role = tokenService.getUserRole();

  if (tokenService.isLoggedIn() && role === 'ADMIN') {
    return true;
  }

  return router.createUrlTree(['/']);
};