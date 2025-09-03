import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-customers',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="employee-customers-page"><h2>Xem khách hàng</h2><p>Component đang được phát triển...</p></div>`,
  styles: [`.employee-customers-page { padding: 2rem; }`]
})
export class CustomersComponent {}
