import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '../../../../../shared/pipes/currency.pipe';
import { InputInvoiceDetailResponse } from '../../input-orders.model';
import { ModalService } from '../../../../../shared/components/modal/modal.service';
import { MODAL_DATA } from '../../../../../shared/components/modal/modal.token';


@Component({
  selector: 'app-view-input-detail-modal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './view-input-detail-modal.component.html',
  styleUrls: ['./view-input-detail-modal.component.css']
})
export class ViewInputDetailModalComponent implements OnInit {
  listDetail: InputInvoiceDetailResponse[] = [];
  isMobile = false;
  constructor(
    @Inject(MODAL_DATA) public data: any,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    if (this.data && this.data.inputDetail) {
      this.listDetail = [...this.data.inputDetail];
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

  trackByFn(index: number, item: InputInvoiceDetailResponse): number {
    return item.id || index;
  }

}
