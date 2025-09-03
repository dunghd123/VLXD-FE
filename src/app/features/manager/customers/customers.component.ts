import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-customers',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="manager-customers-page"><h2>Quản lý khách hàng</h2><p>Component đang được phát triển...</p></div>`,
  styles: [`.manager-customers-page { padding: 2rem; }`]
})
export class CustomersComponent {}
