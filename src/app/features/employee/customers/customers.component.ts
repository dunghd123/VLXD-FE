import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { ConfirmModalComponent } from '../../../shared/components/modal/confirm-modal/confirm-modal.component';
import { ToastMessageService } from '../../../shared/services/toast-message.service';
import { CustomerService } from '../../../core/auth/services/customer.service';
import { PagedResponse } from '../../../shared/models/pagnition.model';
import { ManagerCustomerResponse } from '../../manager/customers/customers.model';

@Component({
  selector: 'app-manager-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  customers: ManagerCustomerResponse[] = [];
  filteredCustomers: ManagerCustomerResponse[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  searchTerm: string = '';
  page: number = 0;
  size: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;

  constructor(
    private cus: CustomerService,
    private modalService: ModalService,
    private toast: ToastMessageService
  ) {}

  ngOnInit(): void {
    this.fetchCustomers();
  }

  fetchCustomers(page?: number, size?: number): void {
    if (typeof page === 'number') this.page = page;
    if (typeof size === 'number') this.size = size;
    this.isLoading = true;
    this.errorMessage = '';
    this.cus.getAllCustomers(this.page, this.size).subscribe({
      next: (data: PagedResponse<any>) => {
        // Map phoneNum -> phone if backend uses phoneNum
        this.customers = (data.content || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          address: c.address,
          phone: c.phone ?? c.phoneNum ?? ''
        }));
        this.filteredCustomers = [...this.customers];
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
    this.fetchCustomers(page, this.size);
  }

  nextPage(): void {
    if (this.page + 1 >= this.totalPages) return;
    this.fetchCustomers(this.page + 1, this.size);
  }

  prevPage(): void {
    if (this.page === 0) return;
    this.fetchCustomers(this.page - 1, this.size);
  }

  setPageSize(size: number): void {
    if (size <= 0) return;
    this.fetchCustomers(0, size);
  }

  onSearchChange(): void {
    this.filterCustomers();
  }

  filterCustomers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCustomers = [...this.customers];
      return;
    }
    const q = this.searchTerm.toLowerCase().trim();
    this.filteredCustomers = this.customers.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.address || '').toLowerCase().includes(q)
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
}
