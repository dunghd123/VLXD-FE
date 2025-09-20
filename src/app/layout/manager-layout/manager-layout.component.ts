import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './manager-layout.component.html',
  styleUrls: ['./manager-layout.component.css']
})
export class ManagerLayoutComponent {
  currentUser: any;
  isSidebarCollapsed = false;
  isReportsOpen = false;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleReports(): void {
    this.isReportsOpen = !this.isReportsOpen;
  }

  logout(): void {
    this.authService.logout(this.currentUser.username);
  }
}
