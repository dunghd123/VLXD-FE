import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { PagedResponse } from "../../../shared/models/pagnition.model";
import { Observable } from "rxjs";
import { OutputInvoiceFilter, OutputInvoiceRequest, OutputInvoiceResponse } from "../../../features/employee/output-orders/output-orders.model";

@Injectable({
  providedIn: 'root'
})
export class OutputInvoiceService {
  private outputUrl = 'http://localhost:8081/api/v1/output-invoice';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  loadOutputInvoicesByUser(filter: OutputInvoiceFilter): Observable<PagedResponse<OutputInvoiceResponse>> {
    if (!this.authService.isLoggedIn()) throw new Error('Access denied');
    let params = new HttpParams()
      .set('page', filter.pageFilter.toString())
      .set('size', filter.sizeFilter.toString());
    if (filter.cusNameFilter) {
      params = params.set('cusName', filter.cusNameFilter);
    }
    if (filter.statusFilter !== undefined && filter.statusFilter !== null) {
      params = params.set('status', filter.statusFilter);
    }
    return this.authService.retryWithTokenRefresh(() =>
      this.http.get<PagedResponse<OutputInvoiceResponse>>(`${this.outputUrl}/getAllOutputInvoiceByEmp/${this.authService.getCurrentUser()?.username}`, { params })
    );
  }
  loadPendingOutputInvoice(page: number, size: number): Observable<PagedResponse<OutputInvoiceResponse>> {
    if (!this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.get<PagedResponse<OutputInvoiceResponse>>(`${this.outputUrl}/getAllPendingOutputInvoiceByEmp?page=${page}&size=${size}`)
    );
  }
  aproveOutputInvoice(id: number): Observable<any> {
    if (!this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.put(`${this.outputUrl}/approve-output-invoice/${id}`, null)
    );
  }
  rejectOutputInvoice(id: number): Observable<any> {
    if (!this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.put(`${this.outputUrl}/reject-output-invoice/${id}`, null)
    );
  }
  completeOutputInvoice(id: number): Observable<any> {
    if (!this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.put(`${this.outputUrl}/complete-output-invoice/${id}`, null)
    );
  }

  createOutputInvoice(payload: OutputInvoiceRequest): Observable<any> {
    if (!this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.post(`${this.outputUrl}/add-output-invoice`, payload)
    );
  }

  updateOutputInvoice(id: number, payload: OutputInvoiceRequest): Observable<any> {
    if (!this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.put(`${this.outputUrl}/update-output-invoice/${id}`, payload)
    );
  }
}
