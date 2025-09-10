import { Component, Inject, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MODAL_DATA } from '../../../../shared/components/modal/modal.token';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { ToastMessageService } from '../../../../shared/services/toast-message.service';
import { UpdateSupplierRequest } from '../suppliers.model';
import { SupplierService } from '../../../../core/auth/services/supplier.service';

@Component({
  selector: 'app-update-supplier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-supplier.component.html',
  styleUrls: ['./update-supplier.component.css']
})
export class UpdateSupplierComponent implements OnInit {
  @ViewChild('form') form!: NgForm;

  supplierModel: UpdateSupplierRequest = {
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
    private supplierService: SupplierService,
  ) {
    this.checkDeviceType();
  }

  ngOnInit() {
    if (this.data && this.data.supplier) {
      this.supplierModel = { ...this.data.supplier };
      this.populateSupplierModel(this.supplierModel);
      
    }
    
  }
   private populateSupplierModel(supplier: any) {
    this.supplierModel = {
      id: supplier.id || 0,
      address: supplier.address || '',
      phone: supplier.phone || supplier.phoneNum || '',
      name: supplier.name || '',
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

    this.supplierService.updateSupplier(this.supplierModel.id,this.supplierModel).subscribe({
      next: (response) => {
        this.toast.showSuccess('Thành công', response.message);
        this.modalService.close();

        if (this.data && this.data.onSuccess) {
          this.data.onSuccess(this.supplierModel);
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


