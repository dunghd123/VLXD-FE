import { Component, Inject, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MODAL_DATA } from '../../../../shared/components/modal/modal.token';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { ToastMessageService } from '../../../../shared/services/toast-message.service';
import { AddPriceRequest } from '../price-history.model';
import { PriceHistoryService } from '../../../../core/auth/services/price-history.service';
import { ProductResponse } from '../../products/products.model';
import { ProductService } from '../../../../core/auth/services/product.service';

@Component({
  selector: 'app-add-price',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-price.component.html',
  styleUrls: ['./add-price.component.css']
})
export class AddPriceComponent implements OnInit {
  @ViewChild('form') form!: NgForm;

  addPriceModel: AddPriceRequest = {
    productId: 0,
    invoiceType: '',
    price: 0
  };

  productList: ProductResponse[] = [];

  submitting = false;
  error = '';
  isMobile = false;

  constructor(
    @Inject(MODAL_DATA) public data: any,
    private modalService: ModalService,
    private toast: ToastMessageService,
    private priceHistoryService: PriceHistoryService,
    private productService: ProductService
  ) {
    this.checkDeviceType();
  }

  ngOnInit() {
    this.loadProduct();
  }
  loadProduct() {
    this.productService.getListActiveProducts().subscribe({
      next: (response) => {
        this.productList = response;
      },
      error: (error) => {
        const err = error.error;
        if (err && typeof err === 'object') {
          const messages = Object.values(err).join('\n');
          this.toast.showError('Lỗi', messages);
        } else {
          this.toast.showError('Lỗi', 'Có lỗi xảy ra');
        }
      }
    });
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

    this.priceHistoryService.createPrice(this.addPriceModel).subscribe({
      next: (response) => {
        this.toast.showSuccess('Thành công', response.message);
        this.modalService.close();

        if (this.data && this.data.onSuccess) {
          this.data.onSuccess(this.addPriceModel);
        }
        this.submitting = false;
      },
      error: (error) => {
        const err = error.error;
        if (err && typeof err === 'object') {
          const messages = Object.values(err).join('\n');
          this.toast.showError('Lỗi', messages);
        } else {
          this.toast.showError('Lỗi', 'Có lỗi xảy ra');
        }
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


