import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Warehouse } from '../../../shared/models/warehouse.model';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private supplierUrl = 'http://localhost:8081/api/v1/warehouse';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}


  getListWarehouses(): Observable<Warehouse[]> {
    if (!this.authService.isLoggedIn() ) throw new Error('Access denied');
    return this.http.get<Warehouse[]>(`${this.supplierUrl}/getAllActiveWarehouse`);
  }
}
