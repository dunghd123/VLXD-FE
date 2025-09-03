import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Observable } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Bỏ qua refresh token request để tránh vòng lặp vô hạn
  if (req.url.includes('/refresh-token')) {
    return next(req);
  }

  // Thêm token vào header nếu có
  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

    return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Xử lý cả 403 và network error (status = 0)
      if ((error.status === 403 || error.status === 0) && authService.getRefreshToken()) {
        // Gọi refresh token
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Sau khi refresh thành công, thử lại request ban đầu với token mới
            const newToken = authService.getAccessToken();
            if (newToken) {
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              });
              return next(newReq);
            } else {
              throw new Error('Failed to get new token after refresh');
            }
          }),
          catchError((refreshError) => {
            // Nếu refresh thất bại, logout
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
       
      // Nếu không thể xử lý, trả về lỗi gốc
      return throwError(() => error);
    })
  );
};
