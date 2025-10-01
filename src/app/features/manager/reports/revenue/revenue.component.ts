import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { RevenueTotalComponent } from './total/revenue-total.component';
import { RevenueTimeComponent } from './time/revenue-time.component';
import { RevenueRegionComponent } from './region/revenue-region.component';

import { FilterService } from '../../../../core/auth/services/filter.service';


@Component({
  selector: 'app-reports-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule, CanvasJSAngularChartsModule, RevenueTotalComponent, RevenueTimeComponent, RevenueRegionComponent],
  templateUrl: './revenue.component.html',
  styleUrls: ['./revenue.component.css']
})
export class ReportsRevenueComponent implements OnInit {
  activeTab: 'TOTAL' | 'TIME' | 'REGION' = 'TOTAL';

  constructor(
    private filterService: FilterService,
  ) {}

  ngOnInit(): void {
    this.filterService.setActiveTab(this.activeTab);
  }
  switchTab(tab: 'TOTAL' | 'TIME' | 'REGION') {
    this.activeTab = tab;
    this.filterService.setActiveTab(tab);
  }

}


