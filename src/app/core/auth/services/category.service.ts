import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { PagedResponse } from '../../../shared/models/pagnition.model';
import { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '../../../features/manager/categories/categories.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoryUrl = 'http://localhost:8081/api/v1/category';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllCategories(page: number, size: number): Observable<PagedResponse<CategoryResponse>> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.get<PagedResponse<CategoryResponse>>(`${this.categoryUrl}/getAllCategory?page=${page}&size=${size}`)
    );
  }

  createCategory(payload: CreateCategoryRequest): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.post(`${this.categoryUrl}/add-category`, payload)
    );
  }

  updateCategory(id: number, payload: UpdateCategoryRequest): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.put(`${this.categoryUrl}/update-category/${id}`, payload)
    );
  }

  deleteCategory(id: number): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.delete(`${this.categoryUrl}/delete-category/${id}`)
    );
  }
}
