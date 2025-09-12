import { Component, Inject, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MODAL_DATA } from '../../../../shared/components/modal/modal.token';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { ToastMessageService } from '../../../../shared/services/toast-message.service';
import { CategoryService } from '../../../../core/auth/services/category.service';
import { CreateProductRequest } from '../products.model';
import { ProductService } from '../../../../core/auth/services/product.service';
import { CategoryResponse } from '../../categories/categories.model';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  @ViewChild('form') form!: NgForm;

  productModel: CreateProductRequest = {
    name: '',
    unitMeasure: '',
    description: '',
    cateId: 0,
  };

  categoryList: CategoryResponse[] = [];

  submitting = false;
  error = '';
  isMobile = false;

  constructor(
    @Inject(MODAL_DATA) public data: any,
    private modalService: ModalService,
    private toast: ToastMessageService,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {
    this.checkDeviceType();
  }

  ngOnInit() {
    if (this.data && this.data.product) {
      this.productModel = { ...this.data.product };
    }

    this.categoryService.getListCategories().subscribe((response) => {
      this.categoryList = response;
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

    this.productService.createProduct(this.productModel).subscribe({
      next: (response) => {
        this.toast.showSuccess('Thành công', response.message);
        this.modalService.close();

        if (this.data && this.data.onSuccess) {
          this.data.onSuccess(this.productModel);
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


