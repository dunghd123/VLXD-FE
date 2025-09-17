import { Component, Inject, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MODAL_DATA } from '../../../../shared/components/modal/modal.token';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { ToastMessageService } from '../../../../shared/services/toast-message.service';
import { CreateCustomerRequest, UpdateCustomerRequest } from '../customers.model';
import { CustomerService } from '../../../../core/auth/services/customer.service';

@Component({
  selector: 'app-update-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-customer.component.html',
  styleUrls: ['./update-customer.component.css']
})
export class UpdateCustomerComponent implements OnInit {
  @ViewChild('form') form!: NgForm;

  customerModel: UpdateCustomerRequest = {
    id: 0,
    name: '',
    address: '',
    phone: '',
  };

  submitting = false;
  error = '';
  isMobile = false;

  constructor(
    @Inject(MODAL_DATA) public data: any,
    private modalService: ModalService,
    private toast: ToastMessageService,
    private customerService: CustomerService,
  ) {
    this.checkDeviceType();
  }

  ngOnInit() {
    if (this.data && this.data.customer) {
      this.customerModel = { ...this.data.customer };
      this.populateCustomerModel(this.customerModel);
      
    }
    
  }
  private populateCustomerModel(customer: any) {
    this.customerModel = {
      id: customer.id || 0,
      address: customer.address || '',
      phone: customer.phone || customer.phoneNum || '',
      name: customer.name || '',
    };
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

    this.customerService.updateCustomer(this.customerModel.id,this.customerModel).subscribe({
      next: (response) => {
        this.toast.showSuccess('Thành công', response.message);
        this.modalService.close();

        if (this.data && this.data.onSuccess) {
          this.data.onSuccess(this.customerModel);
        }
        this.submitting = false;
      },
      error: (error) => {
        this.toast.showError('Lỗi', error.error.message);
        this.submitting = false;
      }
    });
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
}


