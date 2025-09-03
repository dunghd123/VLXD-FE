import { Component } from '@angular/core';
import { Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LoginCredentials, TokenResponse, Role } from '../../models/auth.models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class LoginComponent {
  username = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (this.username.valid && this.password.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const credentials: LoginCredentials = {
        username: this.username.value || '',
        password: this.password.value || ''
      };
      
      this.authService.login(credentials).subscribe({
        next: (res: TokenResponse) => {
          this.isLoading = false;
          
          // BE trả về TokenResponse với accessToken và refreshToken
          if (res.accessToken && res.refreshToken) {
            this.authService.saveTokens(res.accessToken, res.refreshToken);
            this.authService.saveUserInfo({
              username: this.username.value ||'',
              role: res.role
            });
        
            // Redirect based on role
            if (res.role === Role.MANAGER) {
              this.router.navigate(['/manager/dashboard']);
            } else if (res.role === Role.EMPLOYEE) {
              this.router.navigate(['/employee/dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          } else {
            this.errorMessage = 'Invalid response from server';
          }
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 400) {
            this.errorMessage = 'Invalid username or password format';
          } else if (error.status === 403) {
            this.errorMessage = 'Invalid username or password';
          } else {
            this.errorMessage = 'Server error. Please try again later.';
          }
        }
      });
    }
  }
}
