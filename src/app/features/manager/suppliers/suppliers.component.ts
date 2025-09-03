import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-suppliers',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="manager-suppliers-page"><h2>Quản lý nhà cung cấp</h2><p>Component đang được phát triển...</p></div>`,
  styles: [`.manager-suppliers-page { padding: 2rem; }`]
})
export class SuppliersComponent {}
