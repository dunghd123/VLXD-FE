import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { PriceFilterRequest, PriceResponse, PriceFilterResponse } from '../../../features/manager/product-price-history/price-history.model';
import { PagedResponse } from '../../../shared/models/pagnition.model';

@Injectable({
  providedIn: 'root'
})
export class PriceHistoryService {
  private priceUrl = 'http://localhost:8081/api/v1/price-history';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getPriceHistory(filter: PriceFilterRequest): Observable<PagedResponse<PriceResponse>> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) {
      throw new Error('Access denied');
    }

    let params = new HttpParams()
      .set('page', filter.pageFilter.toString())
      .set('size', filter.sizeFilter.toString());

    if (filter.invoiceTypeFilter) {
      params = params.set('invoiceType', filter.invoiceTypeFilter);
    }
    if (filter.productNameFilter) {
      params = params.set('productName', filter.productNameFilter);
    }
    if (filter.startDateFilter) {
      params = params.set('startdate', filter.startDateFilter);
    }
    if (filter.endDateFilter) {
      params = params.set('enddate', filter.endDateFilter);
    }
    if(filter.priceTypeFilter){
      params = params.set('pricetype', filter.priceTypeFilter);
    }

    return this.authService.retryWithTokenRefresh(() =>
      this.http.get<PagedResponse<PriceResponse>>(`${this.priceUrl}/filter`, { params })
    );
  }

  getCurrentPrices(filter: PriceFilterRequest): Observable<PagedResponse<PriceResponse>> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) {
      throw new Error('Access denied');
    }

    let params = new HttpParams()
      .set('page', filter.pageFilter.toString())
      .set('size', filter.sizeFilter.toString());

    if (filter.invoiceTypeFilter) {
      params = params.set('invoiceType', filter.invoiceTypeFilter);
    }
    if (filter.productNameFilter) {
      params = params.set('productName', filter.productNameFilter);
    }
    if (filter.startDateFilter) {
      params = params.set('startdate', filter.startDateFilter);
    }
    if (filter.endDateFilter) {
      params = params.set('enddate', filter.endDateFilter);
    }
    if(filter.priceTypeFilter){
      params = params.set('pricetype', filter.priceTypeFilter);
    }
    return this.authService.retryWithTokenRefresh(() =>
      this.http.get<PagedResponse<PriceResponse>>(`${this.priceUrl}/filter`, { params })
    );
  }

  createPrice(price: Partial<PriceResponse>): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) {
      throw new Error('Access denied');
    }
    return this.authService.retryWithTokenRefresh(() =>
      this.http.post(`${this.priceUrl}/create`, price)
    );
  }

  updatePrice(id: number, price: Partial<PriceResponse>): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) {
      throw new Error('Access denied');
    }
    return this.authService.retryWithTokenRefresh(() =>
      this.http.put(`${this.priceUrl}/update/${id}`, price)
    );
  }

  deletePrice(id: number): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.authService.isManager()) {
      throw new Error('Access denied');
    }
    return this.authService.retryWithTokenRefresh(() =>
      this.http.delete(`${this.priceUrl}/delete/${id}`)
    );
  }
}
