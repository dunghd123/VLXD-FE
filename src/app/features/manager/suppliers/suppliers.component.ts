import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { ConfirmModalComponent } from '../../../shared/components/modal/confirm-modal/confirm-modal.component';
import { ToastMessageService } from '../../../shared/services/toast-message.service';
import { ManagerSupplierResponse } from './suppliers.model';
import { SupplierService } from '../../../core/auth/services/supplier.service';
import { PagedResponse } from '../../../shared/models/pagnition.model';
import { AddSupplierComponent } from './add-supplier/add-supplier.component';
import { UpdateSupplierComponent } from './update-supplier/update-supplier.component';

@Component({
  selector: 'app-manager-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent implements OnInit {
  suppliers: ManagerSupplierResponse[] = [];
  filteredSuppliers: ManagerSupplierResponse[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  searchTerm: string = '';
  page: number = 0;
  size: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;

  constructor(
    private sup: SupplierService,
    private modalService: ModalService,
    private toast: ToastMessageService
  ) {}

  ngOnInit(): void {
    this.fetchSuppliers();
  }

  fetchSuppliers(page?: number, size?: number): void {
    if (typeof page === 'number') this.page = page;
        if (typeof size === 'number') this.size = size;
        this.isLoading = true;
        this.errorMessage = '';
        this.sup.getAllSuppliers(this.page, this.size).subscribe({
          next: (data: PagedResponse<any>) => {
            // Map phoneNum -> phone if backend uses phoneNum
            this.suppliers = (data.content || []).map((c: any) => ({
              id: c.id,
              name: c.name,
              address: c.address,
              phone: c.phone ?? c.phoneNum ?? ''
            }));
            this.filteredSuppliers = [...this.suppliers];
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
    this.fetchSuppliers(page, this.size);
  }

  nextPage(): void {
    if (this.page + 1 >= this.totalPages) return;
    this.fetchSuppliers(this.page + 1, this.size);
  }

  prevPage(): void {
    if (this.page === 0) return;
    this.fetchSuppliers(this.page - 1, this.size);
  }

  setPageSize(size: number): void {
    if (size <= 0) return;
    this.fetchSuppliers(0, size);
  }

  onSearchChange(): void {
    this.filterSuppliers();
  }

  filterSuppliers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSuppliers = [...this.suppliers];
      return;
    }
    const q = this.searchTerm.toLowerCase().trim();
    this.filteredSuppliers = this.suppliers.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.phone || '').toLowerCase().includes(q) ||
      (s.address || '').toLowerCase().includes(q)
    );
  }

  isStatusActive(status: any): boolean {
    return status === true || status === 'true' || status === 1 || status === '1';
  }

  getStatusIconClass(status: any): string {
    return this.isStatusActive(status) ? 'fa-check-circle' : 'fa-times-circle';
  }

  getStatusBadgeClass(status: any): string {
    return this.isStatusActive(status) ? 'status-active' : 'status-inactive';
  }
  openAddSupplierModal(): void {
    this.modalService.open(AddSupplierComponent, { 
      size: 'md', 
      position: 'center', 
      data: {
        onSuccess: () => {
          this.fetchSuppliers(0, this.size);
        }
      } });
  }
  openEditSupplierModal(supplier: ManagerSupplierResponse): void {
    this.modalService.open(UpdateSupplierComponent, { 
      size: 'md', 
      position: 'center', 
      data: { 
        supplier: supplier,
        onSuccess: () => {
          this.fetchSuppliers(this.page, this.size);
        } 
      }});
  }
  openDeleteSupplierModal(supplier: ManagerSupplierResponse): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      position: 'center',
      data: {
        title: 'Xác nhận xóa',
        message: `Bạn có chắc chắn muốn xóa nhà cung cấp \"${supplier.name}\"?`,
        confirmText: 'Yes',
        cancelText: 'No',
        danger: true,
        iconClass: 'fa-trash-alt'
      }
    });

    const instance: any = modalRef.instance;
    if (instance && instance.confirm) {
      instance.confirm.subscribe(() => this.deleteSupplier(supplier));
    }
  }

  private deleteSupplier(supplier: ManagerSupplierResponse): void {
    this.isLoading = true;
    this.sup.deleteSupplier(supplier.id).subscribe({
      next: () => {
        this.toast.showSuccess('Thành công', 'Xóa nhà cung cấp thành công');
        this.suppliers = this.suppliers.filter(s => s.id !== supplier.id);
        this.filterSuppliers();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        const message = err?.error?.message || err?.message || 'Không thể xóa nhà cung cấp';
        this.toast.showError('Lỗi', message);
      }
    });
  }
}
