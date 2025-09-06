import { Component, Inject, OnInit, OnDestroy, HostListener, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CreateUserRequest } from './add-user.model';
import { MODAL_DATA } from '../../../../shared/components/modal/modal.token';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { ToastMessageService } from '../../../../shared/services/toast-message.service';
import { EmployeeResponse } from '../user.model';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  managerList: EmployeeResponse[] = [];
  @ViewChild('form') form!: NgForm;

  userModel: CreateUserRequest = {
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
    // If data is passed from the modal, use it to pre-populate the form
    if (this.data && this.data.user) {
      this.userModel = { ...this.data.user };
    }
    
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

    this.authService.createEmployeeUser(this.userModel).subscribe({
      next: (response) => {
        this.toast.showSuccess('Thành công', response.message);
        this.modalService.close();

        if (this.data && this.data.onSuccess) {
          this.data.onSuccess(this.userModel);
        }
        this.submitting = false;
      },
      error: (error) => {
        this.toast.showError('Lỗi', error.error.message);
        // this.error = error?.error?.message || 'Có lỗi xảy ra khi tạo người dùng. Vui lòng thử lại.';
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


