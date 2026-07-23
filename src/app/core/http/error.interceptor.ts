import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { toAppError } from '../../shared/util/api-errors';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => ({
          code: 'NETWORK_ERROR',
          message: 'Sin conexión',
          status: 0,
        }));
      }

      const appError = toAppError(err.status, err.error);

      if (
        err.status === 401 &&
        req.url.startsWith(environment.apiUrl) &&
        !req.url.includes('/auth/login')
      ) {
        auth.logout(false);
        void router.navigate(['/admin/login'], {
          queryParams: { returnUrl: router.url },
        });
      }

      return throwError(() => appError);
    }),
  );
};
