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
    typeReport: '',
    year: 0
  });
  // Shared state for active tab in revenue reports
  private activeTabSubject = new BehaviorSubject<'TOTAL' | 'TIME' | 'REGION'>('TOTAL');

  constructor() {
    this.setDefaultFilter();
  }

  getFilter(): Observable<FilterRequest> {
    return this.filterSubject.asObservable();
  }
  getActiveTab(): Observable<'TOTAL' | 'TIME' | 'REGION'> {
    return this.activeTabSubject.asObservable();
  }
  private setDefaultFilter(): void {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1, 0, 0, 0);
    const lastDayOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59);

    const startDate = firstDayOfYear
      .toLocaleString('sv-SE')  
      .replace('T', ' ');
    const endDate = lastDayOfYear
      .toLocaleString('sv-SE')
      .replace('T', ' ');
    const year = today.getFullYear();

    this.filterSubject.next({
      startDate,
      endDate,
      typeReport: '',
      year: year
    });
  }

  getCurrentFilter(): FilterRequest {
    return this.filterSubject.value;
  }
  updateFilter(filter: FilterRequest): void {
    this.filterSubject.next(filter);
  }
  setActiveTab(tab: 'TOTAL' | 'TIME' | 'REGION'): void {
    this.activeTabSubject.next(tab);
  }

  resetFilter(): void {
    this.setDefaultFilter();
  }
}
