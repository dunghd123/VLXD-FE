import { Component, Inject, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MODAL_DATA } from '../../../../shared/components/modal/modal.token';
import { ModalService } from '../../../../shared/components/modal/modal.service';
import { ToastMessageService } from '../../../../shared/services/toast-message.service';
import { CreateCategoryRequest } from '../categories.model';
import { CategoryService } from '../../../../core/auth/services/category.service';

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-cate.component.html',
  styleUrls: ['./add-cate.component.css']
})
export class AddCategoryComponent implements OnInit {
  @ViewChild('form') form!: NgForm;

  categoryModel: CreateCategoryRequest = {
    name: '',
    description: '',
  };

  submitting = false;
  error = '';
  isMobile = false;

  constructor(
    @Inject(MODAL_DATA) public data: any,
    private modalService: ModalService,
    private toast: ToastMessageService,
    private categoryService: CategoryService,
  ) {
    this.checkDeviceType();
  }

  ngOnInit() {
    if (this.data && this.data.category) {
      this.categoryModel = { ...this.data.category };
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

    this.categoryService.createCategory(this.categoryModel).subscribe({
      next: (response) => {
        this.toast.showSuccess('Thành công', response.message);
        this.modalService.close();

        if (this.data && this.data.onSuccess) {
          this.data.onSuccess(this.categoryModel);
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


