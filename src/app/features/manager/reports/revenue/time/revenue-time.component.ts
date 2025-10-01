import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterService } from '../../../../../core/auth/services/filter.service';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { Subscription } from 'rxjs';
import { SalesMonthResponse, SalesQuarterResponse, Summary } from '../../reports.model';
import { ReportService } from '../../../../../core/auth/services/report.service';

@Component({
  selector: 'app-revenue-time',
  standalone: true,
  imports: [CommonModule, CanvasJSAngularChartsModule],
  templateUrl: './revenue-time.component.html',
  styleUrls: ['./revenue-time.component.css']
})
export class RevenueTimeComponent implements OnInit, OnDestroy {
  private filterSubscription: Subscription = new Subscription();
  private monthchart: any;
  private quarterchart: any;
  monthSummary: Summary = {
      totalRevenue: 0,
      recordCount: 0
  };
  monthDetails: SalesMonthResponse[] = [];
  monthlyChartOptions: any = {
    animationEnabled: true,
    title: {
      text: "Doanh thu theo tháng"
    },
    axisX: {
      title: "Tháng",
      interval: 1,
      minimum: 0,
      maximum: 12,
      valueFormatString: "."
    },
    axisY: {
      title: "Doanh thu (VND)"
    },
    data: [{
      type: "line",
      dataPoints: []
    }]
  };
  quarterSummary: Summary = {
      totalRevenue: 0,
      recordCount: 0
  };
  quarterDetails: SalesQuarterResponse[] = [];
  quarterChartOptions: any = {
    animationEnabled: true,
    title: {
      text: "Doanh thu theo quý"
    },
    axisX: {
      title: "quý"
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
    private filterService: FilterService,
    private reportService: ReportService
  ) {};

  ngOnInit(): void {
    this.filterSubscription = this.filterService.getFilter().subscribe(filter => {
      this.loadAllRevenue();
    });
  }
  onMonthChartInit(chart: any) {
    this.monthchart = chart;
  }
  onQuarterChartInit(chart: any) {
    this.quarterchart = chart;
  }

  ngOnDestroy(): void {
    this.filterSubscription.unsubscribe();
  }

  loadAllRevenue() {
    const filterToUse = this.filterService.getCurrentFilter();
    let year= filterToUse.year ?? 0;

    this.loadMonthlyRevenue(year);
    this.loadQuarterRevenue(year);
  }
  loadMonthlyRevenue(year: number) {
    this.reportService.loadMonthlyRevenue(year).subscribe(res => {
        this.monthSummary = res.summary;
        this.monthDetails = res.details;
        const newDataPoints = this.monthDetails.map(m => ({ label: m.month, y: m.totalAmount }));
        const newOptions = {
          ...this.monthlyChartOptions,
          data: [{ type: "line", dataPoints: newDataPoints }]
        };
        this.monthlyChartOptions = newOptions;
        if (this.monthchart) {
          this.monthchart.options = newOptions;
          this.monthchart.render();
        }
    });
  }
  loadQuarterRevenue(year:number){
    this.reportService.loadQuarterRevenue(year).subscribe(res => {
        this.quarterSummary = res.summary;
        this.quarterDetails = res.details;
        const newDataPoints = this.quarterDetails.map(m => ({ label: m.quarter, y: m.totalAmount }));
        const newOptions = {
          ...this.quarterChartOptions,
          data: [{ type: "column", dataPoints: newDataPoints }]
        };
        this.quarterChartOptions = newOptions;
        if (this.quarterchart) {
          this.quarterchart.options = newOptions;
          this.quarterchart.render();
        }
    });
  }
}


