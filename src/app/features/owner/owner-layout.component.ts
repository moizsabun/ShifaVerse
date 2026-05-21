import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen flex bg-gradient-to-br from-slate-50 via-amber-50/20 to-orange-50/30">
      <aside class="w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        <div class="p-6 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
              </svg>
            </div>
            <div>
              <h2 class="font-display text-xl font-bold text-slate-900">{{ auth.currentClinic()?.name ?? 'Clinic' }}</h2>
              <p class="text-xs text-slate-500 font-medium">Owner Portal</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 p-4 space-y-1">
          <a routerLink="/owner/dashboard" routerLinkActive="active-link" class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/owner/staff" routerLinkActive="active-link" class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>Staff</span>
          </a>
          <a routerLink="/owner/billing" routerLinkActive="active-link" class="nav-link">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-4-7 4V5a2 2 0 012-2h10a2 2 0 012 2v16z"/></svg>
            <span>Billing & Invoices</span>
          </a>
        </nav>

        <div class="p-4 border-t border-slate-100">
          <div class="px-4 py-2 mb-2">
            <p class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Signed in</p>
            <p class="text-sm font-semibold text-slate-700 mt-0.5">{{ auth.currentUser()?.name }}</p>
            <p class="text-[11px] text-slate-500">{{ auth.currentUser()?.email }}</p>
          </div>
          <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
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
    .nav-link.active-link { background: linear-gradient(to right, #f59e0b, #ea580c); color: white; box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3); }
  `]
})
export class OwnerLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
