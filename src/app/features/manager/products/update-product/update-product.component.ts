import { Component, Inject, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MODAL_DATA } from '../../../../shared/components/modal/modal.token';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { ToastMessageService } from '../../../../shared/services/toast-message.service';
import { UpdateProductRequest } from '../products.model';
import { ProductService } from '../../../../core/auth/services/product.service';
import { CategoryService } from '../../../../core/auth/services/category.service';
import { CategoryResponse } from '../../categories/categories.model';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.css']
})
export class UpdateProductComponent implements OnInit {
  @ViewChild('form') form!: NgForm;

  productModel: UpdateProductRequest  = {
      id: 0,
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
    private categoryService: CategoryService,
  ) {
    this.checkDeviceType();
  }

  ngOnInit() {
    this.categoryService.getListCategories().subscribe((response) => {
      this.categoryList = response;
      this.productModel.cateId = this.getCateId(this.data.product.cateName);
    });
    if (this.data && this.data.product) {
      this.productModel = { ...this.data.product };
    }
    this.populateProductModel(this.productModel);
    
  }
   private populateProductModel(product: any) {
    this.productModel = {
      id: product.id || 0,
      name: product.name || '',
      unitMeasure: product.unitMeasure || '',
      description: product.description || '',
      cateId: product.cateId || 0,
    };
  }
  private getCateId(cateName: string): number {
    for (const category of this.categoryList) {
      if (category.name === cateName) {
        return category.id;
      }
    }
    return 0;
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

    this.productService.updateProduct(this.productModel.id,this.productModel).subscribe({
      next: (response) => {
        this.toast.showSuccess('Thành công', response.message);
        this.modalService.close();

        if (this.data && this.data.onSuccess) {
          this.data.onSuccess(this.productModel);
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


