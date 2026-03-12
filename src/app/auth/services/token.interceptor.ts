import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

let refreshTokenInProgress = false;
let refreshTokenSubject: Subject<any> = new Subject<any>();

export const tokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const excludedEndpoints: string[] = ['login'];
  const excludedEndpointsAfterRefresh: string[] = ['refresh-token', 'logout'];
  const tokenData = JSON.parse(localStorage.getItem('tokenData') || '{}');
  const hasCustomTokenFlag = request.headers.has('X-Use-Custom-Token');

  if (hasCustomTokenFlag) {
    const cleanedHeaders = request.headers.delete('X-Use-Custom-Token');
    request = request.clone({ headers: cleanedHeaders });
  }

  if (excludedEndpoints.some((endpoint) => request.url.includes(endpoint))) {
    return next(request);
  }

  const alreadyHasAuthorization = request.headers.has('Authorization');
  if (!hasCustomTokenFlag && !alreadyHasAuthorization && tokenData && tokenData.accessToken) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${tokenData.accessToken}`,
      },
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const is401 = error.status === 401;
      const isNotExcludedAfterRefresh = !excludedEndpointsAfterRefresh.some((endpoint) =>
        request.url.includes(endpoint),
      );
      const hasRefreshToken = tokenData && tokenData.refreshToken;

      if (is401 && isNotExcludedAfterRefresh && hasRefreshToken) {
        if (refreshTokenInProgress) {
          return refreshTokenSubject.pipe(
            switchMap((token) => {
              return next(
                request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${token}`,
                  },
                }),
              );
            }),
          );
        } else {
          refreshTokenInProgress = true;
          refreshTokenSubject = new Subject<any>();

          return authService.refreshToken(tokenData.refreshToken, tokenData.accessToken).pipe(
            switchMap((response: any) => {
              refreshTokenInProgress = false;
              refreshTokenSubject.next(response.accessToken);
              refreshTokenSubject.complete();

              localStorage.setItem('tokenData', JSON.stringify(response));

              return next(
                request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${response.accessToken}`,
                  },
                }),
              );
            }),
            catchError((refreshError) => {
              refreshTokenInProgress = false;
              refreshTokenSubject.error(refreshError);
              console.error('Error refreshing token:', refreshError);
              localStorage.clear();
              router.navigate(['auth']);
              return throwError(() => refreshError);
            }),
          );
        }
      }

      return throwError(() => error);
    }),
  );
};
