import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ManagerCustomerResponse, CreateCustomerRequest, UpdateCustomerRequest } from '../../../features/manager/customers/customers.model';
import { AuthService } from './auth.service';
import { PagedResponse } from '../../../shared/models/pagnition.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customerUrl = 'http://localhost:8081/api/v1/customer';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllCustomers(page: number, size: number): Observable<PagedResponse<ManagerCustomerResponse>> {
    if (!this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.get<PagedResponse<ManagerCustomerResponse>>(`${this.customerUrl}/getAllCustomer?page=${page}&size=${size}`)
    );
  }

  createCustomer(payload: CreateCustomerRequest): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.post(`${this.customerUrl}/add-new-customer`, payload)
    );
  }

  updateCustomer(id: number, payload: UpdateCustomerRequest): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.put(`${this.customerUrl}/update-customer/${id}`, payload)
    );
  }

  deleteCustomer(id: number): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.delete(`${this.customerUrl}/delete-customer/${id}`)
    );
  }
  loadAllActiveCustomer(): Observable<ManagerCustomerResponse[]> {
    if (!this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.http.get<ManagerCustomerResponse[]>(`${this.customerUrl}/getAllActiveCustomer`);
  }
}
