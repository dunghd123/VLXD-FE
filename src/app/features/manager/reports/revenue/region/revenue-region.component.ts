import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { FilterService } from '../../../../../core/auth/services/filter.service';
import { ReportService } from '../../../../../core/auth/services/report.service';
import { Subscription } from 'rxjs';
import { SalesRegionResponse, Summary } from '../../reports.model';

@Component({
  selector: 'app-revenue-region',
  standalone: true,
  imports: [CommonModule, CanvasJSAngularChartsModule],
  templateUrl: './revenue-region.component.html',
  styleUrls: ['./revenue-region.component.css']
})
export class RevenueRegionComponent implements OnInit, OnDestroy {
  private filterSubscription: Subscription = new Subscription();
  private regionchart: any;
  regionSummary: Summary = {
      totalRevenue: 0,
      recordCount: 0
  };
    regionDetails: SalesRegionResponse[] = [];
    regionChartOptions: any = {
      animationEnabled: true,
      title: {
        text: "Doanh thu theo miền"
      },
      axisX: {
        title: "Miền",
      },
      axisY: {
        title: "Doanh thu (VND)"
      },
      data: [{
        type: "pie",
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
    onRegionChartInit(chart: any) {
      this.regionchart = chart;
    }
  
    ngOnDestroy(): void {
      this.filterSubscription.unsubscribe();
    }
  
    loadAllRevenue() {
      const filterToUse = this.filterService.getCurrentFilter();
      let year= filterToUse.year ?? 0;
  
      this.loadRegionRevenue(year);
    }
    loadRegionRevenue(year: number) {
      this.reportService.loadRegionRevenue(year).subscribe(res => {
          this.regionSummary = res.summary;
          this.regionDetails = res.details;
          const newDataPoints = this.regionDetails.map(m => ({ label: m.region, y: m.totalAmount }));
          const newOptions = {
            ...this.regionChartOptions,
            data: [{ type: "pie", dataPoints: newDataPoints }]
          };
          this.regionChartOptions = newOptions;
          if (this.regionchart) {
            this.regionchart.options = newOptions;
            this.regionchart.render();
          }
      });
    }
}


