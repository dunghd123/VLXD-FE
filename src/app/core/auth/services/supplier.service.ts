import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ManagerSupplierResponse, CreateSupplierRequest, UpdateSupplierRequest } from '../../../features/manager/suppliers/suppliers.model';
import { AuthService } from './auth.service';
import { PagedResponse } from '../../../shared/models/pagnition.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private supplierUrl = 'http://localhost:8081/api/v1/supplier';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // ================= SUPPLIERS ==================
  getAllSuppliers(page: number, size: number): Observable<PagedResponse<ManagerSupplierResponse>> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.get<PagedResponse<ManagerSupplierResponse>>(`${this.supplierUrl}/getAllSupplier?page=${page}&size=${size}`)
    );
  }

  createSupplier(payload: CreateSupplierRequest): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.post(`${this.supplierUrl}/add-supplier`, payload)
    );
  }

  updateSupplier(id: number, payload: UpdateSupplierRequest): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.put(`${this.supplierUrl}/update-supplier/${id}`, payload)
    );
  }

  deleteSupplier(id: number): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.delete(`${this.supplierUrl}/delete-supplier/${id}`)
    );
  }
}
