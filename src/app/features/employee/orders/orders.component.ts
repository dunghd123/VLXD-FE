import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="orders-page">
      <h2>Xử lý đơn hàng</h2>
      <div class="filters">
        <select class="filter-select">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <input type="date" class="filter-date" placeholder="Từ ngày">
        <input type="date" class="filter-date" placeholder="Đến ngày">
        <button class="btn-filter">Lọc</button>
      </div>
      
      <div class="orders-table">
        <table>
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#ORD001</td>
              <td>Nguyễn Văn B</td>
              <td>2024-01-15</td>
              <td>1,500,000 VNĐ</td>
              <td><span class="badge pending">Chờ xử lý</span></td>
              <td>
                <button class="btn-view">Xem chi tiết</button>
                <button class="btn-process">Xử lý</button>
              </td>
            </tr>
            <tr>
              <td>#ORD002</td>
              <td>Trần Thị C</td>
              <td>2024-01-14</td>
              <td>2,300,000 VNĐ</td>
              <td><span class="badge processing">Đang xử lý</span></td>
              <td>
                <button class="btn-view">Xem chi tiết</button>
                <button class="btn-complete">Hoàn thành</button>
              </td>
            </tr>
            <tr>
              <td>#ORD003</td>
              <td>Lê Văn D</td>
              <td>2024-01-13</td>
              <td>800,000 VNĐ</td>
              <td><span class="badge completed">Hoàn thành</span></td>
              <td>
                <button class="btn-view">Xem chi tiết</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .orders-page {
      padding: 2rem;
    }
    
    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: center;
    }
    
    .filter-select,
    .filter-date {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .btn-filter {
      background: #27ae60;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .orders-table table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .orders-table th,
    .orders-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    
    .orders-table th {
      background: #f8f9fa;
      font-weight: 600;
    }
    
    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .badge.pending {
      background: #f39c12;
      color: white;
    }
    
    .badge.processing {
      background: #3498db;
      color: white;
    }
    
    .badge.completed {
      background: #27ae60;
      color: white;
    }
    
    .badge.cancelled {
      background: #e74c3c;
      color: white;
    }
    
    .btn-view,
    .btn-process,
    .btn-complete {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 0.5rem;
    }
    
    .btn-view {
      background: #3498db;
      color: white;
    }
    
    .btn-process {
      background: #f39c12;
      color: white;
    }
    
    .btn-complete {
      background: #27ae60;
      color: white;
    }
  `]
})
export class OrdersComponent {}
