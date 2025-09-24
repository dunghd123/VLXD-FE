import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './handle-order.component.html',
  styleUrls: ['./handle-order.component.css'],
})
export class HandleOrdersComponent {
  // Tab management
    activeTab: 'current' | 'history' = 'current';
  
    
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
    
    ) {}
  
    ngOnInit(): void {
      this.loadCurrentPrices();
    }
  
    // Normalize BE item fields (camelCase/snake_case) to UI model
  
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
  
      this.loadCurrentPrices();
    }
  
    switchToHistoryPrices(): void {
      this.activeTab = 'history';
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
  
    loadCurrentPrices(page?: number, size?: number): void {
    }
  
    loadHistoryPrices(page?: number, size?: number): void {
      
    }
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
