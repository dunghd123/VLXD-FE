import { Component, Inject, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UpdateUserRequest } from './update-user.model';
import { MODAL_DATA } from '../../../../shared/components/modal/modal.token';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ToastMessageService } from '../../../../shared/services/toast-message.service';
import { EmployeeResponse } from '../user.model';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit {
  managerList: EmployeeResponse[] = [];
  @ViewChild('form') form!: NgForm;

  userModel: UpdateUserRequest = {
    id: 0,
    username: '',
    password: '',
    fullName: '',
    address: '',
    phone: '',
    managerId: 0,
    dateOfBirth: '',
    gender: 'MALE',
    role: 'EMPLOYEE'
  };

  submitting = false;
  error = '';
  isMobile = false;

  constructor(
    @Inject(MODAL_DATA) public data: any,
    private modalService: ModalService,
    private authService: AuthService,
    private toast: ToastMessageService,
  ) {
    this.checkDeviceType();
    this.managerList= data.managerList

  }

  ngOnInit() {
    if (this.data && this.data.user) {
      const user = this.data.user;
      console.log('User data received:', user); // Debug log
      
      // Check if we have enough data, if not try to fetch from API
      if (user.id && (!user.address || !user.dateOfBirth)) {
        this.authService.getUserById(user.id).subscribe({
          next: (userDetail: any) => {
            console.log('User detail from API:', userDetail);
            this.populateUserModel(userDetail);
          },
          error: (err: any) => {
            console.warn('Could not fetch user detail, using available data:', err);
            this.populateUserModel(user);
          }
        });
      } else {
        this.populateUserModel(user);
      }
    }
  }

  private populateUserModel(user: any) {
    this.userModel = {
      id: user.id || 0,
      username: user.userName || user.username || '',
      password: '', 
      fullName: user.fullName || '',
      address: user.address || '',
      phone: user.phone || user.phoneNum || '',
      managerId: user.managerId || 0,
      dateOfBirth: user.dateOfBirth || user.dob || '',
      gender: (user.gender as 'MALE' | 'FEMALE' | 'OTHER') || 'MALE',
      role: (user.role as 'EMPLOYEE' | 'MANAGER') || 'EMPLOYEE'
    };
    
    console.log('User model populated:', this.userModel); // Debug log
  }

  @HostListener('window:resize')
  onResize() {
    this.checkDeviceType();
  }

  private checkDeviceType() {
    this.isMobile = window.innerWidth <= 768;
  }

  onSubmit(form: NgForm): void {
    if (this.submitting) return;
    if (!form.valid) {
      this.error = 'Vui lòng điền đầy đủ thông tin hợp lệ.';
      return;
    }

    this.submitting = true;
    this.error = '';

    // Prepare update data - remove password if empty
    const updateData = { ...this.userModel };
    if (!updateData.password || updateData.password.trim() === '') {
      delete updateData.password;
    }

    this.authService.updateEmployeeUser(updateData).subscribe({
      next: (response) => {
        this.toast.showSuccess('Thành công', response.message || 'Cập nhật người dùng thành công');
        this.modalService.close();

        if (this.data && this.data.onSuccess) {
          this.data.onSuccess(updateData);
        }
        this.submitting = false;
      },
      error: (error) => {
        this.toast.showError('Lỗi', error.error?.message || 'Có lỗi xảy ra khi cập nhật người dùng');
        this.submitting = false;
      }
    });
  }
  onRoleChange() {
    if (this.userModel.role === 'MANAGER') {
      this.userModel.managerId = 0;
    }
  }


  onCancel() {
    this.modalService.close();

    if (this.data && this.data.onCancel) {
      this.data.onCancel();
    }
  }

  closeModal() {
    this.modalService.close();
  }

  // Handle escape key press
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.closeModal();
  }

  // Handle enter key press on form
@HostListener('document:keydown.enter', ['$event'])
  onEnterKey(event: KeyboardEvent) {
    event.preventDefault();

    if (!this.submitting && this.form && this.form.valid) {
      this.onSubmit(this.form);
    }
  }

  // Get maximum date for date of birth (18 years ago from today)
  getMaxDate(): string {
    const today = new Date();
    const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  }
}


