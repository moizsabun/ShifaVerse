import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';

@Component({
  selector: 'app-doctor-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen flex bg-slate-900">
      <!-- Dark Sidebar -->
      <aside class="w-72 bg-slate-950 border-r border-slate-800 flex flex-col flex-shrink-0">
        <!-- Logo -->
        <div class="p-6 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h2 class="font-display text-xl font-bold text-white">MediCare+</h2>
              <p class="text-xs text-emerald-400 font-medium">Doctor Portal</p>
            </div>
          </div>
        </div>

        <!-- Doctor Profile -->
        <div class="p-4 border-b border-slate-800">
          <div class="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl p-4 border border-emerald-500/30">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-ring"></div>
              <span class="text-xs font-semibold text-emerald-300">Dr. Sarah Mitchell</span>
            </div>
            <p class="text-xs text-slate-300">General Physician</p>
            <p class="text-xs text-slate-500 mt-1 font-mono">MED-2024-8847</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-1">
          <a routerLink="/doctor/dashboard" routerLinkActive="active-link" class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Dashboard</span>
          </a>

          <a routerLink="/doctor/queue" routerLinkActive="active-link" class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="flex-1">Today's Queue</span>
            <span class="nav-badge">{{ queueCount() }}</span>
          </a>

          <a routerLink="/doctor/history" routerLinkActive="active-link" class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Past Visits</span>
          </a>

          <a routerLink="/doctor/patients" routerLinkActive="active-link" class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>All Patients</span>
          </a>
        </nav>

        <div class="p-4 border-t border-slate-800">
          <button (click)="logout()"
                  class="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto scrollbar-thin bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
        <div class="p-8 max-w-7xl mx-auto">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      color: #94a3b8;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
      cursor: pointer;
      text-decoration: none;
    }
    .nav-link:hover {
      background: #1e293b;
      color: white;
    }
    .nav-link.active-link {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
    }
    .nav-link.active-link .nav-badge {
      background: rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
    }
    .nav-badge {
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background: rgba(148, 163, 184, 0.2);
      color: #cbd5e1;
    }
  `]
})
export class DoctorLayoutComponent {
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);

  queueCount = computed(() => 
    this.appointmentService.todayAppointments().filter(a => a.status === 'pending').length
  );

  logout(): void {
    this.router.navigate(['/login']);
  }
}
