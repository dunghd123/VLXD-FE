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
          catchError((refreshError: any) => {
            // Refresh token cũng fail → logout và redirect về login
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      if (error.status === 403) {
        // Kiểm tra xem có phải do token hết hạn không
        if (authService.getAccessToken() && authService.isTokenExpired()) {
          // Token hết hạn, thử refresh
          if (authService.getRefreshToken() && !authService.isRefreshTokenExpired()) {
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
              catchError((refreshError: any) => {
                // Refresh token cũng fail → logout và redirect về login
                authService.logout();
                return throwError(() => refreshError);
              })
            );
          } else {
            // Refresh token hết hạn hoặc không có → logout
            authService.logout();
            return throwError(() => error);
          }
        }
        // 403 thật sự - không có quyền → chỉ trả lỗi
        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};
