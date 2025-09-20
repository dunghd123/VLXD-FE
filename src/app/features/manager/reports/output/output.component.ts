import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/auth/services/product.service';
import { ProductResponse } from '../../products/products.model';
import { ManagerCustomerResponse } from '../../customers/customers.model';
import { EmployeeResponse } from '../../users/user.model';

@Component({
  selector: 'app-reports-output',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './output.component.html',
  styleUrls: ['./output.component.css']
})
export class ReportsOutputComponent implements OnInit {
  filter = {
    startDate: '2024-01-01 00:00:00',
    endDate: '2024-12-31 23:00:00',
    productIds: [] as number[],
    customerIds: [] as number[],
    employeeIds: [] as number[]
  };

  products: ProductResponse[] = [];
  customers: ManagerCustomerResponse[] = [];
  employees: EmployeeResponse[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.customers = [];
    this.employees = [];
  }

  loadProducts(): void {
    this.productService.getListActiveProducts().subscribe({
      next: (res) => (this.products = res),
      error: () => (this.products = [])
    });
  }

  onSubmit(): void {
    console.log('Filter submit (OUTPUT report):', this.filter);
  }
}


