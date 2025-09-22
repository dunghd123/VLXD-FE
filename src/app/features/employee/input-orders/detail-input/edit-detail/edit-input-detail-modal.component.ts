import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '../../../../../shared/pipes/currency.pipe';
import { InputInvoiceDetailRequest, InputInvoiceDetailResponse, InputInvoiceRequest } from '../../input-orders.model';
import { ModalService } from '../../../../../shared/components/modal/modal.service';
import { MODAL_DATA } from '../../../../../shared/components/modal/modal.token';
import { FormsModule, NgForm } from '@angular/forms';
import { EditableTableComponent, EditableTableColumn } from '../../../../../shared/components/editable-table/editable-table.component';
import { ProductService } from '../../../../../core/auth/services/product.service';
import { SupplierService } from '../../../../../core/auth/services/supplier.service';
import { ProductResponse } from '../../../../manager/products/products.model';
import { ManagerSupplierResponse } from '../../../../manager/suppliers/suppliers.model';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import { EmployeeResponse } from '../../../../manager/users/user.model';
import { Observable } from 'rxjs';
import { Warehouse } from '../../../../../shared/models/warehouse.model';
import { WarehouseService } from '../../../../../core/auth/services/warehouse.service';
import { InputInvoiceService } from '../../../../../core/auth/services/input-invoice.service';
import { PriceHistoryService } from '../../../../../core/auth/services/price-history.service';
import { ToastMessageService } from '../../../../../shared/services/toast-message.service';


@Component({
  selector: 'app-edit-input-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, EditableTableComponent ],
  templateUrl: './edit-input-detail-modal.component.html',
  styleUrls: ['./edit-input-detail-modal.component.css']
})
export class EditInputDetailModalComponent implements OnInit {
  @ViewChild('form') form!: NgForm;
  submitting = false;
  error = '';
  isMobile = false;
  isEditMode = false;

  inputInvoiceid: number =0;
  productList: ProductResponse[] = [];
  suppList: ManagerSupplierResponse[] = [];
  warehouseList: Warehouse[] = [];
  
  currentEmp: EmployeeResponse = {
    id: 0,
    name: '',
    gender: '',
    dob: '',
    address: '',
    phoneNum: '',
    description: '',
    isActive: false
  }

  InputInvoiceModel: InputInvoiceRequest = {
    supId: 0,
    empId: 0,
    creationTime: '',
    updateTime: '',
    listInvoiceDetails: [],
  }

  detailColumns: EditableTableColumn[] = [
    { key: 'proId', label: 'Vật liệu', type: 'select', required: true, options: [] },
    { key: 'unitMeasure', label: 'Đơn vị', type: 'text', readonly: true },
    { key: 'price', label: 'Giá', type: 'number', readonly: true },
    { key: 'whId', label: 'Kho', type: 'select', required: true, options: [] },
    { key: 'quantity', label: 'Số lượng', type: 'number', required: true }
  ];
  constructor(
    @Inject(MODAL_DATA) public data: any,
    private modalService: ModalService,
    private productService: ProductService,
    private supplierService: SupplierService,
    private authService: AuthService,
    private warehouseService: WarehouseService,
    private inputInvoiceService: InputInvoiceService,
    private priceHistoryService: PriceHistoryService,
    private toast: ToastMessageService
  ) {
    this.checkDeviceType();
  }

  ngOnInit() {
    if(this.data && this.data.inputInvoice){
      this.inputInvoiceid = this.data.inputInvoice.id;
      this.isEditMode = this.inputInvoiceid !== 0;
    }
    this.loadProducts();
    this.loadSuppliers();
    this.loadWarehouses();
    this.getEmpByUsername();
  }

  loadProducts(){
    this.productService.getListActiveProducts().subscribe((response) => {
      this.productList = response;
      const productOptions = this.productList.map(p => ({ value: p.id, label: `${p.id} - ${p.name}` }));
      const proCol = this.detailColumns.find(c => c.key === 'proId');
      if (proCol) proCol.options = productOptions;
      this.tryPrefillFromData();
      });
  }
  loadWarehouses(){
    this.warehouseService.getListWarehouses().subscribe((response) => {
      this.warehouseList = response;
      const warehouseOptions = this.warehouseList.map(p => ({ value: p.id, label: `${p.id} - ${p.name}` }));
      const whCol = this.detailColumns.find(c => c.key === 'whId');
      if (whCol) whCol.options = warehouseOptions;
      this.tryPrefillFromData();
    })
  }
  loadSuppliers(){
    this.supplierService.getListActiveSuppliers().subscribe((response) => {
      this.suppList = response;
      this.tryPrefillFromData();
    })
  }

