import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-orders',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="manager-orders-page"><h2>Quản lý đơn hàng</h2><p>Component đang được phát triển...</p></div>`,
  styles: [`.manager-orders-page { padding: 2rem; }`]
})
export class OrdersComponent {}
