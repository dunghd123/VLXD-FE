import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../core/auth/services/product.service';
import { ProductResponse } from '../products/products.model';
import { ManagerCustomerResponse } from '../customers/customers.model';
import { EmployeeResponse } from '../users/user.model';
import { FilterRequest, Item } from './reports.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-manager-reports',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    FormsModule, 
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  filter: FilterRequest = {
    startDate: '',
    endDate: '',
    productIds: [],
    customerIds: [],
    employeeIds: []
  };

  products: ProductResponse[] = [];
  customers: ManagerCustomerResponse[] = [];
  employees: EmployeeResponse[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
    // TODO: replace with real services when available
    this.customers = [];
    this.employees = [];
  }

  loadProducts(): void {
    this.productService.getListActiveProducts().subscribe({
      next: (res) => (this.products = res),
      error: () => (this.products = [])
    });
  }


  // dữ liệu demo - thực tế sẽ load từ API service
  productList: Item[] = [
    { id: 1, name: 'Xi măng' },
    { id: 2, name: 'Thép' },
    { id: 3, name: 'Gạch' }
  ];

  customerList: Item[] = [
    { id: 101, name: 'Công ty A' },
    { id: 102, name: 'Công ty B' },
    { id: 103, name: 'Công ty C' }
  ];

  employeeList: Item[] = [
    { id: 201, name: 'Nguyễn Văn A' },
    { id: 202, name: 'Trần Thị B' },
    { id: 203, name: 'Lê Văn C' }
  ];

  applyFilter() {
    console.log('Bộ lọc gửi BE:', this.filter);
    // TODO: gọi service API
    // this.reportService.getReport(this.filter).subscribe(...)
  }

  resetFilter() {
    this.filter = {
      startDate: '',
      endDate: '',
      productIds: [],
      customerIds: [],
      employeeIds: []
    };
  }

  onSubmit(): void {
    // TODO: dispatch filter to child routes via service/store or query params
    console.log('Reports filter submit:', this.filter);
  }
}
