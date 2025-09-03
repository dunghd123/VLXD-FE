import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/services/auth.service';
import { UserResponse } from './user.model';
import { StatusPipe } from '../../../shared/pipes/status.pipe';
import { AddUserComponent } from './add-user/add-user.component';
import { CreateUserRequest } from './add-user/add-user.model';
import { ModalService } from '../../../shared/components/modal/modal.service';

@Component({
  selector: 'app-manager-users',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusPipe],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  employees: UserResponse[] = [];
  filteredEmployees: UserResponse[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  searchTerm: string = '';
  
  constructor(
    private auth: AuthService,
    private modalService: ModalService
  ){}

  ngOnInit(): void {
    this.getAllEmployees();
  }

  
  // Search functionality
  onSearchChange(): void {
    this.filterEmployees();
  }
  
  filterEmployees(): void {
    if (!this.searchTerm.trim()) {
      this.filteredEmployees = [...this.employees];
    } else {
      const searchLower = this.searchTerm.toLowerCase().trim();
      this.filteredEmployees = this.employees.filter(user => 
        user.userName.toLowerCase().includes(searchLower) ||
        user.fullName.toLowerCase().includes(searchLower) ||
        user.phone.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        user.gender.toLowerCase().includes(searchLower)
      );
    }
  }
  
  // Helper method to check if status is active
  isStatusActive(status: any): boolean {
    return status === true || status === 'true' || status === 1 || status === '1';
  }
  
  // Helper method to get status icon class
  getStatusIconClass(status: any): string {
    return this.isStatusActive(status) ? 'fa-check-circle' : 'fa-times-circle';
  }
  
  // Helper method to get status badge class
  getStatusBadgeClass(status: any): string {
    return this.isStatusActive(status) ? 'status-active' : 'status-inactive';
  }
  
  getAllEmployees() {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      this.auth.getAllEmployees().subscribe({
        next: (data) => {
          this.employees = data;
          this.filteredEmployees = [...data]; // Initialize filtered employees
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          
          if (err.status === 403) {
            this.errorMessage = 'Access denied: You do not have permission to view employees.';
          } else if (err.status === 401) {
            this.errorMessage = 'Unauthorized: Please login again.';
          } else if (err.status === 0) {
            this.errorMessage = 'Network error: Cannot connect to server.';
          } else {
            this.errorMessage = `Error: ${err.message || 'Unknown error occurred'}`;
          }
        }
      });
    } catch (error: any) {
      this.isLoading = false;
      this.errorMessage = error.message || 'Access denied';
    }
  }

  openAddUserModal() {
    const modalRef = this.modalService.open(AddUserComponent, {
      size: 'md', // Medium size modal
      position: 'center', // Center position
      theme: 'default', // Default theme
      backdrop: true, // Show backdrop
      closeOnBackdropClick: true, // Close on backdrop click
      closeOnEscape: true, // Close on ESC key
      data: {
        onSuccess: (userData: CreateUserRequest) => {
          console.log('User created successfully:', userData);
          // Refresh the user list after successful creation
          this.getAllEmployees();
        },
        onCancel: () => {
          console.log('Add user modal cancelled');
        }
      }
    });
  }
}
