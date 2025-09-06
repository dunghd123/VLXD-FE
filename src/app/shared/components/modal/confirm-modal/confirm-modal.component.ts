import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MODAL_DATA } from '../modal.token';
import { ModalService } from '../modal.service';

export interface ConfirmModalData {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  iconClass?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent {
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  constructor(
    @Inject(MODAL_DATA) public data: ConfirmModalData,
    private modalService: ModalService
  ) {}

  onConfirm() {
    // Debug: confirm clicked
    console.log('[ConfirmModal] Confirm clicked');
    this.confirm.emit();
    this.modalService.close();
  }

  onCancel() {
    // Debug: cancel clicked
    console.log('[ConfirmModal] Cancel clicked');
    this.cancel.emit();
    this.modalService.close();
  }
}


