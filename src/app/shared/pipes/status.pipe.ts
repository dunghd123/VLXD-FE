import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status',
  standalone: true
})
export class StatusPipe implements PipeTransform {
  transform(status: any): string {
    if (status === true || status === 'true' || status === 1 || status === '1') {
      return 'Đang hoạt động';
    } else if (status === false || status === 'false' || status === 0 || status === '0') {
      return 'Không hoạt động';
    } else {
      return 'Không xác định';
    }
  }
}
