import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen flex bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/30">
      <aside class="w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        <div class="p-6 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <h2 class="font-display text-xl font-bold text-slate-900">MediCare+</h2>
              <p class="text-xs text-slate-500 font-medium">Platform Admin</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 p-4 space-y-1">
          <a routerLink="/admin/dashboard" routerLinkActive="active-link" class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3"/>
            </svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/admin/clinics" routerLinkActive="active-link" class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1"/>
            </svg>
            <span>Clinics</span>
          </a>
          <a routerLink="/admin/billing" routerLinkActive="active-link" class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-4-7 4V5a2 2 0 012-2h10a2 2 0 012 2v16z"/>
            </svg>
            <span>Billing</span>
          </a>
        </nav>

        <div class="p-4 border-t border-slate-100">
          <div class="px-4 py-2 mb-2">
            <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Signed in</p>
            <p class="text-sm font-semibold text-slate-700 mt-0.5">{{ auth.currentUser()?.name }}</p>
          </div>
          <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
      <main class="flex-1 overflow-y-auto scrollbar-thin">
        <div class="p-8 max-w-7xl mx-auto">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    .nav-link { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.75rem; color: #475569; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; text-decoration: none; }
    .nav-link:hover { background: #f1f5f9; }
    .nav-link.active-link { background: linear-gradient(to right, #6366f1, #9333ea); color: white; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3); }
  `]
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
