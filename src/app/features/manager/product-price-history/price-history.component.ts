import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PriceResponse, PriceFilterRequest } from './price-history.model';
import { PriceHistoryService } from '../../../core/auth/services/price-history.service';
import { PagedResponse } from '../../../shared/models/pagnition.model';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { AddPriceComponent } from './add-price/add-price.component';

@Component({
  selector: 'app-manager-price',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './price-history.component.html',
  styleUrls: ['./price-history.component.css'],
})
export class ProductPriceHistoryComponent implements OnInit {
  // Tab management
  activeTab: 'current' | 'history' = 'current';
  
  // Data for both tabs
  currentPriceData: PriceResponse[] = [];
  historyPriceData: PriceResponse[] = [];
  
  // Current displayed data
  priceHistoryData: PriceResponse[] = [];
  
  isLoading: boolean = false;
  errorMessage: string = '';

  // Pagination
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  // Filter state
  filter = {
    invoiceType: '',
    productName: '',
    startdate: '',
    enddate: '',
  };

  constructor(
    private priceHistoryService: PriceHistoryService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.loadCurrentPrices();
  }

  // Normalize BE item fields (camelCase/snake_case) to UI model
  private normalizePriceItem(raw: any): PriceResponse {
    return {
      id: raw.id,
      invoiceType: raw.invoiceType ?? raw.invoice_type ?? raw.invoice ?? raw.type ?? '',
      productName: raw.productName ?? raw.pro_name ?? raw.product_name ?? raw.name ?? '',
      price: this.normalizeNumber(raw.price),
      unitMeasure: raw.unitMeasure ?? raw.unit_measure ?? raw.unit ?? '',
      startDate: this.parseDate(
        raw.startDate ?? raw.startdate ?? raw.fromDate ?? raw.start ?? ''
      ) as any,
      endDate: this.parseDate(
        raw.endDate ?? raw.enddate ?? raw.toDate ?? raw.end ?? ''
      ) as any,
      active: raw.active ?? raw.isactive ?? raw.isActive ?? false,
    } as PriceResponse;
  }

