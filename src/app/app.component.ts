import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <router-outlet />

    <!-- Global Notification Toast -->
    @if (notificationService.notification(); as notif) {
      <div class="fixed top-6 right-6 z-[100] animate-slide-in-right">
        <div 
          class="flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl"
          [class]="notif.type === 'success' 
            ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900' 
            : notif.type === 'error'
            ? 'bg-rose-50/95 border-rose-200 text-rose-900'
            : 'bg-blue-50/95 border-blue-200 text-blue-900'">
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            [class]="notif.type === 'success' 
              ? 'bg-emerald-500' 
              : notif.type === 'error'
              ? 'bg-rose-500'
              : 'bg-blue-500'">
            @if (notif.type === 'success') {
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            } @else if (notif.type === 'error') {
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            } @else {
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          </div>
          <span class="font-medium text-sm">{{ notif.message }}</span>
        </div>
      </div>
    }
  `
})
export class AppComponent {
  notificationService = inject(NotificationService);
}
