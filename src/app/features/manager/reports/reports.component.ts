import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterService } from '../../../core/auth/services/filter.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { FilterRequest } from './reports.model';

@Component({
  selector: 'app-manager-reports',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    FormsModule, 
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  filter: FilterRequest = {
      startDate: '',
      endDate: '',
      typeReport: '',
      year: 0
    };
  startDateInput: string = '';
  endDateInput: string = '';
  yearInput: number = 0;
  activeTab: 'TOTAL' | 'TIME' | 'REGION' = 'TOTAL';

  constructor(
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.filter = this.filterService.getCurrentFilter();
    this.filterService.getActiveTab().subscribe(tab => {
      this.activeTab = tab;
    });
  }
  onSubmit(): void {
    this.applyFilter();
  }
  applyFilter() {
    if (this.activeTab === 'TOTAL' && (!this.startDateInput || !this.endDateInput)) {
      alert('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc');
      return;
    }
    const startDate = new Date(this.startDateInput);
    const endDate = new Date(this.endDateInput);
    if (startDate > endDate) {
      alert('Ngày bắt đầu không được lớn hơn ngày kết thúc');
      return;
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const newFilter: FilterRequest = {
      ...this.filter,
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
      year: this.yearInput !== 0 ? this.yearInput : this.filter.year,
    };
    this.filterService.updateFilter(newFilter);
    this.filter = newFilter; 
  }

  resetFilter() {
    this.filterService.resetFilter();
    this.startDateInput = '';
    this.endDateInput = '';
    this.yearInput = 0;
  }


  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