  private normalizeNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const trimmed = value.trim().replace(/[,\s]/g, '');
      const num = Number(trimmed);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  // Accepts common formats: dd-MM-yyyy, dd-MM-yyyy HH:mm:ss, dd/MM/yyyy, yyyy-MM-dd, ISO strings
  private parseDate(value: any): Date | '' {
    if (!value) return '';
    if (value instanceof Date) return value;
    if (typeof value !== 'string') {
      const d = new Date(value);
      return isNaN(d.getTime()) ? '' : d;
    }
    const v = value.trim();
    
    // dd-MM-yyyy HH:mm:ss
    const dmYTime = /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/;
    // dd-MM-yyyy
    const dmY = /^(\d{2})-(\d{2})-(\d{4})$/;
    // dd/MM/yyyy
    const dmYSlash = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    // yyyy-MM-dd
    const yMd = /^(\d{4})-(\d{2})-(\d{2})$/;
    
    let m;
    if ((m = v.match(dmYTime))) {
      const [, dd, mm, yyyy, hh, min, ss] = m;
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss));
      return isNaN(d.getTime()) ? '' : d;
    }
    if ((m = v.match(dmY))) {
      const [, dd, mm, yyyy] = m;
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return isNaN(d.getTime()) ? '' : d;
    }
    if ((m = v.match(dmYSlash))) {
      const [, dd, mm, yyyy] = m;
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return isNaN(d.getTime()) ? '' : d;
    }
    if (yMd.test(v)) {
      const d = new Date(v);
      return isNaN(d.getTime()) ? '' : d;
    }
    const d = new Date(v);
    return isNaN(d.getTime()) ? '' : d;
  }

  // Tab switching methods
  switchToCurrentPrices(): void {
    this.activeTab = 'current';
    this.priceHistoryData = this.currentPriceData;
    this.loadCurrentPrices();
  }

  switchToHistoryPrices(): void {
    this.activeTab = 'history';
    this.priceHistoryData = this.historyPriceData;
    this.loadHistoryPrices();
  }

  applyFilter(): void {
    if (this.activeTab === 'current') {
      this.loadCurrentPrices(0, this.size);
    } else {
      this.loadHistoryPrices(0, this.size);
    }
  }

  resetFilter(): void {
    this.filter = { 
      invoiceType: '', 
      productName: '', 
      startdate: '', 
      enddate: ''
    };
    if (this.activeTab === 'current') {
      this.loadCurrentPrices(0, this.size);
    } else {
      this.loadHistoryPrices(0, this.size);
    }
  }

  addPrice(): void {
     this.modalService.open(AddPriceComponent, 
      {
        size: 'md',
        position: 'center',
        theme: 'default',
        backdrop: true,
        closeOnBackdropClick: true,
        closeOnEscape: true,
        data: {
          onSuccess: () => {
            this.loadCurrentPrices();
          }
        }
      } 
    );
  }

  editPrice(item: PriceResponse): void {
    alert('TODO: sửa giá - ' + item.productName);
  }

  exportExcel(): void {
    alert('TODO: xuất dữ liệu ra Excel');
  }

  loadCurrentPrices(page?: number, size?: number): void {
    if (typeof page === 'number') this.page = page;
    if (typeof size === 'number') this.size = size;
    
    this.isLoading = true;
    this.errorMessage = '';

    const filterRequest: PriceFilterRequest = {
      pageFilter: this.page,
      sizeFilter: this.size,
      invoiceTypeFilter: this.filter.invoiceType || undefined,
      productNameFilter: this.filter.productName || undefined,
      startDateFilter: this.filter.startdate || undefined,
      endDateFilter: this.filter.enddate || undefined,
      priceTypeFilter: 'current'
    };

    this.priceHistoryService.getCurrentPrices(filterRequest).subscribe({
      next: (data: PagedResponse<any>) => {
        const content = Array.isArray(data.content) ? data.content : [];
        this.currentPriceData = content.map((it: any) => this.normalizePriceItem(it));
        this.priceHistoryData = this.currentPriceData;
        this.totalPages = data.page?.totalPages ?? 0;
        this.totalElements = data.page?.totalElements ?? 0;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 403) this.errorMessage = 'Access denied: Bạn không có quyền truy cập.';
        else if (error.status === 401) this.errorMessage = 'Unauthorized: Vui lòng đăng nhập lại.';
        else if (error.status === 0) this.errorMessage = 'Lỗi mạng: Không thể kết nối máy chủ.';
        else this.errorMessage = error?.message || 'Đã xảy ra lỗi không xác định';
      }
    });
  }

  loadHistoryPrices(page?: number, size?: number): void {
    if (typeof page === 'number') this.page = page;
    if (typeof size === 'number') this.size = size;
    
    this.isLoading = true;
    this.errorMessage = '';

    const filterRequest: PriceFilterRequest = {
      pageFilter: this.page,
      sizeFilter: this.size,
      invoiceTypeFilter: this.filter.invoiceType || undefined,
      productNameFilter: this.filter.productName || undefined,
      startDateFilter: this.filter.startdate || undefined,
      endDateFilter: this.filter.enddate || undefined,
      priceTypeFilter: 'history'
    };

    this.priceHistoryService.getPriceHistory(filterRequest).subscribe({
      next: (data: PagedResponse<any>) => {
        const content = Array.isArray(data.content) ? data.content : [];
        this.historyPriceData = content.map((it: any) => this.normalizePriceItem(it));
        this.priceHistoryData = this.historyPriceData;
        this.totalPages = data.page?.totalPages ?? 0;
        this.totalElements = data.page?.totalElements ?? 0;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 403) this.errorMessage = 'Access denied: Bạn không có quyền truy cập.';
        else if (error.status === 401) this.errorMessage = 'Unauthorized: Vui lòng đăng nhập lại.';
        else if (error.status === 0) this.errorMessage = 'Lỗi mạng: Không thể kết nối máy chủ.';
        else this.errorMessage = error?.message || 'Đã xảy ra lỗi không xác định';
      }
    });
  }

  // Pagination methods
  setPage(page: number): void {
    if (page < 0) return;
    if (this.activeTab === 'current') {
      this.loadCurrentPrices(page, this.size);
    } else {
      this.loadHistoryPrices(page, this.size);
    }
  }

  nextPage(): void {
    if (this.page + 1 >= this.totalPages) return;
    if (this.activeTab === 'current') {
      this.loadCurrentPrices(this.page + 1, this.size);
    } else {
      this.loadHistoryPrices(this.page + 1, this.size);
    }
  }

  prevPage(): void {
    if (this.page === 0) return;
    if (this.activeTab === 'current') {
      this.loadCurrentPrices(this.page - 1, this.size);
    } else {
      this.loadHistoryPrices(this.page - 1, this.size);
    }
  }

  setPageSize(size: number): void {
    if (size <= 0) return;
    if (this.activeTab === 'current') {
      this.loadCurrentPrices(0, size);
    } else {
      this.loadHistoryPrices(0, size);
    }
  }
}
