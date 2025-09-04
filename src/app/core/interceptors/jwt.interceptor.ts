import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Bỏ qua refresh token request
  if (req.url.includes('/refresh-token')) {
    return next(req);
  }

  // Thêm access token vào header
  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // ✅ Chỉ refresh khi 401 (Unauthorized)
      if (error.status === 401 && authService.getRefreshToken()) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const newToken = authService.getAccessToken();
            if (newToken) {
              const newReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next(newReq);
            } else {
              throw new Error('Failed to get new token after refresh');
            }
          }),
          catchError((refreshError) => {
            // Refresh token cũng fail → logout
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      // ❌ 403 = Không có quyền thật sự → không logout, chỉ trả lỗi
      if (error.status === 403) {
        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};
