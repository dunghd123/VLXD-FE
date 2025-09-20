import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { PagedResponse } from "../../../shared/models/pagnition.model";
import { InputInvoiceFilter, InputInvoiceResponse } from "../../../features/employee/input-orders/input-orders.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class InputInvoiceService {
  private inputUrl = 'http://localhost:8081/api/v1/input-invoice';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  loadInputInvoicesByUser(inputInvoiceFilter: InputInvoiceFilter): Observable<PagedResponse<InputInvoiceResponse>> {
    if (!this.authService.isLoggedIn()) throw new Error('Access denied');
    let params = new HttpParams()
      .set('page', inputInvoiceFilter.pageFilter.toString())
      .set('size', inputInvoiceFilter.sizeFilter.toString());
    if (inputInvoiceFilter.supNameFilter) {
      params = params.set('supName', inputInvoiceFilter.supNameFilter);
    }
    if (inputInvoiceFilter.statusFilter !== undefined && inputInvoiceFilter.statusFilter !== null) {
      params = params.set('status', inputInvoiceFilter.statusFilter);
    }
    return this.authService.retryWithTokenRefresh(() =>
      this.http.get<PagedResponse<InputInvoiceResponse>>(`${this.inputUrl}/getAllInputInvoiceByEmp/${this.authService.getCurrentUser()?.username}`, { params })
    );
  }

}
