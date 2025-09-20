import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputInvoiceFilter, InputInvoiceResponse } from './input-orders.model';
import { PagedResponse } from '../../../shared/models/pagnition.model';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { ToastMessageService } from '../../../shared/services/toast-message.service';
import { InputInvoiceService } from '../../../core/auth/services/input-invoice.service';

@Component({
  selector: 'app-input-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './input-orders.component.html',
  styleUrls: ['./input-orders.component.css'],
})
export class InputOrdersComponent {
    
    inputInvoiceData: InputInvoiceResponse[] = [];
    
    isLoading: boolean = false;
    errorMessage: string = '';
  
    page: number = 0;
    size: number = 10;
    totalElements: number = 0;
    totalPages: number = 0;
  
    // Filter state
    filter = {
      supName: '',
      statusFilter: null,
    };
  
    constructor(
      private modalService: ModalService,
      private toast: ToastMessageService,
      private inputService: InputInvoiceService
    ) {}
  
    ngOnInit(): void {
      this.loadInputInvoice();
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
  
    applyFilter(): void {
        this.loadInputInvoice(0, this.size);
    }
  
    resetFilter(): void {
      this.filter = { 
        supName: '',
        statusFilter: null,
      };
      this.loadInputInvoice(0, this.size);
    }
  
    addPrice(): void {
    
    }

  
    loadInputInvoice(page?: number, size?: number): void {
      if (typeof page === 'number') this.page = page;
      if (typeof size === 'number') this.size = size;
      
      this.isLoading = true;
      this.errorMessage = '';
  
      const filterRequest: InputInvoiceFilter = {
        pageFilter: this.page,
        sizeFilter: this.size,
        supNameFilter: this.filter.supName || '',
        statusFilter: this.filter.statusFilter !== null ? this.filter.statusFilter : null,
      };
      this.inputService.loadInputInvoicesByUser(filterRequest).subscribe({
        next: (response: PagedResponse<any>) => {
          this.isLoading = false;
          this.inputInvoiceData = response.content;
          this.totalPages = response.page?.totalPages ?? 0;
          this.totalElements = response.page?.totalElements ?? 0;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message;
        },
      });
    }
    openViewInputInvoiceModal(inputInvoice: InputInvoiceResponse) {
      alert("TODO: view input invoice" + inputInvoice.id);
    }

    // Pagination methods
    setPage(page: number): void {
      if (page < 0) return;
      this.loadInputInvoice(page, this.size);
    }
  
    nextPage(): void {
      if (this.page + 1 >= this.totalPages) return;
      this.loadInputInvoice(this.page + 1, this.size);
    
    }
  
    prevPage(): void {
      if (this.page === 0) return;
        this.loadInputInvoice(this.page - 1, this.size);
    }
  
    setPageSize(size: number): void {
      if (size <= 0) return;
      this.loadInputInvoice(0, size);
    }
}
