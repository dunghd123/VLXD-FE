import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { SalesQuarterResponse, 
        SaleReportResponse, 
        SalesEmployeeResponse, 
        SalesCustomerResponse, 
        SalesProductResponse, 
        FilterRequest, 
        SalesMonthResponse 
} from '../../../features/manager/reports/reports.model';
@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private reportUrl = 'http://localhost:8081/api/v1/sales-reports';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}
  loadRevenueByEmployee(filter: FilterRequest): Observable<SaleReportResponse<SalesEmployeeResponse>> {
    if(!this.authService.isManager() || !this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
         this.http.post<SaleReportResponse<SalesEmployeeResponse>>(`${this.reportUrl}/revenue-report`, filter)
    )};
  loadRevenueByCustomer(filter: FilterRequest): Observable<SaleReportResponse<SalesCustomerResponse>> {
    if(!this.authService.isManager() || !this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
        this.http.post<SaleReportResponse<SalesCustomerResponse>>(`${this.reportUrl}/revenue-report`, filter)
    )};
  loadRevenueProduct(filter: FilterRequest): Observable<SaleReportResponse<SalesProductResponse>> {
    if(!this.authService.isManager() || !this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
        this.http.post<SaleReportResponse<SalesProductResponse>>(`${this.reportUrl}/revenue-report`, filter)
    )};
  loadMonthlyRevenue(year: number): Observable<SaleReportResponse<SalesMonthResponse>> {
    if(!this.authService.isManager() || !this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
        this.http.post<SaleReportResponse<SalesMonthResponse>>(`${this.reportUrl}/revenue-report-by-month?year=${year}`, null)
    );
  }
  loadQuarterRevenue(year: number): Observable<SaleReportResponse<SalesQuarterResponse>> {
    if(!this.authService.isManager() || !this.authService.isLoggedIn()) throw new Error('Access denied');
    return this.authService.retryWithTokenRefresh(() =>
        this.http.post<SaleReportResponse<SalesQuarterResponse>>(`${this.reportUrl}/revenue-report-by-quarter?year=${year}`, null)
    );
  }
}
