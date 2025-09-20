import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/auth/services/product.service';
import { ProductResponse } from '../../products/products.model';
import { ManagerCustomerResponse } from '../../customers/customers.model';
import { EmployeeResponse } from '../../users/user.model';

@Component({
  selector: 'app-reports-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class ReportsInputComponent implements OnInit {
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

  onSubmit(): void {
    // TODO: call API with this.filter
    // Placeholder: log filter
    console.log('Filter submit (INPUT report):', this.filter);
  }
}


