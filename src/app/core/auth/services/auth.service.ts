import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { LoginCredentials, TokenResponse, User, Role } from '../models/auth.models';
import { EmployeeResponse, UserResponse } from '../../../features/manager/users/user.model';
import { Observable as RxObservable } from 'rxjs';
import { CreateUserRequest } from '../../../features/manager/users/add-user/add-user.model';
import { UpdateUserRequest } from '../../../features/manager/users/update-user/update-user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userUrl = 'http://localhost:8081/api/v1/user';
  private employeeUrl= 'http://localhost:8081/api/v1/employee';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Cờ refresh queue
  private refreshInProgress?: Promise<void>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  // ================= AUTH ==================
  login(credentials: LoginCredentials): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.userUrl}/login`, credentials);
  }

  logout(username?: string): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    this.currentUserSubject.next(null);

    this.router.navigate(['/login']);
    this.refreshInProgress = undefined;

    if (username) {
      this.http.put(`${this.userUrl}/logout?username=${username}`, {}).subscribe();
    }
  }

  // ================= EMPLOYEE ==================
  getAllEmployees(): Observable<UserResponse[]> {
    if (!this.isLoggedIn()) throw new Error('User not logged in');
    if (!this.isManager()) throw new Error('Access denied: Manager role required');

    return this.retryWithTokenRefresh(() => 
      this.http.get<UserResponse[]>(`${this.userUrl}/getAllEmployee`)
    );
  }

  getAllManagers(): Observable<EmployeeResponse[]> {
    return this.retryWithTokenRefresh(() =>
      this.http.get<EmployeeResponse[]>(`${this.employeeUrl}/getAllManager`)
    );
  }
  getEmpByUsername(username: string): Observable<EmployeeResponse> {
    return this.retryWithTokenRefresh(() =>
      this.http.get<EmployeeResponse>(`${this.employeeUrl}/getEmpByUsername?username=${username}`)
    );
  }

  createEmployeeUser(payload: CreateUserRequest): RxObservable<any> {
    if (!this.isLoggedIn() || !this.isManager()) throw new Error('Access denied');
    return this.retryWithTokenRefresh(() =>
      this.http.post(`${this.userUrl}/add-new-user`, payload)
    );
  }

 updateEmployeeUser(id: number, payload: UpdateUserRequest): RxObservable<any> {
  if (!this.isLoggedIn() || !this.isManager()) throw new Error('Access denied');
  return this.retryWithTokenRefresh(() =>
    this.http.put(`${this.employeeUrl}/update-user/${id}`, payload)
  );
}

  deleteUser(username: string): Observable<any> {
    if (!this.isLoggedIn() || !this.isManager()) throw new Error('Access denied');
    return this.retryWithTokenRefresh(() =>
      this.http.delete(`${this.employeeUrl}/delete-user?username=${encodeURIComponent(username)}`)
    );
  }

  // ================= TOKEN ==================
  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  saveUserInfo(userInfo: { username: string; role: Role | string }): void {
    let role: Role;
    if (typeof userInfo.role === 'string') {
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

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  refreshToken(): Observable<any> {
    if (this.refreshInProgress) {
      // Nếu đang refresh, wrap Promise thành Observable
      return new Observable((observer) => {
        this.refreshInProgress!
          .then(() => {
            observer.next(true);
            observer.complete();
          })
          .catch((err) => observer.error(err));
      });
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    // Tạo promise refresh
    this.refreshInProgress = this.http.post<TokenResponse>(
      `${this.userUrl}/refresh-token`,
      { refreshToken }
    ).toPromise()
      .then((response : any) => {
        this.saveTokens(response.accessToken, refreshToken);

        if (response.role) {
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            currentUser.role = this.convertStringToRole(response.role);
            this.saveUserInfo({ username: currentUser.username, role: currentUser.role });
          }
        }
        console.log('Token refreshed successfully');
      })
      .catch((error) => {
        console.error('Token refresh failed:', error);
        // Clear tokens before logout to prevent infinite loops
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.logout();
        throw error;
      })
      .finally(() => {
        this.refreshInProgress = undefined;
      });

    return new Observable((observer) => {
      this.refreshInProgress!
        .then(() => {
          observer.next(true);
          observer.complete();
        })
        .catch((err) => observer.error(err));
    });
  }

  retryWithTokenRefresh<T>(request: () => Observable<T>): Observable<T> {
    return new Observable((observer) => {
      request().subscribe({
        next: (res) => {
          observer.next(res);
          observer.complete();
        },
        error: (err) => {
          if (err.status === 401 || err.status === 403) {
            this.refreshToken().subscribe({
              next: () => {
                request().subscribe(observer);
              },
              error: (refreshErr) => observer.error(refreshErr)
            });
          } else {
            observer.error(err);
          }
        }
      });
    });
  }

  // ================= ROLE / USER ==================
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

  getCurrentRole(): Role | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isManager(): boolean {
    return this.hasRole(Role.MANAGER);
  }

  isEmployee(): boolean {
    return this.hasRole(Role.EMPLOYEE);
  }

  hasRole(role: Role): boolean {
    const currentRole = this.getCurrentUser()?.role;
    return currentRole === role ||
      String(currentRole).toUpperCase() === String(role).toUpperCase();
  }

  isLoggedIn(): boolean {
    const hasToken = !!this.getAccessToken();
    const hasUser = !!this.getCurrentUser();
    const tokenNotExpired = !this.isTokenExpired();
    return hasToken && hasUser && tokenNotExpired;
  }

  // ================= TOKEN CHECK ==================
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

  isRefreshTokenExpired(): boolean {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return true;

    try {
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing refresh token:', error);
      return true;
    }
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
    }
  }
}