  onDetailsChanged(rows: any[]) {
    for (const row of rows) {
      const product = this.productList.find(p => p.id === Number(row.proId));
      (row as any).unitMeasure = product?.unitMeasure || '';

      const selectedProductId = Number((row as any).proId) || 0;
      if (selectedProductId && (row as any)._lastProId !== selectedProductId) {
        (row as any)._lastProId = selectedProductId;
        this.loadPriceForRow(row as any, selectedProductId);
      }
    }
    this.InputInvoiceModel.listInvoiceDetails = rows as any;
  }
  @HostListener('window:resize')
  onResize() {
    this.checkDeviceType();
  }

  getEmpByUsername(){
    return this.authService.getEmpByUsername(this.authService.getCurrentUser()?.username || '').subscribe((response) => {
      this.currentEmp = response
      this.InputInvoiceModel.empId = this.currentEmp.id;
    });
  }

  private checkDeviceType() {
    this.isMobile = window.innerWidth <= 768;
  }
  getCurrentVNTime(): string {
  const now = new Date();

  // offset của VN (GMT+7) theo mili giây
  const vnOffset = 7 * 60 * 60 * 1000;

  // giờ UTC + 7h
  const vnTime = new Date(now.getTime() + vnOffset - now.getTimezoneOffset() * 60000);

  const yyyy = vnTime.getFullYear();
  const MM = String(vnTime.getMonth() + 1).padStart(2, '0');
  const dd = String(vnTime.getDate()).padStart(2, '0');
  const HH = String(vnTime.getHours()).padStart(2, '0');
  const mm = String(vnTime.getMinutes()).padStart(2, '0');
  const ss = String(vnTime.getSeconds()).padStart(2, '0');

  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
}
  onSubmit(form : NgForm) {
    if (this.submitting) return;
    if (!form.valid) {
      this.error = 'Vui lòng điền đầy đủ thông tin hợp lệ.';
      return;
    }
    this.submitting = true;
    this.error = '';
    const now = this.getCurrentVNTime(); 
    const requestPayload: InputInvoiceRequest = {
      supId: this.InputInvoiceModel.supId,
      empId: this.InputInvoiceModel.empId,
      creationTime: this.data.inputInvoice ? this.data.inputInvoice.creationTime   : now,                                  // gán mới khi create
      updateTime: this.data.inputInvoice ? now : now,   
      listInvoiceDetails: (this.InputInvoiceModel.listInvoiceDetails || []).map(d => ({
        proId: Number((d as any).proId) || 0,
        whId: Number((d as any).whId) || 0,
        quantity: Number((d as any).quantity) || 0,
      }))
    };

    const obs = this.isEditMode && this.inputInvoiceid
      ? this.inputInvoiceService.updateInputInvoice(this.inputInvoiceid, requestPayload)
      : this.inputInvoiceService.createInputInvoice(requestPayload);

    obs.subscribe({
      next: (response) => {
        this.submitting = false;
        this.toast.showSuccess('Thành công',response.message);
        this.modalService.close();
        if (this.data && this.data.onSuccess) {
          this.data.onSuccess();
        }
      },
      error: (error) => {
        const err = error.error;
        if (err && typeof err === 'object') {
          const messages = Object.values(err).join('\n');
          this.toast.showError('Lỗi', messages);
        } else {
          this.toast.showError('Lỗi', 'Có lỗi xảy ra');
        }
        this.submitting = false;
      }
    });
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

  private tryPrefillFromData(): void {
    if (!this.isEditMode || !this.data?.inputInvoice) return;

    // Prefill header fields
    const inv = this.data.inputInvoice;
    if (this.suppList?.length) {
      const sup = this.suppList.find(s => s.name === inv.supName);
      if (sup) this.InputInvoiceModel.supId = sup.id as unknown as number;
    }

    // Prefill details when lists are available
    if (!this.productList?.length || !this.warehouseList?.length) return;
    if (Array.isArray(inv.listInvoiceDetails)) {
      this.InputInvoiceModel.listInvoiceDetails = inv.listInvoiceDetails.map((d: any) => {
        const product = this.productList.find(p => p.name === d.productName);
        const warehouse = this.warehouseList.find(w => w.name === d.warehouseName);
        const mapped: any = {
          proId: product?.id || 0,
          unitMeasure: d.unitMeasure,
          whId: warehouse?.id || 0,
          quantity: d.quantity,
          price: 0
        };
        if (mapped.proId) {
          this.loadPriceForRow(mapped, Number(mapped.proId));
        }
        return mapped as any;
      });
    }
  }

  private loadPriceForRow(row: any, productId: number): void {
    this.priceHistoryService.getCurrentInputPriceByProductId(productId).subscribe({
      next: (resp: any) => {
        const priceValue = typeof resp === 'object' && resp !== null && 'price' in resp ? (resp as any).price: resp;
        row.price = Number(priceValue) || 0;
      },
      error: () => {
        row.price = 0;
      }
    });
  }

}
