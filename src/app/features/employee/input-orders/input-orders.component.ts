import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputInvoiceFilter, InputInvoiceResponse } from './input-orders.model';
import { PagedResponse } from '../../../shared/models/pagnition.model';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { InputInvoiceService } from '../../../core/auth/services/input-invoice.service';
import { ViewInputDetailModalComponent } from './detail-input/view-detail/view-input-detail-modal.component';
import { EditInputDetailModalComponent } from './detail-input/edit-detail/edit-input-detail-modal.component';
import { InvoiceStatusEnums } from '../../../shared/models/enums.model';
import { StatusTranslatePipe } from '../../../shared/pipes/status-translate.pipe';

@Component({
  selector: 'app-input-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, StatusTranslatePipe],
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
      statusFilter: null as InvoiceStatusEnums | null,
    };

    // Modal state
    showDetailModal: boolean = false;
    selectedInvoice: InputInvoiceResponse | null = null;
  
    constructor(
      private modalService: ModalService,
      private inputService: InputInvoiceService
    ) {}
  
    ngOnInit(): void {
      this.loadInputInvoice();
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
  parseTime(dateString: string): Date | null {
    if (!dateString) return null;
    const [datePart, timePart] = dateString.split(" ");
    if (!datePart || !timePart) return null;
    const [year, month, day] = datePart.split("-").map(Number); // yyyy-MM-dd
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }
  canEdit(inputInvoice: InputInvoiceResponse, hours: number): boolean {
    const creationDate = this.parseTime(inputInvoice.creationTime); // Date
    if (!creationDate) return false;

    const expiryDate = new Date(creationDate);
    expiryDate.setHours(expiryDate.getHours() + hours);

    const now = new Date();
    return now <= expiryDate;
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
      this.modalService.open(ViewInputDetailModalComponent, {
        size: 'lg',
        position: 'center',
        data: {
          inputInvoice: inputInvoice,
          inputDetail: inputInvoice.listInvoiceDetails,
        }
      });
    }
    openAddInputInvoiceModal(){
      this.modalService.open(EditInputDetailModalComponent, {
        size: 'lg',
        position: 'center',
        data:{
          onSuccess: () => {
            this.loadInputInvoice(0, this.size);
          }
        }
      });
    }

  openEditInputInvoiceModal(inputInvoice: InputInvoiceResponse){
    this.modalService.open(EditInputDetailModalComponent, {
      size: 'lg',
      position: 'center',
      data:{
        inputInvoice: inputInvoice,
        onSuccess: () => {
          this.loadInputInvoice(this.page, this.size);
        }
      }
    });
  }

    closeDetailModal(): void {
      this.showDetailModal = false;
      this.selectedInvoice = null;
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
