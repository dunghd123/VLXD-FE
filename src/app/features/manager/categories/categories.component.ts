import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryResponse } from './categories.model';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { ToastMessageService } from '../../../shared/services/toast-message.service';
import { CategoryService } from '../../../core/auth/services/category.service';
import { PagedResponse } from '../../../shared/models/pagnition.model';
import { ConfirmModalComponent } from '../../../shared/components/modal/confirm-modal/confirm-modal.component';
import { FormsModule } from '@angular/forms';
import { AddCategoryComponent } from './add-category/add-cate.component';
import { UpdateCategoryComponent } from './update-category/update-cate.component';

@Component({
  selector: 'app-manager-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
    categories: CategoryResponse[] = [];
    filteredCategories: CategoryResponse[] = [];
    errorMessage: string = '';
    isLoading: boolean = false;
    searchTerm: string = '';
    page: number = 0;
    size: number = 10;
    totalPages: number = 0;
    totalElements: number = 0;
  
    constructor(
      private categorysService: CategoryService,
      private modalService: ModalService,
      private toast: ToastMessageService
    ) {}
  
    ngOnInit(): void {
      this.fetchCategories();
    }
  
    fetchCategories(page?: number, size?: number): void {
      if (typeof page === 'number') this.page = page;
      if (typeof size === 'number') this.size = size;
      this.isLoading = true;
      this.errorMessage = '';
      this.categorysService.getAllCategories(this.page, this.size).subscribe({
        next: (data: PagedResponse<any>) => {
          this.categories = (data.content || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description,
          }));
          this.filteredCategories = [...this.categories];
          this.totalPages = data.page?.totalPages ?? 0;
          this.totalElements = data.page?.totalElements ?? 0;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 403) this.errorMessage = 'Access denied: Bạn không có quyền truy cập.';
          else if (err.status === 401) this.errorMessage = 'Unauthorized: Vui lòng đăng nhập lại.';
          else if (err.status === 0) this.errorMessage = 'Lỗi mạng: Không thể kết nối máy chủ.';
          else this.errorMessage = err?.message || 'Đã xảy ra lỗi không xác định';
        }
      });
    }
  
    setPage(page: number): void {
      if (page < 0) return;
      this.fetchCategories(page, this.size);
    }
  
    nextPage(): void {
      if (this.page + 1 >= this.totalPages) return;
      this.fetchCategories(this.page + 1, this.size);
    }
  
    prevPage(): void {
      if (this.page === 0) return;
      this.fetchCategories(this.page - 1, this.size);
    }
  
    setPageSize(size: number): void {
      if (size <= 0) return;
      this.fetchCategories(0, size);
    }
  
    onSearchChange(): void {
      this.filterCategories();
    }
  
    filterCategories(): void {
      if (!this.searchTerm.trim()) {
        this.filteredCategories = [...this.categories];
        return;
      }
      const q = this.searchTerm.toLowerCase().trim();
      this.filteredCategories = this.categories.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      );
    }
  
    openAddCategoryModal(): void {
      this.modalService.open(AddCategoryComponent, {
        size: 'md',
        position: 'center',
        data: {
          onSuccess: () => {
            this.fetchCategories(0, this.size);
          }
        }
      });
    }
    openEditCategoryModal(category: CategoryResponse): void {
      this.modalService.open(UpdateCategoryComponent, {
        size: 'md',
        position: 'center',
        data: { 
          category: category,
          onSuccess: () => {
            this.fetchCategories(this.page, this.size);
          }
         }
      });
    }
  
    openDeleteCategoryModal(category: CategoryResponse ): void {
      const modalRef = this.modalService.open(ConfirmModalComponent, {
        size: 'sm',
        position: 'center',
        data: {
          title: 'Xác nhận xóa',
          message: `Bạn có chắc chắn muốn xóa danh mục "${category.id}-${category.name}"?`,
          confirmText: 'Yes',
          cancelText: 'No',
          danger: true,
          iconClass: 'fa-trash-alt'
        }
      });
  
      const instance: any = modalRef.instance;
      if (instance && instance.confirm) {
        instance.confirm.subscribe(() => this.deleteCustomer(category));
      }
    }
  
    private deleteCustomer(category: CategoryResponse): void {
      this.isLoading = true;
      this.categorysService.deleteCategory(category.id).subscribe({
        next: () => {
          this.toast.showSuccess('Thành công', 'Xóa khách hàng thành công');
          this.categories = this.categories.filter(c => c.id !== category.id);
          this.filterCategories();
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          const message = err?.error?.message || err?.message || 'Không thể xóa khách hàng';
          this.toast.showError('Lỗi', message);
        }
      });
    }
}
