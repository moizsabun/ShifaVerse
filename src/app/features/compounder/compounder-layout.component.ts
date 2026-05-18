import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AppointmentService } from '../../core/services/appointment.service';

@Component({
  selector: 'app-compounder-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen flex bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      
      <!-- Sidebar -->
      <aside class="w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        <!-- Logo -->
        <div class="p-6 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <div>
              <h2 class="font-display text-xl font-bold text-slate-900">MediCare+</h2>
              <p class="text-xs text-slate-500 font-medium">Compounder Portal</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-1">
          
          <a routerLink="/compounder/dashboard" routerLinkActive="active-link"
             class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Dashboard</span>
          </a>

          <a routerLink="/compounder/users" routerLinkActive="active-link"
             class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="flex-1">Patients</span>
            <span class="nav-badge">{{ userCount() }}</span>
          </a>

          <a routerLink="/compounder/appointments" routerLinkActive="active-link"
             class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="flex-1">Appointments</span>
            <span class="nav-badge">{{ pendingCount() }}</span>
          </a>

          <a routerLink="/compounder/shifts" routerLinkActive="active-link"
             class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Shifts</span>
          </a>

          <a routerLink="/compounder/shift-history" routerLinkActive="active-link"
             class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Shift History</span>
          </a>

          <div class="pt-4 mt-4 border-t border-slate-100">
            <p class="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Actions</p>
          </div>

          <a routerLink="/compounder/new-user" routerLinkActive="active-link"
             class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>New Patient</span>
          </a>

          <a routerLink="/compounder/new-appointment" routerLinkActive="active-link"
             class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Book Appointment</span>
          </a>
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-slate-100">
          <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 mb-3 border border-emerald-100">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-ring"></div>
              <span class="text-xs font-semibold text-emerald-700">SYSTEM ACTIVE</span>
            </div>
            <p class="text-xs text-slate-600">All services operational</p>
          </div>
          <button (click)="logout()" 
                  class="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto scrollbar-thin">
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
      color: #475569;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
      cursor: pointer;
      text-decoration: none;
    }
    .nav-link:hover {
      background: #f1f5f9;
    }
    .nav-link.active-link {
      background: linear-gradient(to right, #10b981, #0d9488);
      color: white;
      box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
    }
    .nav-link.active-link .nav-badge {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
    .nav-badge {
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #d1fae5;
      color: #047857;
    }
  `]
})
export class CompounderLayoutComponent {
  private userService = inject(UserService);
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);

  userCount = computed(() => this.userService.users().length);
  pendingCount = computed(() => this.appointmentService.pendingAppointments().length);

  logout(): void {
    this.router.navigate(['/login']);
  }
}
