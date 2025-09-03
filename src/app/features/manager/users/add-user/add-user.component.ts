import { Component, Inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateUserRequest } from './add-user.model';
import { MODAL_DATA } from '../../../../shared/components/modal/modal.token';
import { ModalService } from '../../../../shared/components/modal/modal.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {

  model: CreateUserRequest = {
    username: '',
    password: '',
    fullName: '',
    address: '',
    dateOfBirth: '',
    gender: 'MALE',
    role: 'EMPLOYEE'
  };

  submitting = false;
  error = '';
  isMobile = false;

  constructor(
    @Inject(MODAL_DATA) public data: any,
    private modalService: ModalService
  ) {
    this.checkDeviceType();
  }

  ngOnInit() {
    // If data is passed from the modal, use it to pre-populate the form
    if (this.data && this.data.user) {
      this.model = { ...this.data.user };
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.checkDeviceType();
  }

  private checkDeviceType() {
    this.isMobile = window.innerWidth <= 768;
  }

  onSubmit() {
    if (this.submitting) return;
    
    this.submitting = true;
    this.error = '';

    setTimeout(() => {
      try {
        console.log('Creating user:', this.model);
        
        this.modalService.close();
        
        if (this.data && this.data.onSuccess) {
          this.data.onSuccess(this.model);
        }
      } catch (err) {
        this.error = 'Có lỗi xảy ra khi tạo người dùng. Vui lòng thử lại.';
      } finally {
        this.submitting = false;
      }
    }, 1000);
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
  @HostListener('document:keydown.enter')
  onEnterKey() {
    if (!this.submitting) {
      const form = document.querySelector('form');
      if (form && form.checkValidity()) {
        this.onSubmit();
      }
    }
  }

  // Get maximum date for date of birth (18 years ago from today)
  getMaxDate(): string {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  }
}


