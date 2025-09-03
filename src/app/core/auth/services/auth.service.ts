import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LoginCredentials, TokenResponse, User, Role } from '../models/auth.models';
import { UserResponse } from '../../../features/manager/users/user.model';
import { catchError, tap } from 'rxjs/operators';
import { Observable as RxObservable } from 'rxjs';
import { CreateUserRequest } from '../../../features/manager/users/add-user/add-user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/v1/user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private _isRefreshing = false;

  get isRefreshing(): boolean {
    return this._isRefreshing;
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginCredentials): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, credentials);
  }

  getAllEmployees(): Observable<UserResponse[]> {
    if (!this.isLoggedIn()) {
      throw new Error('User not logged in');
    }
    if (!this.isManager()) {
      throw new Error('Access denied: Manager role required');
    }

    return this.retryWithTokenRefresh(() => 
      this.http.get<UserResponse[]>(`${this.apiUrl}/getAllEmployee`)
    );
  }

  createEmployeeUser(payload: CreateUserRequest): RxObservable<any> {
    if (!this.isLoggedIn() || !this.isManager()) {
      throw new Error('Access denied');
    }
    return this.retryWithTokenRefresh(() =>
      this.http.post(`${this.apiUrl}/createEmployee`, payload)
    );
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  saveUserInfo(userInfo: { username: string; role: Role | string }): void {
    // Xử lý role có thể là string từ backend hoặc enum từ frontend
    let role: Role;
    if (typeof userInfo.role === 'string') {
      // Chuyển đổi string role thành enum Role
      role = this.convertStringToRole(userInfo.role);
    } else {
      role = userInfo.role;
    }

    const user: User = {
      username: userInfo.username,
      email: '', 
      role: role,
      fullName: userInfo.username,
      isActive: true
    };
    localStorage.setItem('user_info', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Helper method để chuyển đổi string role thành enum Role
  private convertStringToRole(roleString: string): Role {
    const upperRole = roleString.toUpperCase();
    switch (upperRole) {
      case 'MANAGER':
        return Role.MANAGER;
      case 'EMPLOYEE':
        return Role.EMPLOYEE;
      default:
        console.warn(`Unknown role: ${roleString}, defaulting to EMPLOYEE`);
        return Role.EMPLOYEE;
    }
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem('access_token');
    return token;
  }

  getRefreshToken(): string | null {
    const token = localStorage.getItem('refresh_token');
    return token;
  }

  getCurrentUser(): User | null {
    const user = this.currentUserSubject.value;
    return user;
  }

  getCurrentRole(): Role | null {
    const user = this.getCurrentUser();
    const role = user ? user.role : null;
    
    return role;
  }

  hasRole(role: Role): boolean {
    const currentRole = this.getCurrentRole();
    const hasRole = currentRole === role;
    
    // Try string comparison as fallback
    if (!hasRole && currentRole && role) {
      const stringComparison = String(currentRole).toUpperCase() === String(role).toUpperCase();
      return stringComparison;
    }
    
    return hasRole;
  }

  isManager(): boolean {
    const hasRole = this.hasRole(Role.MANAGER);
    return hasRole;
  }

  isEmployee(): boolean {
    return this.hasRole(Role.EMPLOYEE);
  }

  // Kiểm tra xem token có hết hạn hay không
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  refreshToken(): Observable<any> {
    if (this.isRefreshing) {
      // Nếu đang refresh, đợi
      return throwError(() => new Error('Token refresh in progress'));
    }

    this._isRefreshing = true;
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this._isRefreshing = false;
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap((response: any) => {
        if (response.accessToken) {
          // Backend trả về role thay vì refreshToken mới
          // Giữ nguyên refreshToken cũ vì backend không tạo mới
          this.saveTokens(response.accessToken, refreshToken);
          
          // Cập nhật role nếu có thay đổi
          if (response.role) {
            const currentUser = this.getCurrentUser();
            if (currentUser) {
              currentUser.role = this.convertStringToRole(response.role);
              this.saveUserInfo({ username: currentUser.username, role: currentUser.role });
            }
          }
          
          console.log('Token refreshed successfully');
        }
      }),
      catchError((error) => {
        console.error('Token refresh failed:', error);
        this.logout();
        return throwError(() => error);
      }),
      tap(() => {
        this._isRefreshing = false;
      })
    );
  }

  retryWithTokenRefresh<T>(request: () => Observable<T>): Observable<T> {
    // JWT Interceptor đã xử lý refresh token tự động
    // Chỉ cần thực hiện request bình thường
    return request();
  }

  logout(username?: string): void {
    // Clear all stored data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    
    // Clear current user from BehaviorSubject
    this.currentUserSubject.next(null);
    
    // Reset refresh flag
    this._isRefreshing = false;
    
    // Navigate to login page
    this.router.navigate(['/login']);
    
    // Optionally call logout API if username is provided
    if (username) {
      this.http.put(`${this.apiUrl}/logout?username=${username}`, {}).subscribe({
        next: () => console.log('Logout API call successful'),
        error: (error) => console.error('Logout API call failed:', error)
      });
    }
  }

  isLoggedIn(): boolean {
    const hasToken = !!this.getAccessToken();
    const hasUser = !!this.getCurrentUser();
    const tokenNotExpired = !this.isTokenExpired();
    const isLoggedIn = hasToken && hasUser && tokenNotExpired;
    
    return isLoggedIn;
  }

  private loadUserFromStorage(): void {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user info from storage:', error);
        this.logout();
      }
    } else {
      console.log('No user info found in storage');
    }
  }

}
