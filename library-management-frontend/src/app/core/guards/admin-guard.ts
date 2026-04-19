import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token';

export const adminGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const role = tokenService.getUserRole();

  if (tokenService.isLoggedIn() && role === 'ADMIN') {
    return true;
  }

  router.navigate(['/']);
  return false;
};