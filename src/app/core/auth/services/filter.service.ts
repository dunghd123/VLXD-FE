import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FilterRequest } from '../../../features/manager/reports/reports.model';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filterSubject = new BehaviorSubject<FilterRequest>({
    startDate: '',
    endDate: '',
    typeReport: ''
  });

  constructor() {
    
  }

  getFilter(): Observable<FilterRequest> {
    return this.filterSubject.asObservable();
  }
  setDefaultFilter(): void {
    const today = new Date();

  const firstDayOfYear = new Date(today.getFullYear(), 0, 1, 0, 0, 0);
  const lastDayOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59);

  const startDate = firstDayOfYear
    .toLocaleString('sv-SE')  
    .replace('T', ' ');
  const endDate = lastDayOfYear
    .toLocaleString('sv-SE')
    .replace('T', ' ');

  this.filterSubject.next({
    startDate,
    endDate,
    typeReport: ''
  });
  }

  getCurrentFilter(): FilterRequest {
    return this.filterSubject.value;
  }


  updateFilter(filter: FilterRequest): void {
    this.filterSubject.next(filter);
  }

  resetFilter(): void {
    this.filterSubject.next({
      startDate: '',
      endDate: '',
      typeReport: ''
    });
  }
}
