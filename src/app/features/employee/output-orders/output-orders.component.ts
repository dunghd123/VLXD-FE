import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { StatusTranslatePipe } from '../../../shared/pipes/status-translate.pipe';
import { OutputInvoiceFilter, OutputInvoiceResponse } from './output-orders.model';
import { InvoiceStatusEnums } from '../../../shared/models/enums.model';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { OutputInvoiceService } from '../../../core/auth/services/output-invoice.service';
import { PagedResponse } from '../../../shared/models/pagnition.model';
import { ViewOutputDetailModalComponent } from './detail-output/view-detail/view-output-detail-modal.component';
import { EditOutputDetailModalComponent } from './detail-output/edit-detail/edit-output-detail-modal.component';

@Component({
  selector: 'app-output-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, StatusTranslatePipe],
  templateUrl: './output-orders.component.html',
  styleUrls: ['./output-orders.component.css']

})
export class OutputOrdersComponent {
    outputInvoiceData: OutputInvoiceResponse[] = [];
    
    isLoading: boolean = false;
    errorMessage: string = '';
  
    page: number = 0;
    size: number = 10;
    totalElements: number = 0;
    totalPages: number = 0;
  
    // Filter state
    filter = {
      cusName: '',
      statusFilter: null as InvoiceStatusEnums | null,
    };

    // Modal state
    showDetailModal: boolean = false;
    selectedInvoice: OutputInvoiceResponse | null = null;
  
    constructor(
      private modalService: ModalService,
      private outputService: OutputInvoiceService
    ) {}
  
    ngOnInit(): void {
      this.loadOutputInvoice();
    }
  
    applyFilter(): void {
        this.loadOutputInvoice(0, this.size);
    }
  
    resetFilter(): void {
      this.filter = { 
        cusName: '',
        statusFilter: null,
      };
      this.loadOutputInvoice(0, this.size);
    }
  parseTime(dateString: string): Date | null {
    if (!dateString) return null;
    const [datePart, timePart] = dateString.split(" ");
    if (!datePart || !timePart) return null;
    const [year, month, day] = datePart.split("-").map(Number); // yyyy-MM-dd
    const [hours, minutes, seconds] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }
  canEdit(output: OutputInvoiceResponse, hours: number): boolean {
    const creationDate = this.parseTime(output.creationTime); // Date
    if (!creationDate) return false;

    const expiryDate = new Date(creationDate);
    expiryDate.setHours(expiryDate.getHours() + hours);

    const now = new Date();
    return now <= expiryDate;
  }

  loadOutputInvoice(page?: number, size?: number): void {
    if (typeof page === 'number') this.page = page;
    if (typeof size === 'number') this.size = size;
    
    this.isLoading = true;
    this.errorMessage = '';

    const filterRequest: OutputInvoiceFilter = {
      pageFilter: this.page,
      sizeFilter: this.size,
      cusNameFilter: this.filter.cusName || '',
      statusFilter: this.filter.statusFilter !== null ? this.filter.statusFilter : null,
    };
    this.outputService.loadOutputInvoicesByUser(filterRequest).subscribe({
      next: (response: PagedResponse<any>) => {
        this.isLoading = false;
        this.outputInvoiceData = response.content;
        this.totalPages = response.page?.totalPages ?? 0;
        this.totalElements = response.page?.totalElements ?? 0;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
      },
    });
  }
  openViewOutputInvoiceDetailModal(output: OutputInvoiceResponse) {
    this.modalService.open(ViewOutputDetailModalComponent, {
      size: 'lg',
      position: 'center',
      data: {
        outputInvoice: output,
        outputDetail: output.listOutputInvoiceDetails,
      }
    });
  }
  openAddOutputInvoiceModal(){
    this.modalService.open(EditOutputDetailModalComponent, {
      size: 'lg',
      position: 'center',
      data:{
        onSuccess: () => {
          this.loadOutputInvoice(0, this.size);
        }
      }
    });
  }

  openEditOutputInvoiceModal(output: OutputInvoiceResponse){
    this.modalService.open(EditOutputDetailModalComponent, {
      size: 'lg',
      position: 'center',
      data:{
        outputInvoice: output,
        onSuccess: () => {
          this.loadOutputInvoice(this.page, this.size);
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
      this.loadOutputInvoice(page, this.size);
    }
  
    nextPage(): void {
      if (this.page + 1 >= this.totalPages) return;
      this.loadOutputInvoice(this.page + 1, this.size);
    
    }
  
    prevPage(): void {
      if (this.page === 0) return;
        this.loadOutputInvoice(this.page - 1, this.size);
    }
  
    setPageSize(size: number): void {
      if (size <= 0) return;
      this.loadOutputInvoice(0, size);
    }
}
