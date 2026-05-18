import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  message: string;
  type: NotificationType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSignal = signal<Notification | null>(null);
  notification = this.notificationSignal.asReadonly();

  show(message: string, type: NotificationType = 'success'): void {
    this.notificationSignal.set({ message, type });
    setTimeout(() => this.notificationSignal.set(null), 3500);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }
}
