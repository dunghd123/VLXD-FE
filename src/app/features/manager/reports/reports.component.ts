import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-reports',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="manager-reports-page"><h2>Báo cáo thống kê</h2><p>Component đang được phát triển...</p></div>`,
  styles: [`.manager-reports-page { padding: 2rem; }`]
})
export class ReportsComponent {}
