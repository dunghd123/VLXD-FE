import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '../../../../../shared/pipes/currency.pipe';
import { ModalService } from '../../../../../shared/components/modal/modal.service';
import { MODAL_DATA } from '../../../../../shared/components/modal/modal.token';
import { OutputInvoiceDetailResponse } from '../../output-orders.model';


@Component({
  selector: 'app-view-output-detail-modal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './view-output-detail-modal.component.html',
  styleUrls: ['./view-output-detail-modal.component.css']
})
export class ViewOutputDetailModalComponent implements OnInit {
  listDetail: OutputInvoiceDetailResponse[] = [];
  isMobile = false;
  constructor(
    @Inject(MODAL_DATA) public data: any,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    if (this.data && this.data.outputDetail) {
      this.listDetail = [...this.data.outputDetail];
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

  trackByFn(index: number, item: OutputInvoiceDetailResponse): number {
    return item.id || index;
  }

}
