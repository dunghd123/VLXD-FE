import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-products',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="employee-products-page"><h2>Xem sản phẩm</h2><p>Component đang được phát triển...</p></div>`,
  styles: [`.employee-products-page { padding: 2rem; }`]
})
export class ProductsComponent {}
