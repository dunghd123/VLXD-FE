import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesEmployeeResponse, Summary, SalesCustomerResponse, SalesProductResponse } from '../../reports.model';
import { ReportService } from '../../../../../core/auth/services/report.service';
import { FilterService } from '../../../../../core/auth/services/filter.service';
import { Subscription } from 'rxjs';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

@Component({
  selector: 'app-revenue-total',
  standalone: true,
  imports: [CommonModule, CanvasJSAngularChartsModule],
  templateUrl: './revenue-total.component.html',
  styleUrls: ['./revenue-total.component.css']
})
export class RevenueTotalComponent {
  private filterSubscription: Subscription = new Subscription();
  private employeeChart: any;
  private customerChart: any;
  private productChart: any;
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

  employeeChartOptions: any = {
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
      title: "Doanh thu (VND)"
    },
    axisY: {
      title: "Khách hàng"
    },
    data: [{
      type: "bar",
      dataPoints: []
    }]
  };

  productChartOptions: any = {
    animationEnabled: true,
    title: {
      text: "Doanh thu theo sản phẩm"
    },
    axisX: {
      title: "Doanh thu (VND)"
    },
    axisY: {
      title: "Sản phẩm"
    },
    data: [{
      type: "bar",
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
  }
  onEmployeeChartInit(chart: any) {
    this.employeeChart = chart;
  }
  onCustomerChartInit(chart: any) {
    this.customerChart = chart;
  }
  onProductChartInit(chart: any) {
    this.productChart = chart;
  }

  ngOnDestroy(): void {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  loadAllRevenue() {
    const filterToUse = this.filterService.getCurrentFilter();
    let startDate = filterToUse.startDate ?? '';
    let endDate = filterToUse.endDate ?? '';
    this.loadRevenueByEmployee(startDate, endDate);
    this.loadRevenueByCustomer(startDate, endDate);
    this.loadRevenueProduct(startDate, endDate);
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
        const newDataPoints = this.employeeDetails.map(e => ({ label: e.empName, y: e.totalAmount }));
        const newOptions = { ...this.employeeChartOptions, data: [{ type: "column", dataPoints: newDataPoints }] };
        this.employeeChartOptions = newOptions;
        if (this.employeeChart) {
          this.employeeChart.options = newOptions;
          this.employeeChart.render();
        }
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
        const newDataPoints = this.customerDetails.map(c => ({ label: c.cusName, y: c.totalAmount }));
        const newOptions = { ...this.customerChartOptions, data: [{ type: "bar", dataPoints: newDataPoints }] };
        this.customerChartOptions = newOptions;
        if (this.customerChart) {
          this.customerChart.options = newOptions;
          this.customerChart.render();
        }
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
        const newDataPoints = this.productDetails.map(p => ({ label: p.proName, y: p.totalAmount }));
        const newOptions = { ...this.productChartOptions, data: [{ type: "bar", dataPoints: newDataPoints }] };
        this.productChartOptions = newOptions;
        if (this.productChart) {
          this.productChart.options = newOptions;
          this.productChart.render();
        }
      });
  }
}


