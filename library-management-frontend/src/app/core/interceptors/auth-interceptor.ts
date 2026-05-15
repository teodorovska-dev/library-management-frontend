import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const token = tokenService.getToken();

  const isAuthRequest =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/verify-reset-code') ||
    req.url.includes('/auth/reset-password');

  const isPublicGetRequest =
    req.method === 'GET' &&
    (
      req.url.includes('/api/books') ||
      req.url.includes('/books') ||
      req.url.includes('/uploads')
    );

  const shouldAttachToken =
    !!token &&
    !isAuthRequest &&
    !isPublicGetRequest;

  const authReq = shouldAttachToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if ((error.status === 401 || error.status === 403) && shouldAttachToken) {
        tokenService.clear();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};