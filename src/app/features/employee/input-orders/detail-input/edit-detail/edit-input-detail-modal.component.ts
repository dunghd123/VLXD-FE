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

  id: number =0;
  productList: ProductResponse[] = [];
  suppList: ManagerSupplierResponse[] = [];
  warehouseList: Warehouse[] = [];
  
  EmpResponse: EmployeeResponse = {
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
    listInvoiceDetails: [],
  }
  inputInvoiceDetailModel: InputInvoiceDetailRequest = {
    proId: 0,
    whId: 0,
    quantity: 0
  }
  // Config for reusable editable table
  detailColumns: EditableTableColumn[] = [
    { key: 'proId', label: 'Vật liệu', type: 'select', required: true, options: [] },
    { key: 'unitMeasure', label: 'Đơn vị', type: 'text', readonly: true },
    { key: 'whId', label: 'Kho', type: 'select', required: true, options: [] },
    { key: 'quantity', label: 'Số lượng', type: 'number', required: true }
  ];
  constructor(
    @Inject(MODAL_DATA) public data: any,
    private modalService: ModalService,
    private productService: ProductService,
    private supplierService: SupplierService,
    private authService: AuthService,
    private warehouseService: WarehouseService
  ) {
    this.checkDeviceType();
  }

  ngOnInit() {
    if(this.data && this.data.inputInvoice){
      this.id = this.data.inputInvoice.id;
    }
    this.productService.getListActiveProducts().subscribe((response) => {
      this.productList = response;
      // map to options for table select
      const productOptions = this.productList.map(p => ({ value: p.id, label: `${p.id} - ${p.name}` }));
      const proCol = this.detailColumns.find(c => c.key === 'proId');
      if (proCol) proCol.options = productOptions;
    });
    this.warehouseService.getListWarehouses().subscribe((response) => {
      this.warehouseList = response;
      // map to options for table select
      const warehouseOptions = this.warehouseList.map(p => ({ value: p.id, label: `${p.id} - ${p.name}` }));
      const whCol = this.detailColumns.find(c => c.key === 'whId');
      if (whCol) whCol.options = warehouseOptions;
    })
    this.supplierService.getListActiveSuppliers().subscribe((response) => {
      this.suppList = response;
    })
    this.getEmpByUsername();
    this.InputInvoiceModel.empId = this.EmpResponse.id;
  }



  onDetailsChanged(rows: any[]) {
    // Sync back to model
    for (const row of rows) {
      const product = this.productList.find(p => p.id === Number(row.proId));
      (row as any).unitMeasure = product?.unitMeasure || '';
    }
    this.InputInvoiceModel.listInvoiceDetails = rows as any;
  }
  @HostListener('window:resize')
  onResize() {
    this.checkDeviceType();
  }

  getEmpByUsername(){
    return this.authService.getEmpByUsername(this.authService.getCurrentUser()?.username || '').subscribe((response) => {
      this.EmpResponse = response
    });
  }

  private checkDeviceType() {
    this.isMobile = window.innerWidth <= 768;
  }
  onSubmit(form : NgForm) {
    if (this.submitting) return;
    if (!form.valid) {
      this.error = 'Vui lòng điền đầy đủ thông tin hợp lệ.';
      return;
    }
    this.submitting = true;
    this.error = '';
    console.log(this.InputInvoiceModel.listInvoiceDetails);
    
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
