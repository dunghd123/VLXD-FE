import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-output-orders',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="output-orders-page"><h2>Xuất hàng</h2><p>Component đang được phát triển...</p></div>`,
  styles: [`.output-orders-page { padding: 2rem; }`]
})
export class OutputOrdersComponent {}
