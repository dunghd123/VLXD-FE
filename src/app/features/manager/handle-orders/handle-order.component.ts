import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputOrderResponse, OutputOrderResponse } from './handle-order.model';
import { InputInvoiceService } from '../../../core/auth/services/input-invoice.service';
import { OutputInvoiceService } from '../../../core/auth/services/output-invoice.service';
import { PagedResponse } from '../../../shared/models/pagnition.model';
import { ToastMessageService } from '../../../shared/services/toast-message.service';
import { ConfirmModalComponent } from '../../../shared/components/modal/confirm-modal/confirm-modal.component';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { ViewInvoiceDetailModalComponent } from './view-detail/view-invoice-detail-modal.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './handle-order.component.html',
  styleUrls: ['./handle-order.component.css'],
})
export class HandleOrdersComponent implements OnInit {
  // Tab management
    activeTab: 'input' | 'output' = 'input';
  
    inputInvoiceData: InputOrderResponse[] = [];
    outputInvoiceData: OutputOrderResponse[] = [];
  
    // Loading
    isLoading: boolean = false;
    errorMessage: string = '';
  
    // Pagination
    page: number = 0;
    size: number = 10;
    totalElements: number = 0;
    totalPages: number = 0;
  
    // Filter state
    filter = {
      searchText: '', // tùy chọn tìm kiếm chung (mã, tên KH/NCC)
      startdate: '',
      enddate: '',
    };
  
    constructor(
      private inputInvoiceService: InputInvoiceService,
      private outputInvoiceService: OutputInvoiceService,
      private toast: ToastMessageService,
      private modalService: ModalService
    ) {}
  
    ngOnInit(): void {
      this.loadInputOrders();
    }

    // Tab switching methods
    switchToInputOrders(): void {
      this.activeTab = 'input';
      this.loadInputOrders(0, this.size);
    }
  
    switchToOutputOrders(): void {
      this.activeTab = 'output';
      this.loadOutputOrders(0, this.size);
    }
  
    applyFilter(): void {
      if (this.activeTab === 'input') {
        this.loadInputOrders(0, this.size);
      } else {
        this.loadOutputOrders(0, this.size);
      }
    }
  
    resetFilter(): void {
      this.filter = { 
        searchText: '', 
        startdate: '', 
        enddate: ''
      };
      if (this.activeTab === 'input') {
        this.loadInputOrders(0, this.size);
      } else {
        this.loadOutputOrders(0, this.size);
      }
    }
  

    setPage(page: number): void {
      if (page < 0) return;
      if (this.activeTab === 'input') {
        this.loadInputOrders(page, this.size);
      } else {
        this.loadOutputOrders(page, this.size);
      }
    }
  
    nextPage(): void {
      if (this.page + 1 >= this.totalPages) return;
      if (this.activeTab === 'input') {
        this.loadInputOrders(this.page + 1, this.size);
      } else {
        this.loadOutputOrders(this.page + 1, this.size);
      }
    }
  
    prevPage(): void {
      if (this.page === 0) return;
      if (this.activeTab === 'input') {
        this.loadInputOrders(this.page - 1, this.size);
      } else {
        this.loadOutputOrders(this.page - 1, this.size);
      }
    }
  
    setPageSize(size: number): void {
      if (size <= 0) return;
      if (this.activeTab === 'input') {
        this.loadInputOrders(0, size);
      } else {
        this.loadOutputOrders(0, size);
      }
    }

    private normalizeNumber(value: any): number {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const trimmed = value.trim().replace(/[\s,]/g, '');
        const num = Number(trimmed);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    }

    private mapToInputOrder(item: any): InputOrderResponse {
      return {
        id: item.id,
        code: item.code ?? item.invoiceCode ?? '',
        supName: item.supName ?? item.supplierName ?? '',
        creationTime: item.creationTime ?? item.createdAt ?? item.creation_time ?? '',
        status: item.status ?? '',
        listInputInvoiceDetails: (item.listInvoiceDetails ?? item.listInputInvoiceDetails ?? []).map((d: any) => ({
          id: d.id,
          productName: d.productName ?? d.proName ?? '',
          unitMeasure: d.unitMeasure ?? d.unit ?? '',
          quantity: this.normalizeNumber(d.quantity),
          price: this.normalizeNumber(d.price),
          amount: this.normalizeNumber(d.amount),
          warehouseName: d.warehouseName ?? d.whName ?? ''
        })),
        totalAmount: this.normalizeNumber(item.totalAmount)
      } as InputOrderResponse;
    }

    private mapToOutputOrder(item: any): OutputOrderResponse {
      return {
        id: item.id,
        code: item.code ?? item.invoiceCode ?? '',
        cusName: item.cusName ?? item.customerName ?? '',
        creationTime: item.creationTime ?? item.createdAt ?? item.creation_time ?? '',
        shipAddress: item.shipAddress ?? item.address ?? undefined,
        status: item.status ?? '',
        listOutputInvoiceDetails: (item.listOutputInvoiceDetails ?? item.listInvoiceDetails ?? []).map((d: any) => ({
          id: d.id,
          productName: d.productName ?? d.proName ?? '',
          unitMeasure: d.unitMeasure ?? d.unit ?? '',
          quantity: this.normalizeNumber(d.quantity),
          price: this.normalizeNumber(d.price),
          amount: this.normalizeNumber(d.amount),
          warehouseName: d.warehouseName ?? d.whName ?? ''
        })),
        totalAmount: this.normalizeNumber(item.totalAmount)
      } as OutputOrderResponse;
    }

