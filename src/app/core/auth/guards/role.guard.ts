import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRoles = route.data['roles'] as Role[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const userRole = this.authService.getCurrentRole();
    
    if (!userRole) {
      this.router.navigate(['/login']);
      return false;
    }

    const hasRequiredRole = requiredRoles.includes(userRole);
    
    if (!hasRequiredRole) {
      // Redirect to unauthorized page or dashboard based on role
      if (this.authService.isManager()) {
        this.router.navigate(['/manager/dashboard']);
      } else {
        this.router.navigate(['/employee/dashboard']);
      }
      return false;
    }

    return true;
  }
}
