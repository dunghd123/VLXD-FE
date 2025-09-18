import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/auth/services/product.service';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { ToastMessageService } from '../../../shared/services/toast-message.service';
import { PagedResponse } from '../../../shared/models/pagnition.model';
import { ConfirmModalComponent } from '../../../shared/components/modal/confirm-modal/confirm-modal.component';
import { ProductResponse } from '../../manager/products/products.model';


@Component({
  selector: 'app-manager-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
    products: ProductResponse[] = [];
    filteredProducts: ProductResponse[] = [];
    errorMessage: string = '';
    isLoading: boolean = false;
    searchTerm: string = '';
    page: number = 0;
    size: number = 10;
    totalPages: number = 0;
    totalElements: number = 0;
  
    constructor(
      private productService: ProductService,
      private modalService: ModalService,
      private toast: ToastMessageService
    ) {}
  
    ngOnInit(): void {
      this.fetchProducts();
    }
  
    fetchProducts(page?: number, size?: number): void {
      if (typeof page === 'number') this.page = page;
      if (typeof size === 'number') this.size = size;
      this.isLoading = true;
      this.errorMessage = '';
      this.productService.getAllProducts(this.page, this.size).subscribe({
        next: (data: PagedResponse<any>) => {
          // Map phoneNum -> phone if backend uses phoneNum
          this.products = (data.content || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            unitMeasure: c.unitMeasure,
            description: c.description,
            cateName: c.cateName,
          }));
          this.filteredProducts = [...this.products];
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
      this.fetchProducts(page, this.size);
    }
  
    nextPage(): void {
      if (this.page + 1 >= this.totalPages) return;
      this.fetchProducts(this.page + 1, this.size);
    }
  
    prevPage(): void {
      if (this.page === 0) return;
      this.fetchProducts(this.page - 1, this.size);
    }
  
    setPageSize(size: number): void {
      if (size <= 0) return;
      this.fetchProducts(0, size);
    }
  
    onSearchChange(): void {
      this.filterProducts();
    }
  
    filterProducts(): void {
      if (!this.searchTerm.trim()) {
        this.filteredProducts = [...this.products];
        return;
      }
      const q = this.searchTerm.toLowerCase().trim();
      this.filteredProducts = this.products.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.cateName || '').toLowerCase().includes(q) ||
        (c.unitMeasure || '').toLowerCase().includes(q)
      );
    }
}