    loadInputOrders(page?: number, size?: number): void {
      if (typeof page === 'number') this.page = page;
      if (typeof size === 'number') this.size = size;

      this.isLoading = true;
      this.errorMessage = '';

      this.inputInvoiceService.loadPendingInputInvoice(this.page, this.size).subscribe({
        next: (res: PagedResponse<any>) => {
          const content = Array.isArray(res.content) ? res.content : [];
          this.inputInvoiceData = content.map((it: any) => this.mapToInputOrder(it));
          this.totalPages = res.page?.totalPages ?? 0;
          this.totalElements = res.page?.totalElements ?? 0;
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

    loadOutputOrders(page?: number, size?: number): void {
      if (typeof page === 'number') this.page = page;
      if (typeof size === 'number') this.size = size;

      this.isLoading = true;
      this.errorMessage = '';

      this.outputInvoiceService.loadPendingOutputInvoice(this.page, this.size).subscribe({
        next: (res: PagedResponse<any>) => {
          const content = Array.isArray(res.content) ? res.content : [];
          this.outputInvoiceData = content.map((it: any) => this.mapToOutputOrder(it));
          this.totalPages = res.page?.totalPages ?? 0;
          this.totalElements = res.page?.totalElements ?? 0;
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
    openConfirmAprove(invoice: InputOrderResponse | OutputOrderResponse){
       const modalRef = this.modalService.open(ConfirmModalComponent, {
            size: 'sm',
            position: 'center',
            data: {
              title: 'Xác nhận chấp thuận đơn hàng',
              message: `Bạn muốn chấp nhận đơn hàng: "${invoice.id} - ${invoice.code}"?`,
              confirmText: 'Yes',
              cancelText: 'No',
              danger: true,
              iconClass: 'fa-trash-alt'
            }
          });
      
          const instance: any = modalRef.instance;
          if (instance && instance.confirm) {
            instance.confirm.subscribe(() => this.approveInvoice(invoice.id));
          }
    }
  openConfirmReject(invoice: InputOrderResponse | OutputOrderResponse){
       const modalRef = this.modalService.open(ConfirmModalComponent, {
            size: 'sm',
            position: 'center',
            data: {
              title: 'Xác nhận hủy đơn hàng',
              message: `Bạn muốn hủy đơn hàng: "${invoice.id} - ${invoice.code}"?`,
              confirmText: 'Yes',
              cancelText: 'No',
              danger: true,
              iconClass: 'fa-trash-alt'
            }
          });
      
          const instance: any = modalRef.instance;
          if (instance && instance.confirm) {
            instance.confirm.subscribe(() => this.rejectInvoice(invoice.id));
          }
    }
    approveInvoice(id: number): void {
      if(this.activeTab === 'input') {
        this.inputInvoiceService.aproveInputInvoice(id).subscribe({
          next: (res: any) => {
            this.loadInputOrders(this.page, this.size),
            this.toast.showSuccess('Thành công', res.message);
          },
          error: (error) => {
            this.toast.showError('Thất bại', error.message);
            this.loadInputOrders(this.page, this.size)
          }
        });
      }else {
        this.outputInvoiceService.aproveOutputInvoice(id).subscribe({
         next: (res: any) => {
            this.loadInputOrders(this.page, this.size),
            this.toast.showSuccess('Thành công', res.message);
          },
          error: (error) => {
            this.toast.showError('Thất bại', error.message);
            this.loadInputOrders(this.page, this.size)
          }
      });
      }
    }
    rejectInvoice(id: number): void {
      if(this.activeTab === "input"){
        this.inputInvoiceService.rejectInputInvoice(id).subscribe({
          next: (res: any) => {
            this.loadInputOrders(this.page, this.size),
            this.toast.showSuccess('Thành công', res.message);
          },
          error: (error) => {
            this.toast.showError('Thất bại', error.message);
            this.loadInputOrders(this.page, this.size)
          }
        });
      }else {
        this.outputInvoiceService.rejectOutputInvoice(id).subscribe({
          next: (res: any) => {
            this.loadInputOrders(this.page, this.size),
            this.toast.showSuccess('Thành công', res.message);
          },
          error: (error) => {
            this.toast.showError('Thất bại', error.message);
            this.loadInputOrders(this.page, this.size)
          }
        });
      }
    }
    openViewDetailInvoice(invoice: InputOrderResponse | OutputOrderResponse) {
      const modalRef = this.modalService.open(ViewInvoiceDetailModalComponent, {
        size: 'md',
        position: 'center',
        data: {
          invoice: invoice,
          activeTab: this.activeTab
        }
      });
    }
}
