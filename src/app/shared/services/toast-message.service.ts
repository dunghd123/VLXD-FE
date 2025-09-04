import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastMessage, ToastConfig } from '../models/toast-message.model';

@Injectable({
  providedIn: 'root'
})
export class ToastMessageService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$: Observable<ToastMessage[]> = this.toastsSubject.asObservable();

  private defaultConfig: ToastConfig = {
    duration: 3000,
    position: 'top-right',
    maxToasts: 5
  };

  constructor() { }

  /**
   * Hiển thị thông báo thành công
   */
  showSuccess(title: string, message: string, config?: ToastConfig): void {
    this.showToast({
      title,
      message,
      type: 'success',
      ...this.mergeConfig(config)
    });
  }

  /**
   * Hiển thị thông báo lỗi
   */
  showError(title: string, message: string, config?: ToastConfig): void {
    this.showToast({
      title,
      message,
      type: 'error',
      ...this.mergeConfig(config)
    });
  } 

  showWarning(title: string, message: string, config?: ToastConfig): void {
    this.showToast({
      title,
      message,
      type: 'warning',
      ...this.mergeConfig(config)
    });
  }

  showInfo(title: string, message: string, config?: ToastConfig): void {
    this.showToast({
      title,
      message,
      type: 'info',
      ...this.mergeConfig(config)
    });
  }

  showToast(toast: ToastMessage): void {
    const currentToasts = this.toastsSubject.value;
    const newToast: ToastMessage = {
      id: this.generateId(),
      duration: 3000,
      position: 'top-right',
      ...toast
    };

    // Thêm toast mới vào đầu mảng
    const updatedToasts = [newToast, ...currentToasts];

    // Giới hạn số lượng toast hiển thị
    const maxToasts = this.defaultConfig.maxToasts || 5;
    if (updatedToasts.length > maxToasts) {
      updatedToasts.splice(maxToasts);
    }

    this.toastsSubject.next(updatedToasts);

    // Tự động xóa toast sau thời gian duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(newToast.id!);
      }, newToast.duration);
    }
  }

  /**
   * Xóa toast theo ID
   */
  removeToast(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Xóa tất cả toast
   */
  clearAll(): void {
    this.toastsSubject.next([]);
  }

  /**
   * Tạo ID duy nhất cho toast
   */
  private generateId(): string {
    return 'toast_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Merge config với default config
   */
  private mergeConfig(config?: ToastConfig): Partial<ToastMessage> {
    return {
      duration: config?.duration || this.defaultConfig.duration,
      position: config?.position || this.defaultConfig.position
    };
  }

  /**
   * Cập nhật cấu hình mặc định
   */
  updateDefaultConfig(config: Partial<ToastConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }
}
