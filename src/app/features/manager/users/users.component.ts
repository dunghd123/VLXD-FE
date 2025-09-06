import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/services/auth.service';
import { EmployeeResponse, UserResponse } from './user.model';
import { StatusPipe } from '../../../shared/pipes/status.pipe';
import { AddUserComponent } from './add-user/add-user.component';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { ConfirmModalComponent } from '../../../shared/components/modal/confirm-modal/confirm-modal.component';
import { ToastMessageService } from '../../../shared/services/toast-message.service';

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
  managerList : EmployeeResponse[] = [];
  
  constructor(
    private auth: AuthService,
    private modalService: ModalService,
    private toast: ToastMessageService
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
    this.auth.getAllManagers().subscribe({
      next: (managers) => {
        this.managerList = managers;
        this.modalService.open(AddUserComponent, {
          size: 'md',
          position: 'center',
          theme: 'default',
          backdrop: true,
          closeOnBackdropClick: true,
          closeOnEscape: true,
          data: {
            managerList: this.managerList
          }
        });
      },
      error: () => {
        this.managerList = [];
        this.modalService.open(AddUserComponent, {
          data: { managerList: [] }
        });
      }
    });
  }
  openDeleteUserModal(user: UserResponse) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      position: 'center',
      data: {
        title: 'Xác nhận xóa',
        message: `Bạn có chắc chắn muốn xóa người dùng "${user.fullName}" (username: ${user.userName})?`,
        confirmText: 'Yes',
        cancelText: 'No',
        danger: true,
        iconClass: 'fa-trash-alt'
      }
    });

    // Listen to outputs
    const instance: any = modalRef.instance;
    if (instance && instance.confirm) {
      instance.confirm.subscribe(() => {
        this.deleteUser(user);
      });
    }
  }

  private deleteUser(user: UserResponse) {
    this.isLoading = true;
    this.auth.deleteUser(String(user.userName)).subscribe({
      next: () => {
        this.toast.showSuccess('Thành công', 'Xóa người dùng thành công');
        // Remove from arrays
        this.employees = this.employees.filter(u => u.userName !== user.userName);
        this.filteredEmployees = this.filteredEmployees.filter(u => u.userName !== user.userName);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        const message = err?.error?.message || err?.message || 'Không thể xóa người dùng';
        this.toast.showError('Lỗi', message);
      }
    });
  }
}
