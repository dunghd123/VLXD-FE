import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterRequest, SalesEmployeeResponse, SalesCustomerResponse, SalesProductResponse, Summary } from '../reports.model';
import { ReportService } from '../../../../core/auth/services/report.service';
import { FilterService } from '../../../../core/auth/services/filter.service';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-reports-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule, CanvasJSAngularChartsModule],
  templateUrl: './revenue.component.html',
  styleUrls: ['./revenue.component.css']
})
export class ReportsRevenueComponent implements OnInit, OnDestroy {
  private filterSubscription: Subscription = new Subscription();

  employeeSummary: Summary = {
    totalRevenue: 0,
    recordCount: 0
  };
  employeeDetails: SalesEmployeeResponse[] = [];
  customerSummary: Summary = {
    totalRevenue: 0,
    recordCount: 0
  };
  customerDetails: SalesCustomerResponse[] = [];
  productSummary: Summary = {
    totalRevenue: 0,
    recordCount: 0
  };
  productDetails: SalesProductResponse[] = [];

  chartOptions: any = {
    animationEnabled: true,
    title: {
      text: "Doanh thu theo nhân viên"
    },
    axisX: {
      title: "Nhân viên"
    },
    axisY: {
      title: "Doanh thu (VND)"
    },
    data: [{
      type: "column",
      dataPoints: []
    }]
  };

  customerChartOptions: any = {
    animationEnabled: true,
    title: {
      text: "Doanh thu theo khách hàng"
    },
    axisX: {
      title: "Khách hàng"
    },
    axisY: {
      title: "Doanh thu (VND)"
    },
    data: [{
      type: "column",
      dataPoints: []
    }]
  };

  productChartOptions: any = {
    animationEnabled: true,
    title: {
      text: "Doanh thu theo sản phẩm"
    },
    axisX: {
      title: "Sản phẩm"
    },
    axisY: {
      title: "Doanh thu (VND)"
    },
    data: [{
      type: "column",
      dataPoints: []
    }]
  };

  constructor(
    private reportService: ReportService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.filterSubscription = this.filterService.getFilter().subscribe(filter => {
      this.loadAllRevenue();
    });
    
    const currentFilter = this.filterService.getCurrentFilter();
    if (currentFilter.startDate && currentFilter.endDate) {
      this.loadAllRevenue();
    }
  }

  ngOnDestroy(): void {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  loadAllRevenue() {
    const filterToUse = { ...this.filterService.getCurrentFilter() };
     if (!filterToUse.startDate || !filterToUse.endDate) {
      const today = new Date();
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1, 0, 0, 0);
      const lastDayOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59);

      filterToUse.startDate = this.formatLocalDateTime(firstDayOfYear);
      filterToUse.endDate = this.formatLocalDateTime(lastDayOfYear);
    }

    this.loadRevenueByEmployee(filterToUse.startDate, filterToUse.endDate);
    this.loadRevenueByCustomer(filterToUse.startDate, filterToUse.endDate);
    this.loadRevenueProduct(filterToUse.startDate, filterToUse.endDate);
  }
  private formatLocalDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  loadRevenueByEmployee(startDate: string, endDate: string) {
    const filter = { 
      startDate, 
      endDate, 
      typeReport: 'EMPLOYEE'
    };

    this.reportService.loadRevenueByEmployee(filter)
      .subscribe(res => {
        this.employeeSummary = res.summary;
        this.employeeDetails = res.details;
        this.chartOptions = {
          ...this.chartOptions,
          data: [{
            type: "column",
            dataPoints: this.employeeDetails.map(e => ({
              label: e.empName, 
              y: e.totalAmount           
            }))
          }]
        };
      });
  }

  loadRevenueByCustomer(startDate: string, endDate: string) {
    const filter = { 
      startDate, 
      endDate, 
      typeReport: 'CUSTOMER'
    };
    this.reportService.loadRevenueByCustomer(filter)
      .subscribe(res => {
        this.customerSummary = res.summary;
        this.customerDetails = res.details;
        this.customerChartOptions = {
          ...this.customerChartOptions,
          data: [{
            type: "column",
            dataPoints: this.customerDetails.map(c => ({
              label: c.cusName, 
              y: c.totalAmount           
            }))
          }]
        };
    });  
  }

  loadRevenueProduct(startDate: string, endDate: string) {
    const filter = { 
      startDate, 
      endDate, 
      typeReport: 'PRODUCT'
    };
    this.reportService.loadRevenueProduct(filter)
      .subscribe(res => {
        this.productSummary = res.summary;
        this.productDetails = res.details;
        this.productChartOptions = {
          ...this.productChartOptions,
          data: [{
            type: "column",
            dataPoints: this.productDetails.map(p => ({
              label: p.proName, 
              y: p.totalAmount           
            }))
          }]
        };
      });
  }
}


