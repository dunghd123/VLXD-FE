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

  createOutputInvoice(payload: OutputInvoiceRequest): Observable<any> {
    if (!this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.post(`${this.outputUrl}/add-input-invoice`, payload)
    );
  }

  updateOutputInvoice(id: number, payload: OutputInvoiceRequest): Observable<any> {
    if (!this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
      this.http.put(`${this.outputUrl}/update-input-invoice/${id}`, payload)
    );
  }
}
