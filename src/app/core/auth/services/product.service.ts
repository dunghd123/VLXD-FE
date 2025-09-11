import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { PagedResponse } from '../../../shared/models/pagnition.model';
import { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '../../../features/manager/categories/categories.model';
import { CreateProductRequest, ProductResponse, UpdateProductRequest } from '../../../features/manager/products/products.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productUrl = 'http://localhost:8081/api/v1/product';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllProducts(page: number, size: number): Observable<PagedResponse<ProductResponse>> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.get<PagedResponse<ProductResponse>>(`${this.productUrl}/getAllProduct?page=${page}&size=${size}`)
    );
  }

  createProduct(payload: CreateProductRequest): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.post(`${this.productUrl}/add-new-customer`, payload)
    );
  }

  updateProduct(id: number, payload: UpdateProductRequest): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.put(`${this.productUrl}/update-customer/${id}`, payload)
    );
  }

  deleteProduct(id: number): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.delete(`${this.productUrl}/delete-customer/${id}`)
    );
  }
}
