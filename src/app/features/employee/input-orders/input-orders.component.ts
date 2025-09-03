import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input-orders',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="input-orders-page"><h2>Nhập hàng</h2><p>Component đang được phát triển...</p></div>`,
  styles: [`.input-orders-page { padding: 2rem; }`]
})
export class InputOrdersComponent {}
