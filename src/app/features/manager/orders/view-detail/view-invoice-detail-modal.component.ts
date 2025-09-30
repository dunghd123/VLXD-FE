import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { OutputInvoiceDetailResponse } from '../../../employee/output-orders/output-orders.model';
import { InputInvoiceDetailResponse } from '../../../employee/input-orders/input-orders.model';
import { MODAL_DATA } from '../../../../shared/components/modal/modal.token';
import { ModalService } from '../../../../shared/components/modal/modal.service';


@Component({
  selector: 'app-view-invoice-detail-modal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './view-invoice-detail-modal.component.html',
  styleUrls: ['./view-invoice-detail-modal.component.css']
})
export class ViewInvoiceDetailModalComponent implements OnInit {
  activeTab: string ="";
  listDetail: InputInvoiceDetailResponse[] | OutputInvoiceDetailResponse[] = [];
  isMobile = false;
  constructor(
    @Inject(MODAL_DATA) public data: any,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    if (this.data && this.data.invoice) {
      this.activeTab = this.data.activeTab
      if(this.activeTab === "input") this.listDetail = [...this.data.invoice.listInputInvoiceDetails];
      if(this.activeTab === "output") this.listDetail = [...this.data.invoice.listOutputInvoiceDetails];
    } 
  }
  @HostListener('window:resize')
  onResize() {
    this.checkDeviceType();
  }

  private checkDeviceType() {
    this.isMobile = window.innerWidth <= 768;
  }

  onCancel() {
    this.modalService.close();

    if (this.data && this.data.onCancel) {
      this.data.onCancel();
    }
  }

  closeModal() {
    this.modalService.close();
  }

  trackByFn(index: number, item: InputInvoiceDetailResponse | OutputInvoiceDetailResponse): number {
    return item.id || index;
  }

}
